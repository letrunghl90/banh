// T-202, T-204, T-206: đăng ký, xác thực email, đăng nhập, đăng xuất, quên mật khẩu.
// Gọi thẳng Route Handler với PostgreSQL và Redis thật; thư được giữ trong MemoryMailer.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { POST as forgotPOST } from '@/app/api/v1/auth/password/forgot/route';
import { POST as resetPOST } from '@/app/api/v1/auth/password/reset/route';
import { POST as loginPOST } from '@/app/api/v1/auth/login/route';
import { POST as logoutPOST } from '@/app/api/v1/auth/logout/route';
import { POST as registerPOST } from '@/app/api/v1/auth/register/route';
import { POST as resendPOST } from '@/app/api/v1/auth/verify/resend/route';
import { POST as verifyPOST } from '@/app/api/v1/auth/verify/route';
import { GET as meGET } from '@/app/api/v1/me/route';
import { prisma } from '@/lib/db';
import { getMailer, MemoryMailer } from '@/lib/mail';
import { getRedis } from '@/lib/redis';
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from '@/modules/account/legal';
import { cleanupTestData, createSession, requestWithSession } from './helpers';

const PASSWORD = 'MatKhauDung123';

function newEmail(tag: string) {
  return `${tag}-${crypto.randomUUID().slice(0, 8)}@test.local`;
}

/** Mỗi test một IP riêng để giới hạn theo IP của test này không ảnh hưởng test khác. */
function newIp() {
  return `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
}

function post(path: string, body: unknown, ip: string, cookie?: string) {
  return new Request(`http://localhost/api/v1${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function sessionCookie(res: Response): { token: string; header: string } {
  const header = res.headers.get('set-cookie') ?? '';
  const token = /ccl_session=([^;]*)/.exec(header)?.[1] ?? '';
  return { token, header };
}

function lastCode(email: string): string {
  const mailer = getMailer() as MemoryMailer;
  const msg = mailer.lastTo(email);
  const code = /\b(\d{6})\b/.exec(msg?.text ?? '')?.[1];
  if (!code) throw new Error(`Không có mã gửi tới ${email}`);
  return code;
}

async function register(email: string, ip: string, extra: Record<string, unknown> = {}) {
  return registerPOST(
    post(
      '/auth/register',
      {
        fullName: '[TEST] Phụ huynh',
        email,
        password: PASSWORD,
        acceptTermsVersion: CURRENT_TERMS_VERSION,
        acceptPrivacyVersion: CURRENT_PRIVACY_VERSION,
        ...extra,
      },
      ip,
    ),
  );
}

/** Đăng ký và xác thực xong, trả token phiên. */
async function registerAndVerify(email: string, ip: string) {
  expect((await register(email, ip)).status).toBe(201);
  const res = await verifyPOST(post('/auth/verify', { email, code: lastCode(email) }, ip));
  expect(res.status).toBe(200);
  return sessionCookie(res).token;
}

beforeAll(async () => {
  expect(getMailer()).toBeInstanceOf(MemoryMailer);
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await getRedis().quit();
});

describe('đăng ký và xác thực email (AC-ACC-01, AC-ACC-06)', () => {
  it('đăng ký tạo tài khoản chờ xác thực, lưu đồng ý, gửi mã; xác thực tạo gia đình dùng thử 30 ngày và đăng nhập luôn', async () => {
    const email = newEmail('dk');
    const ip = newIp();
    const res = await register(`  ${email.toUpperCase()} `, ip);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.verification.channel).toBe('email');

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.status).toBe('pending');
    expect(user.familyId).toBeNull();
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    const consents = await prisma.consent.findMany({ where: { userId: user.id } });
    expect(consents.map((c) => [c.type, c.documentVersion]).sort()).toEqual([
      ['privacy', CURRENT_PRIVACY_VERSION],
      ['terms', CURRENT_TERMS_VERSION],
    ]);

    // Chưa xác thực thì chưa đăng nhập được, kể cả đúng mật khẩu.
    const early = await loginPOST(post('/auth/login', { email, password: PASSWORD }, ip));
    expect(early.status).toBe(403);
    expect((await early.json()).error.details[0].issue).toBe('unverified');

    const verify = await verifyPOST(post('/auth/verify', { email, code: lastCode(email) }, ip));
    expect(verify.status).toBe(200);
    const { token, header } = sessionCookie(verify);
    expect(token.length).toBeGreaterThan(30);
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/SameSite=lax/i);

    const after = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { family: true },
    });
    expect(after.status).toBe('active');
    expect(after.emailVerifiedAt).not.toBeNull();
    const trialMs = after.family!.trialEndsAt.getTime() - after.family!.trialStartedAt.getTime();
    expect(trialMs).toBe(30 * 24 * 60 * 60 * 1000);
    expect(after.family!.status).toBe('trial');

    const me = await meGET(requestWithSession('http://localhost/api/v1/me', token));
    expect(me.status).toBe(200);
    expect((await me.json()).family.id).toBe(after.familyId);
  });

  it('không đồng ý điều khoản hiện hành thì không đăng ký được (AC-ACC-06)', async () => {
    const res = await register(newEmail('dk-cu'), newIp(), { acceptTermsVersion: '2020-01-01' });
    expect(res.status).toBe(400);
    expect((await res.json()).error.details[0].field).toBe('acceptTermsVersion');
  });

  it('mật khẩu ngắn hoặc email sai định dạng trả 400 kèm trường lỗi', async () => {
    const res = await register('khong-phai-email', newIp(), { password: 'ngan' });
    expect(res.status).toBe(400);
    const fields = (await res.json()).error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('email đã xác thực thì đăng ký lại trả 409; email chưa xác thực thì đăng ký lại được và mã cũ hết hiệu lực', async () => {
    const ip = newIp();
    const done = newEmail('dk-trung');
    await registerAndVerify(done, ip);
    expect((await register(done, ip)).status).toBe(409);

    const pending = newEmail('dk-cho');
    await register(pending, ip);
    const oldCode = lastCode(pending);
    await register(pending, ip, { password: 'MatKhauMoi456' });
    const newCode = lastCode(pending);
    if (oldCode !== newCode) {
      const stale = await verifyPOST(post('/auth/verify', { email: pending, code: oldCode }, ip));
      expect(stale.status).toBe(400);
    }
    expect(
      (await verifyPOST(post('/auth/verify', { email: pending, code: newCode }, ip))).status,
    ).toBe(200);
    // Mật khẩu là mật khẩu của lần đăng ký cuối.
    const login = await loginPOST(
      post('/auth/login', { email: pending, password: 'MatKhauMoi456' }, ip),
    );
    expect(login.status).toBe(200);
  });

  it('sai mã 5 lần thì mã bị khóa, kể cả nhập đúng sau đó; gửi lại mã thì dùng được (AC-ACC-01)', async () => {
    const email = newEmail('otp-sai');
    const ip = newIp();
    await register(email, ip);
    const code = lastCode(email);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      const r = await verifyPOST(post('/auth/verify', { email, code: wrong }, ip));
      expect(r.status).toBe(400);
    }
    const locked = await verifyPOST(post('/auth/verify', { email, code }, ip));
    expect(locked.status).toBe(400);
    expect((await locked.json()).error.message).toMatch(/quá 5 lần/);

    expect((await resendPOST(post('/auth/verify/resend', { email }, ip))).status).toBe(200);
    const ok = await verifyPOST(post('/auth/verify', { email, code: lastCode(email) }, ip));
    expect(ok.status).toBe(200);
  });

  it('mã hết hạn sau 10 phút', async () => {
    const email = newEmail('otp-han');
    const ip = newIp();
    await register(email, ip);
    await prisma.verificationCode.updateMany({
      where: { target: email },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const r = await verifyPOST(post('/auth/verify', { email, code: lastCode(email) }, ip));
    expect(r.status).toBe(400);
    expect((await r.json()).error.message).toMatch(/hết hạn/);
  });

  it('mã chỉ dùng được một lần', async () => {
    const email = newEmail('otp-1lan');
    const ip = newIp();
    await register(email, ip);
    const code = lastCode(email);
    expect((await verifyPOST(post('/auth/verify', { email, code }, ip))).status).toBe(200);
    expect((await verifyPOST(post('/auth/verify', { email, code }, ip))).status).toBe(400);
    expect(await prisma.family.count({ where: { users: { some: { email } } } })).toBe(1);
  });

  it('gửi mã quá 3 lần trong 10 phút thì trả 429', async () => {
    const email = newEmail('otp-nhieu');
    const ip = newIp();
    await register(email, ip); // lần gửi 1
    expect((await resendPOST(post('/auth/verify/resend', { email }, ip))).status).toBe(200);
    expect((await resendPOST(post('/auth/verify/resend', { email }, ip))).status).toBe(200);
    expect((await resendPOST(post('/auth/verify/resend', { email }, ip))).status).toBe(429);
  });
});

describe('đăng nhập và đăng xuất (AC-ACC-02, AC-ACC-03)', () => {
  it('đăng nhập đúng tạo phiên; "ghi nhớ" giữ 30 ngày, không ghi nhớ 1 ngày', async () => {
    const email = newEmail('dn');
    const ip = newIp();
    await registerAndVerify(email, ip);

    const short = await loginPOST(post('/auth/login', { email, password: PASSWORD }, ip));
    expect(short.status).toBe(200);
    expect(sessionCookie(short).header).toMatch(/Max-Age=86400/);

    const long = await loginPOST(
      post('/auth/login', { email: email.toUpperCase(), password: PASSWORD, remember: true }, ip),
    );
    expect(long.status).toBe(200);
    expect(sessionCookie(long).header).toMatch(/Max-Age=2592000/);
  });

  it('sai mật khẩu và email không tồn tại trả cùng thông báo 401', async () => {
    const email = newEmail('dn-sai');
    const ip = newIp();
    await registerAndVerify(email, ip);
    const wrong = await loginPOST(post('/auth/login', { email, password: 'SaiMatKhau1' }, ip));
    const missing = await loginPOST(
      post('/auth/login', { email: newEmail('khong-co'), password: 'SaiMatKhau1' }, ip),
    );
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect((await wrong.json()).error.message).toBe((await missing.json()).error.message);
  });

  it('sai 5 lần thì bị giới hạn 429, kể cả nhập đúng ngay sau đó', async () => {
    const email = newEmail('dn-khoa');
    await registerAndVerify(email, newIp());
    for (let i = 0; i < 5; i++) {
      const r = await loginPOST(post('/auth/login', { email, password: 'SaiMatKhau1' }, newIp()));
      expect(r.status).toBe(401);
    }
    const r = await loginPOST(post('/auth/login', { email, password: PASSWORD }, newIp()));
    expect(r.status).toBe(429);
  });

  it('một IP gọi đăng nhập quá 10 lần/phút thì 429', async () => {
    const ip = newIp();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const r = await loginPOST(
        post('/auth/login', { email: newEmail('ip'), password: 'SaiMatKhau1' }, ip),
      );
      statuses.push(r.status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });

  it('tài khoản quản trị không đăng nhập ở trang phụ huynh', async () => {
    const email = newEmail('admin');
    const { hashPassword } = await import('@/lib/auth/password');
    await prisma.user.create({
      data: {
        role: 'admin',
        fullName: '[TEST] Quản trị',
        email,
        passwordHash: await hashPassword(PASSWORD),
      },
    });
    const r = await loginPOST(post('/auth/login', { email, password: PASSWORD }, newIp()));
    expect(r.status).toBe(401);
  });

  it('đăng xuất thu hồi phiên: cookie cũ gọi API trả 401 và cookie bị xóa', async () => {
    const email = newEmail('dx');
    const token = await registerAndVerify(email, newIp());
    const cookie = `ccl_session=${token}`;
    const out = await logoutPOST(post('/auth/logout', {}, newIp(), cookie));
    expect(out.status).toBe(200);
    expect(out.headers.get('set-cookie')).toMatch(/ccl_session=;.*Max-Age=0/i);
    const me = await meGET(requestWithSession('http://localhost/api/v1/me', token));
    expect(me.status).toBe(401);
  });

  it('đăng xuất khi chưa đăng nhập trả 401', async () => {
    expect((await logoutPOST(post('/auth/logout', {}, newIp()))).status).toBe(401);
  });
});

describe('quên và đặt lại mật khẩu (AC-ACC-04)', () => {
  it('đặt lại bằng mã: mật khẩu mới dùng được, mật khẩu cũ không, mọi phiên cũ bị thu hồi', async () => {
    const email = newEmail('qmk');
    const ip = newIp();
    const oldToken = await registerAndVerify(email, ip);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const otherToken = await createSession(user.id, 'parent');

    expect((await forgotPOST(post('/auth/password/forgot', { email }, ip))).status).toBe(200);
    const reset = await resetPOST(
      post(
        '/auth/password/reset',
        { email, code: lastCode(email), newPassword: 'MatKhauMoi789' },
        ip,
      ),
    );
    expect(reset.status).toBe(200);

    for (const t of [oldToken, otherToken]) {
      const me = await meGET(requestWithSession('http://localhost/api/v1/me', t));
      expect(me.status).toBe(401);
    }
    expect((await loginPOST(post('/auth/login', { email, password: PASSWORD }, ip))).status).toBe(
      401,
    );
    expect(
      (await loginPOST(post('/auth/login', { email, password: 'MatKhauMoi789' }, ip))).status,
    ).toBe(200);
  });

  it('email không tồn tại vẫn trả 200 và không gửi thư', async () => {
    const email = newEmail('qmk-khong');
    const mailer = getMailer() as MemoryMailer;
    const before = mailer.outbox.length;
    expect((await forgotPOST(post('/auth/password/forgot', { email }, newIp()))).status).toBe(200);
    expect(mailer.outbox.length).toBe(before);
  });

  it('mã xác thực email không dùng được để đặt lại mật khẩu', async () => {
    const email = newEmail('qmk-cheo');
    const ip = newIp();
    await registerAndVerify(email, ip);
    // Phát mã xác thực email cho chính email này (giả lập mã còn sót) rồi thử dùng để đặt lại.
    await prisma.user.update({ where: { email }, data: { status: 'pending' } });
    await resendPOST(post('/auth/verify/resend', { email }, ip));
    const verifyCode = lastCode(email);
    await prisma.user.update({ where: { email }, data: { status: 'active' } });
    const r = await resetPOST(
      post('/auth/password/reset', { email, code: verifyCode, newPassword: 'MatKhauMoi789' }, ip),
    );
    expect(r.status).toBe(400);
  });
});
