import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { authedRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { enterStudentModeSchema } from '@/modules/account/schema';
import { enterStudentMode } from '@/modules/account/students';

export const dynamic = 'force-dynamic';

/** Vào chế độ học sinh: chọn hồ sơ con và nhập PIN (AC-ACC-08). */
export const POST = authedRoute(['parent'], async (req, { actor }) => {
  const input = await parseJsonBody(req, enterStudentModeSchema);
  const { session, student } = await enterStudentMode({
    sessionId: actor.sessionId,
    familyId: actor.familyId,
    studentId: input.studentId,
    pin: input.pin,
    req,
  });
  const res = NextResponse.json({ mode: 'student', student });
  setSessionCookie(res, session);
  return res;
});
