import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { clientIp } from '@/lib/http/client-ip';
import { publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { loginSchema } from '@/modules/account/schema';
import { limitByIp, login } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Đăng nhập phụ huynh (docs/08 M01). */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'login', clientIp(req));
  const input = await parseJsonBody(req, loginSchema);
  const session = await login(deps, input, req);
  const res = NextResponse.json({ mode: 'parent' });
  setSessionCookie(res, session);
  return res;
});
