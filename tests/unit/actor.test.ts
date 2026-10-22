import { describe, expect, it } from 'vitest';
import {
  actorFromSession,
  requireActor,
  type SessionLookup,
  type SessionRecord,
} from '@/lib/auth/actor';
import { hashSessionToken } from '@/lib/auth/token';

const future = new Date(Date.now() + 60_000);
const past = new Date(Date.now() - 60_000);

function session(over: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 's1',
    mode: 'parent',
    studentId: null,
    expiresAt: future,
    revokedAt: null,
    user: { id: 'u1', familyId: 'f1', status: 'active', deletedAt: null },
    student: null,
    ...over,
  };
}

function reqWithCookie(token?: string) {
  return new Request('http://x/api/v1/me', {
    headers: token ? { cookie: `other=1; ccl_session=${token}` } : {},
  });
}

describe('actorFromSession', () => {
  it('phụ huynh hợp lệ', () => {
    expect(actorFromSession(session())).toEqual({
      mode: 'parent',
      sessionId: 's1',
      userId: 'u1',
      familyId: 'f1',
    });
  });

  it.each([
    ['đã thu hồi', session({ revokedAt: past })],
    ['hết hạn', session({ expiresAt: past })],
    [
      'tài khoản bị khóa',
      session({ user: { id: 'u1', familyId: 'f1', status: 'locked', deletedAt: null } }),
    ],
    [
      'tài khoản đã xóa',
      session({ user: { id: 'u1', familyId: 'f1', status: 'active', deletedAt: past } }),
    ],
    [
      'phụ huynh không có gia đình',
      session({ user: { id: 'u1', familyId: null, status: 'active', deletedAt: null } }),
    ],
    ['học sinh thiếu hồ sơ', session({ mode: 'student', studentId: 'st1', student: null })],
    [
      'học sinh thuộc gia đình khác',
      session({ mode: 'student', studentId: 'st1', student: { familyId: 'f2', deletedAt: null } }),
    ],
    [
      'hồ sơ con đã xóa',
      session({ mode: 'student', studentId: 'st1', student: { familyId: 'f1', deletedAt: past } }),
    ],
  ])('từ chối phiên %s', (_name, s) => {
    expect(actorFromSession(s)).toBeNull();
  });

  it('học sinh hợp lệ', () => {
    const a = actorFromSession(
      session({ mode: 'student', studentId: 'st1', student: { familyId: 'f1', deletedAt: null } }),
    );
    expect(a).toMatchObject({ mode: 'student', studentId: 'st1', familyId: 'f1' });
  });

  it('quản trị không cần gia đình', () => {
    const a = actorFromSession(
      session({
        mode: 'admin',
        user: { id: 'a1', familyId: null, status: 'active', deletedAt: null },
      }),
    );
    expect(a).toEqual({ mode: 'admin', sessionId: 's1', userId: 'a1' });
  });
});

describe('requireActor', () => {
  const lookupFor =
    (s: SessionRecord, token: string): SessionLookup =>
    async (hash) =>
      hash === hashSessionToken(token) ? s : null;

  it('không có cookie: 401', async () => {
    await expect(requireActor(reqWithCookie(), ['parent'], async () => null)).rejects.toMatchObject(
      {
        code: 'UNAUTHENTICATED',
      },
    );
  });

  it('token sai: 401', async () => {
    await expect(
      requireActor(reqWithCookie('sai'), ['parent'], lookupFor(session(), 'dung')),
    ).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('học sinh gọi API chỉ dành cho phụ huynh: 403', async () => {
    const s = session({
      mode: 'student',
      studentId: 'st1',
      student: { familyId: 'f1', deletedAt: null },
    });
    await expect(
      requireActor(reqWithCookie('t'), ['parent'], lookupFor(s, 't')),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('đúng chế độ: trả actor, tra cứu bằng bản băm chứ không bằng token gốc', async () => {
    const seen: string[] = [];
    const actor = await requireActor(reqWithCookie('t'), ['parent'], async (h) => {
      seen.push(h);
      return h === hashSessionToken('t') ? session() : null;
    });
    expect(actor.familyId).toBe('f1');
    expect(seen).toEqual([hashSessionToken('t')]);
    expect(seen[0]).not.toBe('t');
  });
});
