import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { parseJsonBody, parseQuery, parseWith } from '@/lib/validation';

const pinSchema = z.object({ pin: z.string().regex(/^\d{4}$/, 'Mã PIN phải gồm 4 chữ số') });

describe('validation', () => {
  it('trả dữ liệu khi hợp lệ', () => {
    expect(parseWith(pinSchema, { pin: '1234' })).toEqual({ pin: '1234' });
  });

  it('ném VALIDATION_ERROR với chi tiết từng trường', () => {
    try {
      parseWith(pinSchema, { pin: '12a' });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      const e = err as AppError;
      expect(e.code).toBe('VALIDATION_ERROR');
      expect(e.message).toBe('Mã PIN phải gồm 4 chữ số');
      expect(e.details).toEqual([{ field: 'pin', issue: 'invalid_format' }]);
    }
  });

  it('JSON hỏng thành VALIDATION_ERROR', async () => {
    const req = new Request('http://x/api', { method: 'POST', body: '{hỏng' });
    await expect(parseJsonBody(req, pinSchema)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('đọc query string', () => {
    const req = new Request('http://x/api?limit=20');
    expect(parseQuery(req, z.object({ limit: z.coerce.number().max(100) }))).toEqual({ limit: 20 });
  });
});
