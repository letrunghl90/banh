import { describe, expect, it } from 'vitest';
import { createCsrfToken, csrfTokensMatch, requiresCsrf } from '@/lib/security/csrf';
import { buildCsp, createNonce, permissionsPolicy, securityHeaders } from '@/lib/security/headers';
import { sessionCookieOptions } from '@/lib/auth/cookies';

describe('CSP và header', () => {
  it('CSP production không có unsafe-inline/unsafe-eval cho script, có nonce', () => {
    const csp = buildCsp('abc', false);
    const script = csp.split('; ').find((d) => d.startsWith('script-src'))!;
    expect(script).toContain("'nonce-abc'");
    expect(script).not.toContain('unsafe-inline');
    expect(script).not.toContain('unsafe-eval');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it('nonce khác nhau mỗi lần', () => {
    expect(createNonce()).not.toBe(createNonce());
  });

  it('HSTS chỉ bật trên production; luôn có nosniff và Referrer-Policy', () => {
    expect(securityHeaders('/', true)['Strict-Transport-Security']).toMatch(/max-age=\d+/);
    expect(securityHeaders('/', false)['Strict-Transport-Security']).toBeUndefined();
    expect(securityHeaders('/', false)['X-Content-Type-Options']).toBe('nosniff');
    expect(securityHeaders('/', false)['Referrer-Policy']).toBeDefined();
  });

  it('camera chỉ được phép trên trang phiên học của học sinh', () => {
    expect(permissionsPolicy('/phu-huynh')).toContain('camera=()');
    expect(permissionsPolicy('/hoc-sinh/phien-hoc/1')).toContain('camera=(self)');
  });

  it('cookie phiên HttpOnly, SameSite=Lax, Secure trên production', () => {
    const o = sessionCookieOptions(true);
    expect(o.httpOnly).toBe(true);
    expect(o.sameSite).toBe('lax');
    expect(o.maxAge).toBe(30 * 24 * 3600);
    expect(sessionCookieOptions(false).maxAge).toBe(24 * 3600);
  });
});

describe('CSRF', () => {
  it('chỉ yêu cầu với thao tác ghi tới /api, trừ webhook thanh toán', () => {
    expect(requiresCsrf('POST', '/api/v1/students')).toBe(true);
    expect(requiresCsrf('delete', '/api/v1/assignments/1')).toBe(true);
    expect(requiresCsrf('GET', '/api/v1/me')).toBe(false);
    expect(requiresCsrf('POST', '/dang-nhap')).toBe(false);
    expect(requiresCsrf('POST', '/api/v1/billing/webhooks/vnpay')).toBe(false);
  });

  it('so khớp token', () => {
    const t = createCsrfToken();
    expect(t).toHaveLength(64);
    expect(csrfTokensMatch(t, t)).toBe(true);
    expect(csrfTokensMatch(t, t.slice(0, -1) + (t.endsWith('a') ? 'b' : 'a'))).toBe(false);
    expect(csrfTokensMatch(undefined, t)).toBe(false);
    expect(csrfTokensMatch(t, null)).toBe(false);
    expect(csrfTokensMatch('ngan', 'ngan')).toBe(false);
  });
});
