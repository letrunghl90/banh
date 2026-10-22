import { authedRoute, json } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { createStudentSchema } from '@/modules/account/schema';
import { createStudent, listStudents } from '@/modules/account/students';

export const dynamic = 'force-dynamic';

/** Danh sách hồ sơ con của gia đình (docs/08 M01). */
export const GET = authedRoute(['parent'], async (_req, { actor }) => {
  return json({ items: await listStudents(actor.familyId) });
});

/** Tạo hồ sơ con kèm PIN 4 số (AC-ACC-07). */
export const POST = authedRoute(['parent'], async (req, { actor }) => {
  const input = await parseJsonBody(req, createStudentSchema);
  return json(await createStudent(actor.familyId, input), { status: 201 });
});
