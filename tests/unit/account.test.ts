import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateOtp, hashOtp, otpMatches } from '@/lib/auth/otp';
import { clientIp } from '@/lib/http/client-ip';
import { MemoryRateLimitStore } from '@/lib/rate-limit';
import { authSecret } from '@/lib/secrets';
import { loginSchema, registerSchema } from '@/modules/account/schema';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('mã OTP', () => {
  it('luôn gồm 6 chữ số', () => {
    for (let i = 0; i < 200; i++) expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it('bản băm gắn với đích nhận và mục đích: mã của việc này không dùng cho việc khác', () => {
    const h = hashOtp('a@x.vn', 'verify_email', '123456');
    expect(otpMatches(h, hashOtp('a@x.vn', 'verify_email', '123456'))).toBe(true);
    expect(otpMatches(h, hashOtp('a@x.vn', 'reset_password', '123456'))).toBe(false);
    expect(otpMatches(h, hashOtp('b@x.vn', 'verify_email', '123456'))).toBe(false);
    expect(otpMatches(h, hashOtp('a@x.vn', 'verify_email', '123457'))).toBe(false);
  });

  it('bản băm phụ thuộc khóa bí mật của máy chủ', () => {
    const a = hashOtp('a@x.vn', 'verify_email', '123456', 'k'.repeat(32));
    const b = hashOtp('a@x.vn', 'verify_email', '123456', 'j'.repeat(32));
    expect(a).not.toBe(b);
  });

  it('thiếu AUTH_SECRET hoặc quá ngắn thì báo lỗi, không dùng giá trị mặc định', () => {
    vi.stubEnv('AUTH_SECRET', '');
    expect(() => authSecret()).toThrow(/AUTH_SECRET/);
    vi.stubEnv('AUTH_SECRET', 'ngan');
    expect(() => authSecret()).toThrow(/AUTH_SECRET/);
  });
});

describe('dữ liệu đăng ký, đăng nhập', () => {
  const base = {
    fullName: '  Nguyễn Văn A ',
    email: '  PhuHuynh@Example.COM ',
    password: 'MatKhau123',
    acceptTermsVersion: 'v',
    acceptPrivacyVersion: 'v',
  };

  it('chuẩn hóa email về chữ thường, bỏ khoảng trắng; cắt khoảng trắng họ tên', () => {
    const r = registerSchema.parse(base);
    expect(r.email).toBe('phuhuynh@example.com');
    expect(r.fullName).toBe('Nguyễn Văn A');
  });

  it('mật khẩu dưới 8 ký tự bị từ chối với thông báo tiếng Việt', () => {
    const r = registerSchema.safeParse({ ...base, password: '1234567' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toMatch(/ít nhất 8 ký tự/);
  });

  it('"ghi nhớ đăng nhập" mặc định tắt', () => {
    expect(loginSchema.parse({ email: 'a@b.vn', password: 'x' }).remember).toBe(false);
  });
});

describe('bộ đếm giới hạn tần suất', () => {
  it('peek không tăng bộ đếm, reset xóa bộ đếm, hết cửa sổ thì về 0', async () => {
    let t = 0;
    const store = new MemoryRateLimitStore(() => t);
    await store.hit('k', 60);
    await store.hit('k', 60);
    expect(await store.peek('k')).toBe(2);
    expect(await store.peek('k')).toBe(2);
    await store.reset('k');
    expect(await store.peek('k')).toBe(0);
    await store.hit('k', 60);
    t = 61_000;
    expect(await store.peek('k')).toBe(0);
  });
});

describe('IP người gọi', () => {
  it('lấy IP đầu tiên của X-Forwarded-For, nếu không có thì X-Real-IP', () => {
    const h = (headers: Record<string, string>) => new Request('http://x', { headers });
    expect(clientIp(h({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
    expect(clientIp(h({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
    expect(clientIp(h({}))).toBe('unknown');
  });
});

describe('dữ liệu hồ sơ con', () => {
  it('PIN đúng 4 chữ số', async () => {
    const { pinSchema } = await import('@/modules/account/schema');
    expect(pinSchema.safeParse('0123').success).toBe(true);
    for (const bad of ['123', '12345', '12a4', ' 1234', '١٢٣٤']) {
      expect(pinSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('sửa hồ sơ phải có ít nhất một trường; tên trường rỗng thành null', async () => {
    const { updateStudentSchema } = await import('@/modules/account/schema');
    expect(updateStudentSchema.safeParse({}).success).toBe(false);
    expect(updateStudentSchema.parse({ schoolName: '  ' })).toEqual({ schoolName: null });
  });
});
