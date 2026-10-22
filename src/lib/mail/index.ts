import { logger } from '../logger';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/**
 * Máy phát triển: in thư ra màn hình để lấy mã OTP. Không dùng logger vì logger che mã OTP.
 */
export class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    process.stdout.write(
      `\n[MAIL] Tới: ${message.to}\n[MAIL] Tiêu đề: ${message.subject}\n${message.text}\n\n`,
    );
  }
}

/** Test: giữ thư trong bộ nhớ để đọc lại mã OTP. */
export class MemoryMailer implements Mailer {
  readonly outbox: MailMessage[] = [];

  async send(message: MailMessage): Promise<void> {
    this.outbox.push(message);
  }

  lastTo(to: string): MailMessage | undefined {
    return this.outbox.findLast((m) => m.to === to);
  }
}

const globalForMail = globalThis as unknown as { mailer?: Mailer };

/**
 * Chọn cách gửi thư theo MAIL_TRANSPORT. Chưa chọn nhà cung cấp email (docs/01 mục 7), nên
 * production chưa có cách gửi thật và sẽ báo lỗi rõ ràng thay vì âm thầm không gửi.
 */
export function getMailer(): Mailer {
  if (globalForMail.mailer) return globalForMail.mailer;
  const transport = process.env.MAIL_TRANSPORT ?? 'console';
  let mailer: Mailer;
  if (transport === 'memory') mailer = new MemoryMailer();
  else if (transport === 'console') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MAIL_TRANSPORT=console không dùng được trên production');
    }
    mailer = new ConsoleMailer();
  } else {
    logger.error('mail_transport_unknown', { transport });
    throw new Error(`MAIL_TRANSPORT không hợp lệ: ${transport}`);
  }
  globalForMail.mailer = mailer;
  return mailer;
}
