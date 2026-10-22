import { clientIp } from '@/lib/http/client-ip';
import { json, publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { emailOnlySchema } from '@/modules/account/schema';
import { limitByIp, resendVerification } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Gửi lại mã xác thực email. Luôn trả 200 để không lộ email đã đăng ký. */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'resend', clientIp(req));
  const { email } = await parseJsonBody(req, emailOnlySchema);
  await resendVerification(deps, email);
  return json({ ok: true });
});
