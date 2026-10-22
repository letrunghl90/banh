export const SESSION_COOKIE = 'ccl_session';

const DAY_SECONDS = 24 * 60 * 60;

/** Cookie phiên: HttpOnly, Secure (trừ máy phát triển), SameSite=Lax. */
export function sessionCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: remember ? 30 * DAY_SECONDS : DAY_SECONDS,
  };
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      // Cookie sai định dạng (ví dụ %E0) coi như không có, để trả 401 thay vì 500.
      return undefined;
    }
  }
  return undefined;
}
