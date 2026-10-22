import { describe, expect, it } from 'vitest';
import { AppError, toErrorBody } from '@/lib/errors';

describe('AppError và toErrorBody', () => {
  it('trả đúng định dạng docs/08 kèm requestId', () => {
    const err = new AppError('VALIDATION_ERROR', 'Mã PIN phải gồm 4 chữ số', [
      { field: 'pin', issue: 'format' },
    ]);
    expect(toErrorBody(err, 'req-12345678')).toEqual({
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mã PIN phải gồm 4 chữ số',
          details: [{ field: 'pin', issue: 'format' }],
          requestId: 'req-12345678',
        },
      },
    });
  });

  it.each([
    ['UNAUTHENTICATED', 401],
    ['SUBSCRIPTION_REQUIRED', 402],
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['RATE_LIMITED', 429],
  ] as const)('%s có status %i và thông báo mặc định tiếng Việt', (code, status) => {
    const { status: s, body } = toErrorBody(new AppError(code), 'r');
    expect(s).toBe(status);
    expect(body.error.message.length).toBeGreaterThan(0);
  });

  it('lỗi lạ thành INTERNAL_ERROR và không lộ thông điệp gốc', () => {
    const { status, body } = toErrorBody(new Error('password=abc trong SQL'), 'r1');
    expect(status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).not.toContain('password');
    expect(body.error.requestId).toBe('r1');
  });
});
