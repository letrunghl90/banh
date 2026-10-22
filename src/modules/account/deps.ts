import { getMailer } from '@/lib/mail';
import { getRateLimitStore } from '@/lib/rate-limit';
import type { AccountDeps } from './service';

export function defaultAccountDeps(): AccountDeps {
  return {
    store: getRateLimitStore(),
    // Lấy mailer khi thật sự gửi thư: đăng nhập, xác thực không phụ thuộc cấu hình gửi thư.
    get mailer() {
      return getMailer();
    },
  };
}
