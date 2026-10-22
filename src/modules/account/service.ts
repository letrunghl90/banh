// M01 Tài khoản: đăng ký, xác thực email, đăng nhập, đăng xuất, quên mật khẩu
// (T-202, T-204, T-206; docs/02 FR-01-01, 03, 04).
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { burnPasswordCheck, hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, revokeAllSessions, type NewSession } from '@/lib/auth/session';
import type { Mailer } from '@/lib/mail';
import { enforceRateLimit, type RateLimitStore } from '@/lib/rate-limit';
import { consumeCode, issueCode } from './codes';
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from './legal';
import type { LoginInput, RegisterInput, ResetPasswordInput } from './schema';

export interface AccountDeps {
  store: RateLimitStore;
  mailer: Mailer;
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Dùng thử miễn phí 30 ngày từ lúc tài khoản được xác thực (D-04, FR-08-01). */
export const TRIAL_DAYS = 30;

const LOGIN_FAIL_LIMIT = 5;
const LOGIN_FAIL_WINDOW_SEC = 15 * 60;

const loginFailKey = (email: string) => `login:fail:${email}`;

/** Giới hạn theo IP cho các API công khai của tài khoản: 10 lần/phút (docs/08 mục 3). */
export async function limitByIp(store: RateLimitStore, action: string, ip: string) {
  await enforceRateLimit(store, { key: `${action}:ip:${ip}`, limit: 10, windowSec: 60 });
}

/**
 * Đăng ký phụ huynh. Tài khoản ở trạng thái `pending` cho tới khi xác thực email; gia đình và
 * thời gian dùng thử chỉ được tạo khi xác thực xong.
 *
 * Đăng ký lại một email chưa xác thực sẽ thay họ tên và mật khẩu, rồi gửi mã mới: người giữ
 * email thật luôn hoàn tất được đăng ký (nếu mật khẩu đã bị người khác đặt, họ dùng "Quên mật
 * khẩu" sau khi xác thực).
 */
export async function register(deps: AccountDeps, input: RegisterInput) {
  if (input.acceptTermsVersion !== CURRENT_TERMS_VERSION) {
    throw new AppError('VALIDATION_ERROR', 'Bạn cần đồng ý điều khoản sử dụng hiện hành', [
      { field: 'acceptTermsVersion', issue: 'outdated' },
    ]);
  }
  if (input.acceptPrivacyVersion !== CURRENT_PRIVACY_VERSION) {
    throw new AppError('VALIDATION_ERROR', 'Bạn cần đồng ý chính sách quyền riêng tư hiện hành', [
      { field: 'acceptPrivacyVersion', issue: 'outdated' },
    ]);
  }

  const now = deps.now ?? new Date();
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, status: true },
  });
  if (existing && existing.status !== 'pending') {
    throw new AppError('CONFLICT', 'Email này đã được đăng ký. Bạn hãy đăng nhập.', [
      { field: 'email', issue: 'taken' },
    ]);
  }

  const passwordHash = await hashPassword(input.password);
  const userId = await prisma.$transaction(async (tx) => {
    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: { fullName: input.fullName, passwordHash },
          select: { id: true },
        })
      : await tx.user.create({
          data: {
            role: 'parent',
            status: 'pending',
            fullName: input.fullName,
            email: input.email,
            passwordHash,
          },
          select: { id: true },
        });
    // Ghi nhận đồng ý (FR-01-04): phiên bản văn bản và thời điểm.
    await tx.consent.deleteMany({
      where: { userId: user.id, type: { in: ['terms', 'privacy'] } },
    });
    await tx.consent.createMany({
      data: [
        { userId: user.id, type: 'terms', documentVersion: CURRENT_TERMS_VERSION, grantedAt: now },
        {
          userId: user.id,
          type: 'privacy',
          documentVersion: CURRENT_PRIVACY_VERSION,
          grantedAt: now,
        },
      ],
    });
    return user.id;
  });

  const { expiresAt } = await issueCode(deps, input.email, 'verify_email');
  return { userId, verification: { channel: 'email' as const, expiresAt } };
}

/**
 * Xác thực email bằng mã OTP. Thành công thì tạo gia đình, bắt đầu 30 ngày dùng thử và đăng
 * nhập luôn (phiên không "ghi nhớ").
 */
export async function verifyEmail(
  deps: Pick<AccountDeps, 'now'>,
  input: { email: string; code: string },
  req?: Request,
): Promise<{ session: NewSession; familyId: string }> {
  const now = deps.now ?? new Date();
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, status: true, fullName: true },
  });
  if (!user || user.status !== 'pending') {
    // Không có mã nào được phát cho trường hợp này; trả cùng thông báo để không lộ tài khoản.
    throw new AppError('VALIDATION_ERROR', 'Mã xác thực đã hết hạn. Hãy bấm "Gửi lại mã".', [
      { field: 'code', issue: 'invalid' },
    ]);
  }

  await consumeCode(input.email, 'verify_email', input.code, now);

  const familyId = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        name: `Gia đình ${user.fullName}`,
        trialStartedAt: now,
        trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_MS),
        status: 'trial',
      },
      select: { id: true },
    });
    const updated = await tx.user.updateMany({
      where: { id: user.id, status: 'pending' },
      data: { status: 'active', emailVerifiedAt: now, familyId: family.id },
    });
    // Hai yêu cầu xác thực song song: yêu cầu thua bị hủy, không tạo gia đình thứ hai.
    if (updated.count === 0) throw new AppError('CONFLICT', 'Tài khoản đã được xác thực');
    return family.id;
  });

  const session = await createSession({
    userId: user.id,
    mode: 'parent',
    remember: false,
    req,
    now,
  });
  return { session, familyId };
}

/** Gửi lại mã xác thực. Luôn trả thành công để không lộ email nào đã đăng ký. */
export async function resendVerification(deps: AccountDeps, email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, select: { status: true } });
  if (user?.status === 'pending') await issueCode(deps, email, 'verify_email');
}

/**
 * Đăng nhập phụ huynh bằng email và mật khẩu. Sai 5 lần trong 15 phút thì tạm khóa đăng nhập
 * của email đó (AC-ACC-02). Tài khoản quản trị đăng nhập ở trang riêng có 2FA (T-302).
 */
export async function login(
  deps: AccountDeps,
  input: LoginInput,
  req?: Request,
): Promise<NewSession> {
  const failKey = loginFailKey(input.email);
  if ((await deps.store.peek(failKey)) >= LOGIN_FAIL_LIMIT) {
    throw new AppError(
      'RATE_LIMITED',
      'Bạn đã đăng nhập sai quá 5 lần. Vui lòng thử lại sau 15 phút hoặc đặt lại mật khẩu.',
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true, status: true, passwordHash: true, deletedAt: true },
  });
  const usable = user && user.role === 'parent' && !user.deletedAt && user.passwordHash;
  const ok = usable
    ? await verifyPassword(user.passwordHash!, input.password)
    : await burnPasswordCheck(input.password);

  if (!ok || !user) {
    await deps.store.hit(failKey, LOGIN_FAIL_WINDOW_SEC);
    throw new AppError('UNAUTHENTICATED', 'Email hoặc mật khẩu không đúng');
  }
  // Chỉ báo trạng thái tài khoản khi mật khẩu đúng, để không lộ thông tin cho người đoán.
  if (user.status === 'pending') {
    throw new AppError(
      'FORBIDDEN',
      'Tài khoản chưa xác thực email. Hãy nhập mã đã gửi tới email.',
      [{ field: 'email', issue: 'unverified' }],
    );
  }
  if (user.status !== 'active') {
    throw new AppError('FORBIDDEN', 'Tài khoản đang bị khóa. Vui lòng liên hệ hỗ trợ.');
  }

  await deps.store.reset(failKey);
  return createSession({
    userId: user.id,
    mode: 'parent',
    remember: input.remember,
    req,
    now: deps.now,
  });
}

/** Quên mật khẩu: gửi mã nếu email thuộc tài khoản đang hoạt động. Luôn trả thành công. */
export async function forgotPassword(deps: AccountDeps, email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, status: true, deletedAt: true },
  });
  if (user && user.role === 'parent' && user.status === 'active' && !user.deletedAt) {
    await issueCode(deps, email, 'reset_password');
  }
}

/** Đặt lại mật khẩu bằng mã. Mọi phiên cũ bị thu hồi (AC-ACC-04). */
export async function resetPassword(deps: AccountDeps, input: ResetPasswordInput): Promise<void> {
  const now = deps.now ?? new Date();
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true, status: true, deletedAt: true },
  });
  if (!user || user.role !== 'parent' || user.status !== 'active' || user.deletedAt) {
    throw new AppError('VALIDATION_ERROR', 'Mã xác thực đã hết hạn. Hãy bấm "Gửi lại mã".', [
      { field: 'code', issue: 'invalid' },
    ]);
  }
  await consumeCode(input.email, 'reset_password', input.code, now);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
  await revokeAllSessions(user.id, now);
  await deps.store.reset(loginFailKey(input.email));
}
