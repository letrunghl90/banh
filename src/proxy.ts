import { NextResponse, type NextRequest } from 'next/server';
import { REQUEST_ID_HEADER } from '@/lib/http/constants';
import {
  createCsrfToken,
  csrfTokensMatch,
  CSRF_COOKIE,
  CSRF_HEADER,
  requiresCsrf,
} from '@/lib/security/csrf';
import { buildCsp, createNonce, securityHeaders } from '@/lib/security/headers';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === 'production';
  const requestId = crypto.randomUUID();

  if (requiresCsrf(request.method, pathname)) {
    const cookie = request.cookies.get(CSRF_COOKIE)?.value;
    if (!csrfTokensMatch(cookie, request.headers.get(CSRF_HEADER))) {
      const res = NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Thiếu hoặc sai mã chống giả mạo (CSRF). Hãy tải lại trang.',
            requestId,
          },
        },
        { status: 403 },
      );
      return withHeaders(res, pathname, isProd, requestId);
    }
  }

  const nonce = createNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === 'development');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);

  if (!request.cookies.get(CSRF_COOKIE)) {
    res.cookies.set(CSRF_COOKIE, createCsrfToken(), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  }
  return withHeaders(res, pathname, isProd, requestId);
}

function withHeaders(res: NextResponse, pathname: string, isProd: boolean, requestId: string) {
  for (const [k, v] of Object.entries(securityHeaders(pathname, isProd))) res.headers.set(k, v);
  res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
