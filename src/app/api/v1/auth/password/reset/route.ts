import { clientIp } from '@/lib/http/client-ip';
import { json, publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { resetPasswordSchema } from '@/modules/account/schema';
import { limitByIp, resetPassword } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Đặt lại mật khẩu bằng mã; mọi phiên cũ bị thu hồi. */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'reset', clientIp(req));
  const input = await parseJsonBody(req, resetPasswordSchema);
  await resetPassword(deps, input);
  return json({ ok: true });
});
