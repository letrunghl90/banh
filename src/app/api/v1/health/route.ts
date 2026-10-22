import { prisma } from '@/lib/db';
import { json, publicRoute } from '@/lib/http/route';

export const dynamic = 'force-dynamic';

/** Kiểm tra sống cho giám sát và smoke test. Không trả thông tin nội bộ. */
export const GET = publicRoute(async (_req, { log }) => {
  let database: 'ok' | 'error' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    database = 'error';
    log.error('health_db_failed', { err });
  }
  return json(
    { status: database === 'ok' ? 'ok' : 'degraded', database },
    {
      status: database === 'ok' ? 200 : 503,
    },
  );
});
