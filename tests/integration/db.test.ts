import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db';
import { requireActor } from '@/lib/auth/actor';
import { GET as getMe } from '@/app/api/v1/me/route';
import { GET as getHealth } from '@/app/api/v1/health/route';
import { cleanupTestData, createFamily, createSession, requestWithSession } from './helpers';

const EXPECTED_TABLES = [
  'families',
  'users',
  'students',
  'sessions',
  'verification_codes',
  'consents',
  'grades',
  'subjects',
  'topics',
  'lessons',
  'lesson_assets',
  'skills',
  'questions',
  'question_skills',
  'assessments',
  'assessment_items',
  'content_imports',
];

beforeAll(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

describe('database (AC-PLT-02)', () => {
  it('migration đã tạo đủ bảng tài khoản và nội dung', async () => {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    const names = rows.map((r) => r.table_name);
    for (const t of EXPECTED_TABLES) expect(names).toContain(t);
  });

  it('seed tạo dữ liệu mẫu có nhãn [MẪU] và chạy lại không nhân đôi', async () => {
    const run = () =>
      execFileSync('npx', ['tsx', 'prisma/seed.ts'], { env: process.env, stdio: 'pipe' });
    run();
    run();
    const students = await prisma.student.findMany({
      where: { displayName: { contains: 'Minh Anh' } },
    });
    expect(students).toHaveLength(1);
    expect(students[0]!.displayName.startsWith('[MẪU]')).toBe(true);
    const lessons = await prisma.lesson.findMany({ where: { code: 'SAMPLE-MATH-3-001' } });
    expect(lessons).toHaveLength(1);
    expect(lessons[0]!.title).toContain('[MẪU]');
  });

  it('ràng buộc unique email', async () => {
    const { parent } = await createFamily('uniq');
    await expect(
      prisma.user.create({ data: { role: 'parent', fullName: 'x', email: parent.email } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});

describe('requireActor với phiên thật (AC-PLT-04)', () => {
  it('phụ huynh đăng nhập: /me trả đúng gia đình', async () => {
    const { family, parent } = await createFamily('me-parent');
    const token = await createSession(parent.id, 'parent');
    const res = await getMe(requestWithSession('http://x/api/v1/me', token));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ mode: 'parent', family: { id: family.id }, student: null });
  });

  it('chế độ học sinh: /me trả hồ sơ con', async () => {
    const { parent, student } = await createFamily('me-student');
    const token = await createSession(parent.id, 'student', { studentId: student.id });
    const res = await getMe(requestWithSession('http://x/api/v1/me', token));
    expect(res.status).toBe(200);
    expect((await res.json()).student.id).toBe(student.id);
  });

  it('phiên chế độ học sinh trỏ tới con của gia đình khác bị từ chối', async () => {
    const a = await createFamily('idor-a');
    const b = await createFamily('idor-b');
    const token = await createSession(a.parent.id, 'student', { studentId: b.student.id });
    const res = await getMe(requestWithSession('http://x/api/v1/me', token));
    expect(res.status).toBe(401);
  });

  it('phiên đã thu hồi hoặc hết hạn trả 401 với JSON có requestId', async () => {
    const { parent } = await createFamily('revoked');
    const revoked = await createSession(parent.id, 'parent', { revokedAt: new Date() });
    const expired = await createSession(parent.id, 'parent', {
      expiresAt: new Date(Date.now() - 1000),
    });
    for (const t of [revoked, expired]) {
      const res = await getMe(requestWithSession('http://x/api/v1/me', t));
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe('UNAUTHENTICATED');
      expect(body.error.requestId).toBeTruthy();
    }
  });

  it('học sinh gọi API chỉ dành cho phụ huynh: 403', async () => {
    const { parent, student } = await createFamily('mode');
    const token = await createSession(parent.id, 'student', { studentId: student.id });
    await expect(
      requireActor(requestWithSession('http://x', token), ['parent']),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('health', () => {
  it('trả ok khi database sống', async () => {
    const res = await getHealth(new Request('http://x/api/v1/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', database: 'ok' });
  });
});
