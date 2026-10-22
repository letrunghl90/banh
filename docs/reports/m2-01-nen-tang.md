# Báo cáo module: Nền tảng kỹ thuật (milestone 2, lần 1)

- Ngày: 22/10/2026
- Phạm vi: T-101, T-102, T-103, T-104, T-105, T-109 (E01), T-201, T-301 (bảng dữ liệu)

## 1. Việc đã xong

| Task | Kết quả |
| --- | --- |
| T-101 | Next.js 16.4.2 (App Router), TypeScript strict (thêm `noUncheckedIndexedAccess`), ESLint 9 (cấu hình Next), Prettier, cấu trúc thư mục theo docs/06 |
| T-102 | Prisma 6.19.3 + PostgreSQL 16, migration đầu tiên `init`, seed dữ liệu mẫu có nhãn `[MẪU]`, chạy lại không nhân đôi |
| T-201 | Bảng `families`, `users`, `students`, `sessions` (chỉ lưu băm token), `verification_codes`, `consents` |
| T-301 | Bảng `grades`, `subjects`, `topics`, `lessons`, `lesson_assets`, `skills`, `questions` (có `version`), `question_skills`, `assessments`, `assessment_items` (lưu `question_version`), `content_imports`. Có thể đổi sau khi xem nội dung thật (Q-02) |
| T-104 | `AppError` và định dạng lỗi docs/08; logger JSON che mật khẩu, OTP, token, PIN, email, số điện thoại; `requireActor`; `authedRoute`/`publicRoute`; khung `definePolicy`, `assertSameFamily` (trả 404); helper zod; rate limit Redis |
| T-105 | BullMQ: hàng đợi `system`, job thử `system.ping`, thử lại tối đa 3 lần; tiến trình `worker/` tắt êm khi nhận SIGTERM |
| T-109 | `src/proxy.ts`: CSP có nonce (không `unsafe-inline` cho script), HSTS (production), nosniff, Referrer-Policy, Permissions-Policy (camera chỉ ở trang phiên học), X-Frame-Options; CSRF double-submit cho mọi thao tác ghi `/api/*` (trừ webhook thanh toán) |
| T-103 | `.github/workflows/ci.yml`: format, lint, typecheck, unit, migration trên DB trống, so khớp schema với migration, integration (Postgres + Redis thật), build, `npm audit` |
| Khác | `GET /api/v1/health` (công khai), `GET /api/v1/me` (P, S, A); `docker-compose.yml` cho Postgres + Redis |

## 2. Kết quả test (chạy thật trong môi trường Linux, Node 22, PostgreSQL 16, Redis 7)

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run format:check` | PASS |
| `npm test` (unit) | PASS, 60/60 |
| `npm run test:integration` | PASS, 13/13 |
| `npm run build` | PASS |
| `prisma migrate deploy` trên DB trống + `migrate diff` | PASS, không lệch |
| Smoke test `next start`: header CSP/HSTS/nosniff, cookie CSRF, `/health`, `/me` 401, POST thiếu CSRF 403 | PASS |
| Worker khởi động và tắt êm | PASS |
| CI trên GitHub Actions | NOT RUN (chạy khi PR được mở) |
| `docker compose up` | NOT RUN (môi trường kiểm tra không có Docker) |
| Chạy trên Windows | NOT RUN |

Tiêu chí nghiệm thu: AC-PLT-01, 02, 04, 05 đạt theo test trên. AC-PLT-03 đạt khi CI xanh và bật branch protection cho `main`. AC-SEC-01 đạt phần header, cookie CSRF và từ chối 403; cờ `Secure` của cookie phiên đã cấu hình, sẽ kiểm khi có đăng nhập (T-202).

## 3. Lỗi và hạn chế còn tồn tại

- `npm audit`: 3 lỗi mức high trong `prisma` CLI (qua `@prisma/config` → `deepmerge-ts`), chỉ ảnh hưởng công cụ dòng lệnh khi đọc cấu hình, không chạy trong ứng dụng. Bản sửa là Prisma 7 (thay đổi lớn về cấu hình); đề xuất nâng cấp thành task riêng. Công cụ dev (vitest 3, eslint-config-next) cũng có cảnh báo, không đi vào bản build.
- Vitest 4 không cài được do lỗi giải quyết phụ thuộc của npm; đang dùng Vitest 3.2.7.
- Gate milestone 2 "staging chạy được trang trống có đăng nhập" chưa đạt: cần T-202 (đăng nhập) và T-107 (staging, chờ Q-13 chọn nhà cung cấp).
- Chưa làm: T-106 (kho file S3, chờ chọn nhà cung cấp), T-107, T-108 (Playwright).

## 4. Rủi ro

- Mô hình bảng nội dung có thể phải sửa khi có nội dung thật (Q-02).
- Prisma 6 sẽ hết hỗ trợ; khóa `package.json#prisma` đã bị đánh dấu deprecated.

## 5. Task tiếp theo

T-202 (đăng ký, OTP email, đăng nhập, đăng xuất) để đạt gate milestone 2; sau đó T-207, T-208. Song song: chủ dự án trả lời Q-01, Q-02 (cần trước phần nội dung), Q-13 (hạ tầng staging).
