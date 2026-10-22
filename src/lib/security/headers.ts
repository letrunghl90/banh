// Header bảo mật theo docs/09 mục 4 (T-109, AC-SEC-01).

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** CSP chặt: script chỉ chạy khi có nonce, không có 'unsafe-inline' cho script. */
export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Máy phát triển: thanh công cụ dev của Next.js dùng style inline, chặn đi thì nó mất định
    // dạng và làm trang giật. Production vẫn chỉ cho style có nonce.
    isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/**
 * Camera chỉ được phép trên trang phiên học của học sinh (GĐ2). Hiện tại tắt hết.
 */
export function permissionsPolicy(pathname: string): string {
  const cameraAllowed = pathname.startsWith('/hoc-sinh/phien-hoc');
  return [
    `camera=${cameraAllowed ? '(self)' : '()'}`,
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', ');
}

export function securityHeaders(pathname: string, isProd: boolean): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': permissionsPolicy(pathname),
    ...(isProd ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' } : {}),
  };
}
