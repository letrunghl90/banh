import { AppError } from '@/lib/errors';
import { prisma } from '@/lib/db';
import { generateOtp, hashOtp, OTP_MAX_ATTEMPTS, OTP_TTL_MS, otpMatches } from '@/lib/auth/otp';
import type { Mailer } from '@/lib/mail';
import { enforceRateLimit, type RateLimitStore } from '@/lib/rate-limit';

export type CodePurpose = 'verify_email' | 'reset_password';

const MESSAGES: Record<CodePurpose, (code: string) => { subject: string; text: string }> = {
  verify_email: (code) => ({
    subject: 'Mã xác thực tài khoản Cùng Con Học',
    text: `Mã xác thực của bạn là ${code}. Mã có hiệu lực trong 10 phút.\nNếu bạn không đăng ký tài khoản Cùng Con Học, hãy bỏ qua thư này.`,
  }),
  reset_password: (code) => ({
    subject: 'Mã đặt lại mật khẩu Cùng Con Học',
    text: `Mã đặt lại mật khẩu của bạn là ${code}. Mã có hiệu lực trong 10 phút.\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua thư này; mật khẩu hiện tại vẫn giữ nguyên.`,
  }),
};

/**
 * Tạo mã mới (mã cũ cùng mục đích bị hủy) và gửi qua email.
 * Giới hạn gửi: 3 lần/10 phút và 10 lần/ngày cho mỗi đích (docs/08 mục 3).
 */
export async function issueCode(
  deps: { store: RateLimitStore; mailer: Mailer; now?: Date },
  target: string,
  purpose: CodePurpose,
): Promise<{ expiresAt: Date }> {
  const tooMany = 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau.';
  await enforceRateLimit(deps.store, {
    key: `otp:10m:${target}`,
    limit: 3,
    windowSec: 600,
    message: tooMany,
  });
  await enforceRateLimit(deps.store, {
    key: `otp:day:${target}`,
    limit: 10,
    windowSec: 86_400,
    message: tooMany,
  });

  const now = deps.now ?? new Date();
  const code = generateOtp();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
  await prisma.$transaction([
    prisma.verificationCode.deleteMany({ where: { target, purpose } }),
    prisma.verificationCode.create({
      data: { target, purpose, codeHash: hashOtp(target, purpose, code), expiresAt },
    }),
  ]);
  await deps.mailer.send({ to: target, ...MESSAGES[purpose](code) });
  return { expiresAt };
}

/**
 * Kiểm tra mã. Đúng thì xóa mã (dùng một lần). Sai thì tăng số lần thử; sai quá
 * OTP_MAX_ATTEMPTS lần thì mã hết dùng được, phải gửi lại mã (AC-ACC-01).
 */
export async function consumeCode(
  target: string,
  purpose: CodePurpose,
  code: string,
  now = new Date(),
): Promise<void> {
  const record = await prisma.verificationCode.findFirst({
    where: { target, purpose },
    orderBy: { createdAt: 'desc' },
  });
  const invalid = (message: string) =>
    new AppError('VALIDATION_ERROR', message, [{ field: 'code', issue: 'invalid' }]);

  if (!record || record.expiresAt <= now) {
    throw invalid('Mã xác thực đã hết hạn. Hãy bấm "Gửi lại mã".');
  }
  // Giữ chỗ một lần thử trước khi so mã, bằng một câu lệnh có điều kiện: nhiều yêu cầu đoán
  // song song cũng không vượt quá OTP_MAX_ATTEMPTS lần.
  const reserved = await prisma.verificationCode.updateMany({
    where: { id: record.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (reserved.count === 0) {
    throw invalid('Bạn đã nhập sai quá 5 lần. Hãy bấm "Gửi lại mã".');
  }
  if (!otpMatches(record.codeHash, hashOtp(target, purpose, code))) {
    throw invalid('Mã xác thực không đúng.');
  }
  // deleteMany trả count: hai yêu cầu đồng thời với cùng một mã đúng chỉ một yêu cầu thắng.
  const deleted = await prisma.verificationCode.deleteMany({ where: { id: record.id } });
  if (deleted.count === 0) throw invalid('Mã xác thực đã được sử dụng.');
}
