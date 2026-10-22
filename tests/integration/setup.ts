import { existsSync } from 'node:fs';

// Nạp .env nếu có (máy phát triển). Trên CI biến môi trường được đặt sẵn.
if (existsSync('.env')) process.loadEnvFile('.env');
if (process.env.DATABASE_URL_TEST) process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
// Test đọc mã OTP từ hộp thư trong bộ nhớ, kể cả khi .env đặt MAIL_TRANSPORT khác.
process.env.MAIL_TRANSPORT = 'memory';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Thiếu DATABASE_URL_TEST (hoặc DATABASE_URL) cho test tích hợp');
// Chặn chạy nhầm vào database thật.
const dbName = new URL(url).pathname.slice(1);
if (!/test/i.test(dbName)) {
  throw new Error(
    `Test tích hợp chỉ chạy trên database có chữ "test" trong tên, đang là "${dbName}"`,
  );
}
