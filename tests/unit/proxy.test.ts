import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '@/proxy';

const TOKEN = 'a'.repeat(64);

describe('proxy (AC-SEC-01)', () => {
  it('thao tác ghi tới API thiếu token CSRF bị từ chối 403 với JSON đúng định dạng', async () => {
    const res = proxy(new NextRequest('http://localhost/api/v1/students', { method: 'POST' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.requestId).toBeTruthy();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('token CSRF sai bị từ chối', () => {
    const req = new NextRequest('http://localhost/api/v1/students', {
      method: 'POST',
      headers: { cookie: `ccl_csrf=${TOKEN}`, 'x-csrf-token': 'b'.repeat(64) },
    });
    expect(proxy(req).status).toBe(403);
  });

  it('token CSRF khớp thì cho qua', () => {
    const req = new NextRequest('http://localhost/api/v1/students', {
      method: 'POST',
      headers: { cookie: `ccl_csrf=${TOKEN}`, 'x-csrf-token': TOKEN },
    });
    expect(proxy(req).status).toBe(200);
  });

  it('trang có CSP với nonce, header bảo mật và cấp cookie CSRF', () => {
    const res = proxy(new NextRequest('http://localhost/'));
    expect(res.headers.get('content-security-policy')).toMatch(/script-src 'self' 'nonce-[^']+'/);
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const cookie = res.cookies.get('ccl_csrf');
    expect(cookie?.value).toHaveLength(64);
    expect(cookie?.sameSite).toBe('lax');
  });
});
