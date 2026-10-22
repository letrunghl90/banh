// T-207, T-208: hồ sơ con, PIN, chuyển chế độ học sinh/phụ huynh (AC-ACC-07, 08, 09).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GET as meGET } from '@/app/api/v1/me/route';
import { POST as parentModePOST } from '@/app/api/v1/session/parent/route';
import { POST as studentModePOST } from '@/app/api/v1/session/student/route';
import { POST as pinPOST } from '@/app/api/v1/students/[id]/pin/route';
import { DELETE as studentDELETE, PATCH as studentPATCH } from '@/app/api/v1/students/[id]/route';
import { GET as studentsGET, POST as studentsPOST } from '@/app/api/v1/students/route';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';
import { getRedis } from '@/lib/redis';
import { MAX_STUDENTS_PER_FAMILY } from '@/modules/account/students';
import { cleanupTestData, createFamily, createSession, requestWithSession } from './helpers';

const PASSWORD = 'MatKhauDung123';

function call(method: string, path: string, token: string, body?: unknown) {
  return new Request(`http://localhost/api/v1${path}`, {
    method,
    headers: {
      cookie: `ccl_session=${token}`,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function newToken(res: Response): string {
  return /ccl_session=([^;]*)/.exec(res.headers.get('set-cookie') ?? '')?.[1] ?? '';
}

/** Gia đình test có phụ huynh đặt mật khẩu và một con có PIN 1234, đang ở chế độ phụ huynh. */
async function setup(tag: string) {
  const f = await createFamily(tag);
  await prisma.user.update({
    where: { id: f.parent.id },
    data: { passwordHash: await hashPassword(PASSWORD) },
  });
  await prisma.student.update({
    where: { id: f.student.id },
    data: { pinHash: await hashPassword('1234') },
  });
  const token = await createSession(f.parent.id, 'parent');
  return { ...f, token };
}

async function enterStudent(token: string, studentId: string, pin: string) {
  return studentModePOST(call('POST', '/session/student', token, { studentId, pin }));
}

beforeAll(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
  await getRedis().quit();
});

describe('hồ sơ con (AC-ACC-07)', () => {
  it('tạo, xem, sửa, xóa; PIN được băm', async () => {
    const { family, token } = await setup('crud');
    const created = await studentsPOST(
      call('POST', '/students', token, {
        displayName: '  Bé Na  ',
        avatarKey: 'girl-02',
        schoolName: 'Tiểu học Kim Đồng',
        pin: '0420',
      }),
    );
    expect(created.status).toBe(201);
    const student = await created.json();
    expect(student).toMatchObject({ displayName: 'Bé Na', avatarKey: 'girl-02' });
    expect(student).not.toHaveProperty('pinHash');

    const row = await prisma.student.findUniqueOrThrow({ where: { id: student.id } });
    expect(row.familyId).toBe(family.id);
    expect(row.pinHash).toMatch(/^\$argon2id\$/);
    expect(row.pinHash).not.toContain('0420');

    const list = await (await studentsGET(call('GET', '/students', token))).json();
    expect(list.items.map((s: { id: string }) => s.id)).toContain(student.id);

    const patched = await studentPATCH(
      call('PATCH', `/students/${student.id}`, token, { displayName: 'Na', schoolName: '' }),
      ctx(student.id),
    );
    expect(patched.status).toBe(200);
    expect(await patched.json()).toMatchObject({ displayName: 'Na', schoolName: null });

    const del = await studentDELETE(
      call('DELETE', `/students/${student.id}`, token),
      ctx(student.id),
    );
    expect(del.status).toBe(200);
    const after = await (await studentsGET(call('GET', '/students', token))).json();
    expect(after.items.map((s: { id: string }) => s.id)).not.toContain(student.id);
    expect(
      (await prisma.student.findUniqueOrThrow({ where: { id: student.id } })).deletedAt,
    ).not.toBeNull();
  });

  it('PIN phải đúng 4 chữ số', async () => {
    const { token } = await setup('pin-format');
    for (const pin of ['123', '12345', 'abcd', '12 4', 1234]) {
      const res = await studentsPOST(
        call('POST', '/students', token, { displayName: 'Bé', avatarKey: 'boy-01', pin }),
      );
      expect(res.status).toBe(400);
      expect((await res.json()).error.details[0].field).toBe('pin');
    }
  });

  it('ảnh đại diện ngoài bộ có sẵn bị từ chối', async () => {
    const { token } = await setup('avatar');
    const res = await studentsPOST(
      call('POST', '/students', token, {
        displayName: 'Bé',
        avatarKey: 'https://x.y/a.png',
        pin: '1111',
      }),
    );
    expect(res.status).toBe(400);
  });

  it('không xem, sửa, xóa, đặt PIN hồ sơ con của gia đình khác (404)', async () => {
    const a = await setup('idor-a');
    const b = await setup('idor-b');
    const list = await (await studentsGET(call('GET', '/students', a.token))).json();
    expect(list.items.map((s: { id: string }) => s.id)).not.toContain(b.student.id);

    const id = b.student.id;
    const patch = await studentPATCH(
      call('PATCH', `/students/${id}`, a.token, { displayName: 'X' }),
      ctx(id),
    );
    const del = await studentDELETE(call('DELETE', `/students/${id}`, a.token), ctx(id));
    const pin = await pinPOST(
      call('POST', `/students/${id}/pin`, a.token, { pin: '9999' }),
      ctx(id),
    );
    const enter = await enterStudent(a.token, id, '1234');
    expect([patch.status, del.status, pin.status, enter.status]).toEqual([404, 404, 404, 404]);
    const row = await prisma.student.findUniqueOrThrow({ where: { id } });
    expect(row.displayName).not.toBe('X');
    expect(row.deletedAt).toBeNull();
  });

  it(`tối đa ${MAX_STUDENTS_PER_FAMILY} hồ sơ con mỗi gia đình`, async () => {
    const { family, token } = await setup('max');
    await prisma.student.createMany({
      data: Array.from({ length: MAX_STUDENTS_PER_FAMILY - 1 }, (_, i) => ({
        familyId: family.id,
        displayName: `[TEST] Con ${i}`,
      })),
    });
    const res = await studentsPOST(
      call('POST', '/students', token, { displayName: 'Thêm', avatarKey: 'boy-02', pin: '1111' }),
    );
    expect(res.status).toBe(409);
  });
});

describe('chế độ học sinh (AC-ACC-08, 09)', () => {
  it('PIN đúng vào chế độ học sinh với token mới; token cũ bị thu hồi', async () => {
    const { student, token } = await setup('enter');
    const res = await enterStudent(token, student.id, '1234');
    expect(res.status).toBe(200);
    const studentToken = newToken(res);
    expect(studentToken).not.toBe('');
    expect(studentToken).not.toBe(token);

    const me = await (
      await meGET(requestWithSession('http://localhost/api/v1/me', studentToken))
    ).json();
    expect(me).toMatchObject({ mode: 'student', student: { id: student.id } });
    expect((await meGET(requestWithSession('http://localhost/api/v1/me', token))).status).toBe(401);
  });

  it('sai PIN 5 lần thì khóa 15 phút, kể cả PIN đúng; phụ huynh đặt lại PIN thì mở khóa', async () => {
    const { student, token } = await setup('lock');
    for (let i = 0; i < 4; i++) {
      expect((await enterStudent(token, student.id, '0000')).status).toBe(400);
    }
    expect((await enterStudent(token, student.id, '0000')).status).toBe(429);
    expect((await enterStudent(token, student.id, '1234')).status).toBe(429);
    const row = await prisma.student.findUniqueOrThrow({ where: { id: student.id } });
    const lockMs = row.pinLockedUntil!.getTime() - Date.now();
    expect(lockMs).toBeGreaterThan(14 * 60 * 1000);
    expect(lockMs).toBeLessThanOrEqual(15 * 60 * 1000);

    const reset = await pinPOST(
      call('POST', `/students/${student.id}/pin`, token, { pin: '5678' }),
      ctx(student.id),
    );
    expect(reset.status).toBe(200);
    expect((await enterStudent(token, student.id, '1234')).status).toBe(400);
    expect((await enterStudent(token, student.id, '5678')).status).toBe(200);
  });

  it('hết thời gian khóa thì nhập lại được', async () => {
    const { student, token } = await setup('unlock');
    await prisma.student.update({
      where: { id: student.id },
      data: { pinLockedUntil: new Date(Date.now() - 1000), pinFailedCount: 0 },
    });
    expect((await enterStudent(token, student.id, '1234')).status).toBe(200);
  });

  it('đoán PIN song song không vượt quá 5 lần thử', async () => {
    const { student, token } = await setup('parallel');
    const guesses = Array.from({ length: 12 }, (_, i) => `00${String(i).padStart(2, '0')}`);
    const results = await Promise.all(guesses.map((pin) => enterStudent(token, student.id, pin)));
    const checked = results.filter((r) => r.status === 400).length;
    expect(checked).toBeLessThanOrEqual(5);
    expect(results.every((r) => r.status === 400 || r.status === 429)).toBe(true);
  });

  it('chế độ học sinh gọi API phụ huynh bị 403', async () => {
    const { student, token } = await setup('forbid');
    const studentToken = newToken(await enterStudent(token, student.id, '1234'));
    const id = student.id;
    const statuses = [
      (await studentsGET(call('GET', '/students', studentToken))).status,
      (
        await studentsPOST(
          call('POST', '/students', studentToken, {
            displayName: 'X',
            avatarKey: 'boy-01',
            pin: '1111',
          }),
        )
      ).status,
      (
        await studentPATCH(
          call('PATCH', `/students/${id}`, studentToken, { displayName: 'X' }),
          ctx(id),
        )
      ).status,
      (await studentDELETE(call('DELETE', `/students/${id}`, studentToken), ctx(id))).status,
      (await pinPOST(call('POST', `/students/${id}/pin`, studentToken, { pin: '1111' }), ctx(id)))
        .status,
      (await enterStudent(studentToken, id, '1234')).status,
    ];
    expect(statuses).toEqual([403, 403, 403, 403, 403, 403]);
  });

  it('về chế độ phụ huynh phải nhập đúng mật khẩu', async () => {
    const { student, token } = await setup('back');
    const studentToken = newToken(await enterStudent(token, student.id, '1234'));

    const wrong = await parentModePOST(
      call('POST', '/session/parent', studentToken, { password: 'sai-mat-khau' }),
    );
    expect(wrong.status).toBe(400);
    const ok = await parentModePOST(
      call('POST', '/session/parent', studentToken, { password: PASSWORD }),
    );
    expect(ok.status).toBe(200);
    const parentToken = newToken(ok);
    const me = await (
      await meGET(requestWithSession('http://localhost/api/v1/me', parentToken))
    ).json();
    expect(me).toMatchObject({ mode: 'parent', student: null });
    expect(
      (await meGET(requestWithSession('http://localhost/api/v1/me', studentToken))).status,
    ).toBe(401);
  });

  it('nhập sai mật khẩu phụ huynh 5 lần thì bị chặn 429', async () => {
    const { student, token } = await setup('back-limit');
    const studentToken = newToken(await enterStudent(token, student.id, '1234'));
    for (let i = 0; i < 5; i++) {
      const res = await parentModePOST(
        call('POST', '/session/parent', studentToken, { password: 'sai' }),
      );
      expect(res.status).toBe(400);
    }
    const blocked = await parentModePOST(
      call('POST', '/session/parent', studentToken, { password: PASSWORD }),
    );
    expect(blocked.status).toBe(429);
  });

  it('phụ huynh không gọi được API về chế độ phụ huynh (đã ở chế độ phụ huynh)', async () => {
    const { token } = await setup('already-parent');
    const res = await parentModePOST(
      call('POST', '/session/parent', token, { password: PASSWORD }),
    );
    expect(res.status).toBe(403);
  });

  it('xóa hồ sơ con thì phiên học sinh của con bị đăng xuất', async () => {
    const f = await setup('del-session');
    const studentToken = newToken(await enterStudent(f.token, f.student.id, '1234'));
    const otherParentToken = await createSession(f.parent.id, 'parent');
    const del = await studentDELETE(
      call('DELETE', `/students/${f.student.id}`, otherParentToken),
      ctx(f.student.id),
    );
    expect(del.status).toBe(200);
    expect(
      (await meGET(requestWithSession('http://localhost/api/v1/me', studentToken))).status,
    ).toBe(401);
  });
});
