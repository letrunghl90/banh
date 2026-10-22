// Hồ sơ con, PIN và chuyển chế độ học sinh/phụ huynh (T-207, T-208; FR-01-05..07).
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { rotateSession, type NewSession } from '@/lib/auth/session';
import type { RateLimitStore } from '@/lib/rate-limit';
import type { CreateStudentInput, UpdateStudentInput } from './schema';

/**
 * Giả định (chưa có trong yêu cầu): mỗi gia đình tối đa 10 hồ sơ con, để chặn tạo hàng loạt.
 * Đổi ở đây nếu chủ dự án chốt con số khác.
 */
export const MAX_STUDENTS_PER_FAMILY = 10;

export const PIN_MAX_FAILS = 5;
const PIN_LOCK_MS = 15 * 60 * 1000;

const PARENT_FAIL_LIMIT = 5;
const PARENT_FAIL_WINDOW_SEC = 15 * 60;

const studentSelect = {
  id: true,
  displayName: true,
  avatarKey: true,
  schoolName: true,
  grade: { select: { id: true, name: true } },
} as const;

/** Lớp mặc định của hồ sơ con: MVP chỉ có lớp 3 (D-01). */
async function defaultGradeId(): Promise<string | null> {
  const grade = await prisma.grade.findFirst({ where: { order: 3 }, select: { id: true } });
  return grade?.id ?? null;
}

/** Hồ sơ con còn hoạt động của gia đình; không thuộc gia đình thì 404 (không lộ sự tồn tại). */
async function findOwnStudent(familyId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, familyId, deletedAt: null },
    select: { id: true },
  });
  if (!student) throw new AppError('NOT_FOUND', 'Không tìm thấy hồ sơ của con');
  return student;
}

export async function listStudents(familyId: string) {
  return prisma.student.findMany({
    where: { familyId, deletedAt: null },
    select: studentSelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createStudent(familyId: string, input: CreateStudentInput) {
  const pinHash = await hashPassword(input.pin);
  const gradeId = await defaultGradeId();
  return prisma.$transaction(async (tx) => {
    // Khóa dòng gia đình để hai yêu cầu song song không cùng vượt giới hạn số con.
    await tx.$executeRaw`SELECT 1 FROM families WHERE id = ${familyId}::uuid FOR UPDATE`;
    const count = await tx.student.count({ where: { familyId, deletedAt: null } });
    if (count >= MAX_STUDENTS_PER_FAMILY) {
      throw new AppError('CONFLICT', `Mỗi gia đình có tối đa ${MAX_STUDENTS_PER_FAMILY} hồ sơ con`);
    }
    return tx.student.create({
      data: {
        familyId,
        displayName: input.displayName,
        avatarKey: input.avatarKey,
        schoolName: input.schoolName,
        gradeId,
        pinHash,
      },
      select: studentSelect,
    });
  });
}

export async function updateStudent(
  familyId: string,
  studentId: string,
  input: UpdateStudentInput,
) {
  await findOwnStudent(familyId, studentId);
  return prisma.student.update({
    where: { id: studentId },
    data: {
      displayName: input.displayName,
      avatarKey: input.avatarKey,
      schoolName: input.schoolName,
    },
    select: studentSelect,
  });
}

/**
 * Xóa hồ sơ con: ẩn ngay và đăng xuất các phiên học sinh của con. Dữ liệu học tập được xóa
 * hẳn sau 30 ngày bởi job ở T-209 (AC-ACC-10).
 */
export async function deleteStudent(familyId: string, studentId: string, now = new Date()) {
  await findOwnStudent(familyId, studentId);
  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { deletedAt: now } }),
    prisma.session.updateMany({
      where: { studentId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}

/** Phụ huynh đặt lại PIN của con; đồng thời mở khóa nếu con đang bị khóa vì nhập sai. */
export async function setStudentPin(familyId: string, studentId: string, pin: string) {
  await findOwnStudent(familyId, studentId);
  await prisma.student.update({
    where: { id: studentId },
    data: { pinHash: await hashPassword(pin), pinFailedCount: 0, pinLockedUntil: null },
  });
}

function pinLockedError() {
  return new AppError('RATE_LIMITED', 'Nhập sai PIN quá 5 lần. Thử lại sau 15 phút.');
}

/**
 * Vào chế độ học sinh: chọn hồ sơ con và nhập PIN (AC-ACC-08). Sai 5 lần liên tiếp thì khóa
 * hồ sơ đó 15 phút. Mỗi lần thử được giữ chỗ nguyên tử trước khi kiểm tra PIN, nên đoán song
 * song không vượt quá 5 lần.
 */
export async function enterStudentMode(opts: {
  sessionId: string;
  familyId: string;
  studentId: string;
  pin: string;
  req?: Request;
  now?: Date;
}): Promise<{ session: NewSession; student: { id: string; displayName: string } }> {
  const now = opts.now ?? new Date();
  const { familyId, studentId } = opts;
  const notLocked = { OR: [{ pinLockedUntil: null }, { pinLockedUntil: { lte: now } }] };

  const reserved = await prisma.student.updateMany({
    where: {
      id: studentId,
      familyId,
      deletedAt: null,
      pinFailedCount: { lt: PIN_MAX_FAILS },
      ...notLocked,
    },
    data: { pinFailedCount: { increment: 1 } },
  });
  if (reserved.count === 0) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, familyId, deletedAt: null },
      select: { pinLockedUntil: true },
    });
    if (!student) throw new AppError('NOT_FOUND', 'Không tìm thấy hồ sơ của con');
    if (!student.pinLockedUntil || student.pinLockedUntil <= now) {
      // Đã đủ 5 lần sai nhưng chưa ghi thời điểm khóa (yêu cầu song song): khóa ngay.
      await prisma.student.updateMany({
        where: { id: studentId, ...notLocked },
        data: { pinLockedUntil: new Date(now.getTime() + PIN_LOCK_MS), pinFailedCount: 0 },
      });
    }
    throw pinLockedError();
  }

  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    select: { pinHash: true, pinFailedCount: true, displayName: true },
  });
  if (!student.pinHash) {
    throw new AppError('CONFLICT', 'Hồ sơ này chưa có mã PIN. Phụ huynh hãy đặt PIN trước.');
  }

  if (!(await verifyPassword(student.pinHash, opts.pin))) {
    if (student.pinFailedCount >= PIN_MAX_FAILS) {
      await prisma.student.update({
        where: { id: studentId },
        data: { pinLockedUntil: new Date(now.getTime() + PIN_LOCK_MS), pinFailedCount: 0 },
      });
      throw pinLockedError();
    }
    throw new AppError('VALIDATION_ERROR', 'Mã PIN không đúng', [
      { field: 'pin', issue: 'invalid' },
    ]);
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { pinFailedCount: 0, pinLockedUntil: null },
  });
  const session = await rotateSession({
    sessionId: opts.sessionId,
    mode: 'student',
    studentId,
    req: opts.req,
    now,
  });
  return { session, student: { id: studentId, displayName: student.displayName } };
}

const parentFailKey = (userId: string) => `parent-mode:fail:${userId}`;

/**
 * Về chế độ phụ huynh: nhập lại mật khẩu (AC-ACC-09). Sai 5 lần trong 15 phút thì tạm chặn,
 * để trẻ không dò được mật khẩu trên máy dùng chung.
 */
export async function enterParentMode(opts: {
  store: RateLimitStore;
  sessionId: string;
  userId: string;
  password: string;
  req?: Request;
  now?: Date;
}): Promise<NewSession> {
  const failKey = parentFailKey(opts.userId);
  if ((await opts.store.peek(failKey)) >= PARENT_FAIL_LIMIT) {
    throw new AppError(
      'RATE_LIMITED',
      'Nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.',
    );
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: opts.userId },
    select: { passwordHash: true },
  });
  const ok = user.passwordHash ? await verifyPassword(user.passwordHash, opts.password) : false;
  if (!ok) {
    await opts.store.hit(failKey, PARENT_FAIL_WINDOW_SEC);
    throw new AppError('VALIDATION_ERROR', 'Mật khẩu không đúng', [
      { field: 'password', issue: 'invalid' },
    ]);
  }
  await opts.store.reset(failKey);
  return rotateSession({
    sessionId: opts.sessionId,
    mode: 'parent',
    studentId: null,
    req: opts.req,
    now: opts.now,
  });
}
