// CSRF kiểu double-submit: cookie ccl_csrf (đọc được bằng JS) phải khớp header X-CSRF-Token
// ở mọi thao tác ghi tới /api/v1 (docs/08 phần đầu, docs/09 mục 4).

export const CSRF_COOKIE = 'ccl_csrf';
export const CSRF_HEADER = 'x-csrf-token';

/** Callback từ cổng thanh toán không có cookie, được bảo vệ bằng chữ ký thay cho CSRF. */
export const CSRF_EXEMPT_PREFIXES = ['/api/v1/billing/webhooks/'];

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function requiresCsrf(method: string, pathname: string): boolean {
  if (!WRITE_METHODS.has(method.toUpperCase())) return false;
  if (!pathname.startsWith('/api/')) return false;
  return !CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}

/** So sánh thời gian hằng để không lộ token qua thời gian phản hồi. */
export function csrfTokensMatch(cookie: string | undefined, header: string | null): boolean {
  if (!cookie || !header || cookie.length !== header.length || cookie.length < 32) return false;
  let diff = 0;
  for (let i = 0; i < cookie.length; i++) diff |= cookie.charCodeAt(i) ^ header.charCodeAt(i);
  return diff === 0;
}
