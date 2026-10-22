import type { NextResponse } from 'next/server';
import type { SessionMode } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../errors';
import { clientIp } from '../http/client-ip';
import { SESSION_COOKIE, sessionCookieOptions } from './cookies';
import { createSessionToken, hashSessionToken } from './token';

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Ghi nhớ đăng nhập": 30 ngày, nếu không 1 ngày (docs/09 mục 2). */
export function sessionTtlMs(remember: boolean): number {
  return remember ? 30 * DAY_MS : DAY_MS;
}

export interface NewSession {
  token: string;
  sessionId: string;
  expiresAt: Date;
  remember: boolean;
}

export async function createSession(opts: {
  userId: string;
  mode: SessionMode;
  remember: boolean;
  studentId?: string | null;
  req?: Request;
  now?: Date;
}): Promise<NewSession> {
  const token = createSessionToken();
  const now = opts.now ?? new Date();
  const expiresAt = new Date(now.getTime() + sessionTtlMs(opts.remember));
  const session = await prisma.session.create({
    data: {
      userId: opts.userId,
      mode: opts.mode,
      studentId: opts.studentId ?? null,
      tokenHash: hashSessionToken(token),
      expiresAt,
      ip: opts.req ? clientIp(opts.req) : null,
      userAgent: opts.req?.headers.get('user-agent')?.slice(0, 500) ?? null,
    },
    select: { id: true },
  });
  return { token, sessionId: session.id, expiresAt, remember: opts.remember };
}

/**
 * Đổi chế độ phiên (phụ huynh ⇄ học sinh): thu hồi phiên cũ, cấp token mới, giữ nguyên hạn.
 * Token mới mỗi lần đổi quyền để token cũ (nếu bị lộ) không dùng được cho chế độ mới.
 */
export async function rotateSession(opts: {
  sessionId: string;
  mode: SessionMode;
  studentId: string | null;
  req?: Request;
  now?: Date;
}): Promise<NewSession> {
  const now = opts.now ?? new Date();
  const token = createSessionToken();
  return prisma.$transaction(async (tx) => {
    const old = await tx.session.findUnique({
      where: { id: opts.sessionId },
      select: { userId: true, expiresAt: true, createdAt: true, revokedAt: true },
    });
    const revoked = await tx.session.updateMany({
      where: { id: opts.sessionId, revokedAt: null, expiresAt: { gt: now } },
      data: { revokedAt: now },
    });
    // Hai yêu cầu đổi chế độ song song: chỉ một yêu cầu được đổi.
    if (!old || revoked.count === 0) throw new AppError('UNAUTHENTICATED');
    const created = await tx.session.create({
      data: {
        userId: old.userId,
        mode: opts.mode,
        studentId: opts.studentId,
        tokenHash: hashSessionToken(token),
        expiresAt: old.expiresAt,
        ip: opts.req ? clientIp(opts.req) : null,
        userAgent: opts.req?.headers.get('user-agent')?.slice(0, 500) ?? null,
      },
      select: { id: true },
    });
    return {
      token,
      sessionId: created.id,
      expiresAt: old.expiresAt,
      remember: old.expiresAt.getTime() - old.createdAt.getTime() > DAY_MS,
    };
  });
}

export async function revokeSession(sessionId: string, now = new Date()): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: now },
  });
}

/** Thu hồi mọi phiên còn hiệu lực của người dùng (đổi mật khẩu, khóa tài khoản). */
export async function revokeAllSessions(userId: string, now = new Date()): Promise<number> {
  const res = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: now },
  });
  return res.count;
}

export function setSessionCookie(res: NextResponse, session: NewSession, now = new Date()): void {
  // Cookie hết hạn cùng lúc với phiên (phiên xoay vòng giữ nguyên hạn của phiên cũ).
  const maxAge = Math.max(0, Math.ceil((session.expiresAt.getTime() - now.getTime()) / 1000));
  res.cookies.set(SESSION_COOKIE, session.token, {
    ...sessionCookieOptions(session.remember),
    // maxAge của sessionCookieOptions bị thay bằng thời gian còn lại của phiên.
    maxAge,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(false), maxAge: 0 });
}
