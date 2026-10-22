/**
 * Khóa bí mật của máy chủ (HMAC cho mã OTP). Đặt qua biến môi trường AUTH_SECRET,
 * không có giá trị mặc định trong code (nguyên tắc số 6).
 */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Thiếu AUTH_SECRET (tối thiểu 32 ký tự) trong biến môi trường');
  }
  return secret;
}
