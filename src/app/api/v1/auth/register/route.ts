import { clientIp } from '@/lib/http/client-ip';
import { json, publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { registerSchema } from '@/modules/account/schema';
import { limitByIp, register } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Đăng ký phụ huynh (docs/08 M01). */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'register', clientIp(req));
  const input = await parseJsonBody(req, registerSchema);
  const result = await register(deps, input);
  return json(result, { status: 201 });
});
