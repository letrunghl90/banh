import { NextResponse } from 'next/server';
import { clearSessionCookie, revokeSession } from '@/lib/auth/session';
import { authedRoute } from '@/lib/http/route';

export const dynamic = 'force-dynamic';

/** Đăng xuất: thu hồi phiên ở máy chủ và xóa cookie (AC-ACC-03). */
export const POST = authedRoute(['parent', 'student', 'admin'], async (_req, { actor }) => {
  await revokeSession(actor.sessionId);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
});
