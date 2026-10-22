import { prisma } from '@/lib/db';
import { createSessionToken, hashSessionToken } from '@/lib/auth/token';
import type { SessionMode } from '@prisma/client';

const DAY = 24 * 60 * 60 * 1000;

/** Tạo một gia đình test gồm phụ huynh và một con. Tên có tiền tố để dọn dẹp. */
export async function createFamily(tag: string) {
  const now = new Date();
  const family = await prisma.family.create({
    data: {
      name: `[TEST] ${tag}`,
      trialStartedAt: now,
      trialEndsAt: new Date(now.getTime() + 30 * DAY),
    },
  });
  const parent = await prisma.user.create({
    data: {
      familyId: family.id,
      role: 'parent',
      fullName: `[TEST] Phụ huynh ${tag}`,
      email: `${tag}-${crypto.randomUUID()}@test.local`,
    },
  });
  const student = await prisma.student.create({
    data: { familyId: family.id, displayName: `[TEST] Con ${tag}` },
  });
  return { family, parent, student };
}

export async function createSession(
  userId: string,
  mode: SessionMode,
  opts: { studentId?: string; expiresAt?: Date; revokedAt?: Date } = {},
) {
  const token = createSessionToken();
  await prisma.session.create({
    data: {
      userId,
      mode,
      studentId: opts.studentId ?? null,
      tokenHash: hashSessionToken(token),
      expiresAt: opts.expiresAt ?? new Date(Date.now() + DAY),
      revokedAt: opts.revokedAt ?? null,
    },
  });
  return token;
}

export function requestWithSession(url: string, token: string) {
  return new Request(url, { headers: { cookie: `ccl_session=${token}` } });
}

export async function cleanupTestData() {
  // Dữ liệu test: gia đình có tên bắt đầu "[TEST]" hoặc người dùng có email @test.local
  // (tài khoản tạo qua API đăng ký).
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@test.local' } },
    select: { id: true, familyId: true, email: true },
  });
  const families = await prisma.family.findMany({
    where: { name: { startsWith: '[TEST]' } },
    select: { id: true },
  });
  const ids = [
    ...new Set([
      ...families.map((f) => f.id),
      ...testUsers.flatMap((u) => (u.familyId ? [u.familyId] : [])),
    ]),
  ];
  const users = await prisma.user.findMany({
    where: { OR: [{ familyId: { in: ids } }, { id: { in: testUsers.map((u) => u.id) } }] },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.consent.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.verificationCode.deleteMany({
    where: { target: { in: testUsers.flatMap((u) => (u.email ? [u.email] : [])) } },
  });
  await prisma.student.deleteMany({ where: { familyId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.family.deleteMany({ where: { id: { in: ids } } });
}
