import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { authSecret } from '../secrets';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
/** Sai quá số lần này thì mã bị vô hiệu, phải gửi lại mã (AC-ACC-01). */
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, '0');
}

/**
 * Mã 6 số dễ dò nếu chỉ băm SHA-256, nên băm bằng HMAC với khóa bí mật của máy chủ,
 * gắn với đích nhận và mục đích để mã của việc này không dùng được cho việc khác.
 */
export function hashOtp(target: string, purpose: string, code: string, secret = authSecret()) {
  return createHmac('sha256', secret).update(`${purpose}\n${target}\n${code}`).digest('hex');
}

export function otpMatches(expectedHash: string, actualHash: string): boolean {
  const a = Buffer.from(expectedHash, 'hex');
  const b = Buffer.from(actualHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
