import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { clientIp } from '@/lib/http/client-ip';
import { publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { verifySchema } from '@/modules/account/schema';
import { limitByIp, verifyEmail } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Xác thực email bằng mã OTP, thành công thì đăng nhập luôn. */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'verify', clientIp(req));
  const input = await parseJsonBody(req, verifySchema);
  const { session, familyId } = await verifyEmail({}, input, req);
  const res = NextResponse.json({ mode: 'parent', familyId });
  setSessionCookie(res, session);
  return res;
});
