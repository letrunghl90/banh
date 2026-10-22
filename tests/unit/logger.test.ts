import { describe, expect, it } from 'vitest';
import { createLogger, maskEmail, maskPhone, redact } from '@/lib/logger';

describe('logger', () => {
  it('che mật khẩu, OTP, token, PIN, email và số điện thoại', () => {
    const out = redact({
      password: 'secret1',
      otp: '123456',
      sessionToken: 'tok',
      pin: '1234',
      email: 'nguyenvana@example.com',
      phone: '0912345678',
      nested: { authorization: 'Bearer x', ok: 'giữ nguyên' },
    });
    expect(out).toEqual({
      password: '[REDACTED]',
      otp: '[REDACTED]',
      sessionToken: '[REDACTED]',
      pin: '[REDACTED]',
      email: 'n***@example.com',
      phone: '***678',
      nested: { authorization: '[REDACTED]', ok: 'giữ nguyên' },
    });
  });

  it('ghi một dòng JSON, lọc theo mức log, child kế thừa trường', () => {
    const lines: string[] = [];
    const log = createLogger({ service: 'test' }, (l) => lines.push(l), 'info');
    log.debug('bỏ qua');
    log.child({ requestId: 'r1' }).info('xin chào', { pin: '0000' });
    expect(lines).toHaveLength(1);
    const rec = JSON.parse(lines[0]!);
    expect(rec).toMatchObject({
      level: 'info',
      msg: 'xin chào',
      service: 'test',
      requestId: 'r1',
      pin: '[REDACTED]',
    });
    expect(typeof rec.time).toBe('string');
  });

  it('mask xử lý giá trị lạ', () => {
    expect(maskEmail('khongphaiemail')).toBe('***');
    expect(maskPhone('12')).toBe('***');
  });
});
