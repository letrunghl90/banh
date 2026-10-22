import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { authedRoute } from '@/lib/http/route';
import { getRateLimitStore } from '@/lib/rate-limit';
import { parseJsonBody } from '@/lib/validation';
import { enterParentModeSchema } from '@/modules/account/schema';
import { enterParentMode } from '@/modules/account/students';

export const dynamic = 'force-dynamic';

/** Về chế độ phụ huynh: nhập lại mật khẩu (AC-ACC-09). */
export const POST = authedRoute(['student'], async (req, { actor }) => {
  const { password } = await parseJsonBody(req, enterParentModeSchema);
  const session = await enterParentMode({
    store: getRateLimitStore(),
    sessionId: actor.sessionId,
    userId: actor.userId,
    password,
    req,
  });
  const res = NextResponse.json({ mode: 'parent' });
  setSessionCookie(res, session);
  return res;
});
