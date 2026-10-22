import { prisma } from '@/lib/db';
import { json, authedRoute } from '@/lib/http/route';

export const dynamic = 'force-dynamic';

/** Thông tin phiên hiện tại (docs/08 M01). Trạng thái gói được thêm ở T-801. */
export const GET = authedRoute(['parent', 'student', 'admin'], async (_req, { actor }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: actor.userId },
    select: { id: true, fullName: true, role: true },
  });
  if (actor.mode === 'admin') return json({ mode: actor.mode, user, family: null, student: null });

  const family = await prisma.family.findUniqueOrThrow({
    where: { id: actor.familyId },
    select: { id: true, name: true, status: true, trialEndsAt: true },
  });
  const student =
    actor.mode === 'student'
      ? await prisma.student.findFirstOrThrow({
          where: { id: actor.studentId, familyId: actor.familyId, deletedAt: null },
          select: { id: true, displayName: true, avatarKey: true },
        })
      : null;
  return json({ mode: actor.mode, user, family, student });
});
