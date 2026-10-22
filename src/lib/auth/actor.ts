import { AppError } from '../errors';
import { prisma } from '../db';
import { readCookie, SESSION_COOKIE } from './cookies';
import { hashSessionToken } from './token';

export type ActorMode = 'parent' | 'student' | 'admin';

export type Actor =
  | { mode: 'parent'; sessionId: string; userId: string; familyId: string }
  | { mode: 'student'; sessionId: string; userId: string; familyId: string; studentId: string }
  | { mode: 'admin'; sessionId: string; userId: string };

/** Dữ liệu tối thiểu cần để dựng Actor từ một phiên. */
export interface SessionRecord {
  id: string;
  mode: ActorMode;
  studentId: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  user: {
    id: string;
    familyId: string | null;
    role: 'parent' | 'admin';
    status: string;
    deletedAt: Date | null;
  };
  student: { familyId: string; deletedAt: Date | null } | null;
}

export type SessionLookup = (tokenHash: string) => Promise<SessionRecord | null>;

export const prismaSessionLookup: SessionLookup = (tokenHash) =>
  prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      mode: true,
      studentId: true,
      expiresAt: true,
      revokedAt: true,
      user: { select: { id: true, familyId: true, role: true, status: true, deletedAt: true } },
      student: { select: { familyId: true, deletedAt: true } },
    },
  });

/** Dựng Actor từ phiên; trả null nếu phiên không còn dùng được. */
export function actorFromSession(s: SessionRecord, now: Date = new Date()): Actor | null {
  if (s.revokedAt || s.expiresAt <= now) return null;
  if (s.user.status !== 'active' || s.user.deletedAt) return null;
  // Phòng thủ nhiều lớp: chế độ phiên phải khớp vai trò tài khoản.
  if ((s.mode === 'admin') !== (s.user.role === 'admin')) return null;

  if (s.mode === 'admin') return { mode: 'admin', sessionId: s.id, userId: s.user.id };

  const familyId = s.user.familyId;
  if (!familyId) return null;

  if (s.mode === 'parent') return { mode: 'parent', sessionId: s.id, userId: s.user.id, familyId };

  // Chế độ học sinh: hồ sơ con phải còn và thuộc đúng gia đình của phụ huynh.
  if (!s.studentId || !s.student || s.student.deletedAt || s.student.familyId !== familyId) {
    return null;
  }
  return { mode: 'student', sessionId: s.id, userId: s.user.id, familyId, studentId: s.studentId };
}

/**
 * Bắt buộc gọi ở mọi handler cần đăng nhập (docs/06 mục 4).
 * Không có phiên hợp lệ: 401. Sai chế độ (ví dụ học sinh gọi API phụ huynh): 403.
 */
export async function requireActor<M extends ActorMode>(
  req: Request,
  modes: readonly M[],
  lookup: SessionLookup = prismaSessionLookup,
): Promise<Extract<Actor, { mode: M }>> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) throw new AppError('UNAUTHENTICATED');

  const session = await lookup(hashSessionToken(token));
  const actor = session ? actorFromSession(session) : null;
  if (!actor) throw new AppError('UNAUTHENTICATED');

  if (!(modes as readonly ActorMode[]).includes(actor.mode)) throw new AppError('FORBIDDEN');
  return actor as Extract<Actor, { mode: M }>;
}
