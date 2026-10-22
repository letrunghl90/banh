import { createHash, randomBytes } from 'node:crypto';

/** Token phiên ngẫu nhiên 256 bit (docs/09 mục 2). Chỉ trả về trình duyệt qua cookie. */
export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Database chỉ lưu bản băm SHA-256 của token. */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
