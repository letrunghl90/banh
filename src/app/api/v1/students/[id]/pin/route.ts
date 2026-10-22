import { authedRoute, json } from '@/lib/http/route';
import { parseJsonBody, parseWith } from '@/lib/validation';
import { setPinSchema, studentIdParamSchema } from '@/modules/account/schema';
import { setStudentPin } from '@/modules/account/students';

export const dynamic = 'force-dynamic';

/** Phụ huynh đặt lại PIN của con, đồng thời mở khóa nếu con nhập sai quá nhiều lần. */
export const POST = authedRoute(['parent'], async (req, { actor, params }) => {
  const { id } = parseWith(studentIdParamSchema, params);
  const { pin } = await parseJsonBody(req, setPinSchema);
  await setStudentPin(actor.familyId, id, pin);
  return json({ ok: true });
});
