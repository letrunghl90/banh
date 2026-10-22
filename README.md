# Cùng Con Học

Ứng dụng web giúp phụ huynh đồng hành cùng con học Toán và Tiếng Việt lớp 3. Tài liệu phân tích và thiết kế nằm trong [`docs/`](docs/) (01 đến 13).

Trạng thái: **milestone 2**. Đã có nền tảng kỹ thuật và tài khoản phụ huynh (đăng ký bằng email, mã OTP, đăng nhập, đăng xuất, quên mật khẩu). Chưa có hồ sơ con, bài học, bài tập. Xem báo cáo tiến độ ở [`docs/reports/`](docs/reports/).

## Công nghệ

Theo [docs/06](docs/06-system-architecture.md): Next.js 16 (App Router, TypeScript strict) làm cả giao diện và API, PostgreSQL 16 + Prisma, Redis + BullMQ cho việc chạy nền, Vitest cho test.

## Chạy trên máy

Cần: Node.js 22, Docker Desktop (để chạy PostgreSQL và Redis). Trên Windows có thể dùng PowerShell.

```bash
npm install
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
docker compose up -d            # PostgreSQL (ccl_dev, ccl_test) + Redis
npm run db:migrate              # tạo bảng
npm run db:seed                 # dữ liệu mẫu, có nhãn [MẪU]
npm run dev                     # http://localhost:3000
npm run worker                  # tiến trình chạy nền (cửa sổ khác)
```

Tài khoản mẫu sau khi seed: `phuhuynh.mau@example.com` / `MatKhauMau123`, con "[MẪU] Minh Anh" có PIN `1234`. Đăng nhập ở http://localhost:3000/dang-nhap.

Khi chạy trên máy, email (mã OTP) được in ra cửa sổ chạy `npm run dev` (`MAIL_TRANSPORT="console"`). Chế độ này bị chặn khi `NODE_ENV=production`; gửi email thật cần chọn nhà cung cấp (chưa làm). `AUTH_SECRET` trong `.env.example` chỉ dùng trên máy; môi trường thật phải tạo khóa riêng (hướng dẫn trong file).

## Kiểm tra chất lượng

| Lệnh                       | Việc                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run lint`             | ESLint                                                                                      |
| `npm run typecheck`        | TypeScript strict                                                                           |
| `npm run format:check`     | Prettier                                                                                    |
| `npm test`                 | Unit test                                                                                   |
| `npm run test:integration` | Test tích hợp với PostgreSQL và Redis thật (chỉ chạy trên database có chữ `test` trong tên) |
| `npm run build`            | Build production                                                                            |

CI (`.github/workflows/ci.yml`) chạy tất cả các bước trên cho mỗi pull request.

## Cấu trúc thư mục

```
src/
  app/            giao diện và Route Handlers /api/v1
  modules/        nghiệp vụ theo module M01..M11 (thêm dần theo backlog)
  lib/            dùng chung: db, auth (requireActor), policy, errors, logger, validation, rate limit, queue, security
  proxy.ts        CSP có nonce, header bảo mật, CSRF, request id
worker/           tiến trình BullMQ
prisma/           schema, migration, seed
tests/            unit, integration
docs/             tài liệu dự án
```

## Quy ước khi viết API

- Mọi Route Handler khai báo bằng `authedRoute([...chế độ], handler)` (tự gọi `requireActor`) hoặc `publicRoute(handler)`. Route công khai phải được thêm vào danh sách cho phép trong `tests/unit/architecture.test.ts`, nếu không test sẽ đỏ.
- Validate đầu vào bằng zod qua `parseJsonBody` / `parseQuery`.
- Lỗi ném `AppError(code)`; phản hồi lỗi tự có dạng `{ error: { code, message, details?, requestId } }` theo docs/08.
- Dữ liệu gia đình luôn lọc theo `actor.familyId` lấy từ phiên; dữ liệu của gia đình khác trả 404 (`assertSameFamily`).
- Thao tác ghi tới `/api/*` cần header `X-CSRF-Token` bằng giá trị cookie `ccl_csrf`.
