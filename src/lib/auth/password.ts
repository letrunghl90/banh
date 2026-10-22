import { hash, verify } from '@node-rs/argon2';

// argon2id với tham số tối thiểu OWASP khuyến nghị (docs/09 mục 2).
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Khi không tìm thấy tài khoản vẫn tốn thời gian băm như bình thường, để thời gian phản hồi
 * không lộ email nào đã đăng ký.
 */
export async function burnPasswordCheck(plain: string): Promise<false> {
  dummyHash ??= hashPassword('khong-dung-mat-khau-nay');
  await verifyPassword(await dummyHash, plain);
  return false;
}
