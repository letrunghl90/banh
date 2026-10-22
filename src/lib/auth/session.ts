import type { NextResponse } from 'next/server';
import type { SessionMode } from '@prisma/client';
import { prisma } from '../db';
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

export function setSessionCookie(res: NextResponse, session: NewSession): void {
  res.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.remember));
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(false), maxAge: 0 });
}
