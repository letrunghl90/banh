import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { authedRoute, json, publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';

describe('publicRoute / authedRoute', () => {
  it('lỗi AppError thành JSON thống nhất kèm requestId ở body và header', async () => {
    const handler = publicRoute(async () => {
      throw new AppError('CONFLICT', 'Bài đã bắt đầu, không hủy được');
    });
    const res = await handler(
      new Request('http://x/api/v1/t', { headers: { 'x-request-id': 'abcd1234-ef' } }),
    );
    expect(res.status).toBe(409);
    expect(res.headers.get('x-request-id')).toBe('abcd1234-ef');
    expect(await res.json()).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Bài đã bắt đầu, không hủy được',
        requestId: 'abcd1234-ef',
      },
    });
  });

  it('lỗi validate trả 400 kèm details', async () => {
    const handler = publicRoute(async (req) => {
      const body = await parseJsonBody(req, z.object({ pin: z.string().length(4) }));
      return json(body);
    });
    const res = await handler(
      new Request('http://x', { method: 'POST', body: JSON.stringify({ pin: '1' }) }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.details[0].field).toBe('pin');
  });

  it('lỗi lạ trả 500 không lộ chi tiết, requestId được tạo nếu thiếu', async () => {
    const handler = publicRoute(async () => {
      throw new Error('bí mật nội bộ');
    });
    const res = await handler(new Request('http://x'));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('bí mật');
    expect(body.error.requestId).toMatch(/[0-9a-f-]{36}/);
  });

  it('authedRoute không có cookie trả 401 và không chạy handler', async () => {
    let ran = false;
    const handler = authedRoute(['parent'], async () => {
      ran = true;
      return json({});
    });
    const res = await handler(new Request('http://x/api/v1/me'));
    expect(res.status).toBe(401);
    expect(ran).toBe(false);
  });

  it('truyền params từ Next.js', async () => {
    const handler = publicRoute(async (_req, { params }) => json(params));
    const res = await handler(new Request('http://x'), { params: Promise.resolve({ id: '42' }) });
    expect(await res.json()).toEqual({ id: '42' });
  });
});

describe('readCookie', () => {
  it('cookie sai định dạng trả undefined, không ném lỗi', async () => {
    const { readCookie } = await import('@/lib/auth/cookies');
    const req = new Request('http://x', { headers: { cookie: 'ccl_session=%E0; a=b%20c' } });
    expect(readCookie(req, 'ccl_session')).toBeUndefined();
    expect(readCookie(req, 'a')).toBe('b c');
  });
});
