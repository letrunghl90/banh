import { authedRoute, json } from '@/lib/http/route';
import { parseJsonBody, parseWith } from '@/lib/validation';
import { studentIdParamSchema, updateStudentSchema } from '@/modules/account/schema';
import { deleteStudent, updateStudent } from '@/modules/account/students';

export const dynamic = 'force-dynamic';

/** Sửa hồ sơ con. Hồ sơ của gia đình khác trả 404. */
export const PATCH = authedRoute(['parent'], async (req, { actor, params }) => {
  const { id } = parseWith(studentIdParamSchema, params);
  const input = await parseJsonBody(req, updateStudentSchema);
  return json(await updateStudent(actor.familyId, id, input));
});

/** Xóa hồ sơ con (ẩn ngay, xóa hẳn sau 30 ngày ở T-209). */
export const DELETE = authedRoute(['parent'], async (_req, { actor, params }) => {
  const { id } = parseWith(studentIdParamSchema, params);
  await deleteStudent(actor.familyId, id);
  return json({ ok: true });
});
