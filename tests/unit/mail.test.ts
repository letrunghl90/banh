import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  delete (globalThis as { mailer?: unknown }).mailer;
});

describe('chọn cách gửi email', () => {
  it('production không cho dùng console (tránh âm thầm không gửi mã)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MAIL_TRANSPORT', 'console');
    const { getMailer } = await import('@/lib/mail');
    expect(() => getMailer()).toThrow(/production/);
  });

  it('memory giữ thư để đọc lại', async () => {
    vi.stubEnv('MAIL_TRANSPORT', 'memory');
    const { getMailer, MemoryMailer } = await import('@/lib/mail');
    const mailer = getMailer();
    expect(mailer).toBeInstanceOf(MemoryMailer);
    await mailer.send({ to: 'a@b.vn', subject: 's', text: 'Mã 123456' });
    expect((mailer as InstanceType<typeof MemoryMailer>).lastTo('a@b.vn')?.text).toContain(
      '123456',
    );
  });

  it('giá trị lạ thì báo lỗi', async () => {
    vi.stubEnv('MAIL_TRANSPORT', 'smtp-chua-co');
    const { getMailer } = await import('@/lib/mail');
    expect(() => getMailer()).toThrow(/MAIL_TRANSPORT/);
  });

  it('đăng nhập, xác thực không cần cấu hình gửi thư (mailer chỉ lấy khi gửi)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MAIL_TRANSPORT', 'console');
    const { defaultAccountDeps } = await import('@/modules/account/deps');
    const deps = defaultAccountDeps();
    expect(deps.store).toBeDefined();
    expect(() => deps.mailer).toThrow(/production/);
  });
});
