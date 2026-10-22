import { clientIp } from '@/lib/http/client-ip';
import { json, publicRoute } from '@/lib/http/route';
import { parseJsonBody } from '@/lib/validation';
import { defaultAccountDeps } from '@/modules/account/deps';
import { emailOnlySchema } from '@/modules/account/schema';
import { forgotPassword, limitByIp } from '@/modules/account/service';

export const dynamic = 'force-dynamic';

/** Quên mật khẩu: gửi mã đặt lại. Luôn trả 200 để không lộ email đã đăng ký. */
export const POST = publicRoute(async (req) => {
  const deps = defaultAccountDeps();
  await limitByIp(deps.store, 'forgot', clientIp(req));
  const { email } = await parseJsonBody(req, emailOnlySchema);
  await forgotPassword(deps, email);
  return json({ ok: true });
});
