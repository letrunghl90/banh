# Báo cáo module: Tài khoản phụ huynh (E02, lần 1)

- Ngày: 22/10/2026
- Phạm vi: T-202 (phần email), T-204, T-206. Chưa làm: T-203 (SMS), T-205 (Google), T-207 đến T-209.

## 1. Việc đã xong

| Task | Kết quả |
| --- | --- |
| T-202 | Đăng ký bằng email, mã OTP 6 số gửi qua email, xác thực, đăng nhập, đăng xuất. Phiên lưu ở máy chủ (cookie `ccl_session` HttpOnly, chỉ lưu băm SHA-256 của token), "Ghi nhớ đăng nhập" 30 ngày, không ghi nhớ 1 ngày |
| T-204 | Quên mật khẩu: gửi mã, đặt mật khẩu mới, thu hồi mọi phiên cũ, xóa bộ đếm đăng nhập sai |
| T-206 | Đăng ký phải gửi đúng phiên bản điều khoản và chính sách quyền riêng tư hiện hành; bảng `consents` lưu phiên bản và thời điểm |
| Giao diện | `/dang-nhap`, `/dang-ky`, `/xac-thuc`, `/quen-mat-khau` theo mockup màn đăng nhập; `/phu-huynh` là trang tạm (lời chào, ngày hết dùng thử, nút đăng xuất) |

Quyết định thiết kế:

- Thêm trạng thái `pending` cho `users` (migration `20261022082632_user_status_pending`, chỉ thêm giá trị enum, không đổi dữ liệu cũ). Gia đình và 30 ngày dùng thử chỉ được tạo khi xác thực email xong, để email chưa xác thực không chiếm suất dùng thử.
- Đăng ký lại một email chưa xác thực thì thay họ tên, mật khẩu và gửi mã mới, để người giữ email thật luôn hoàn tất được.
- Mã OTP lưu dạng HMAC-SHA256 với `AUTH_SECRET`, hết hạn sau 10 phút, sai 5 lần thì phải gửi lại mã. Lượt thử được giữ chỗ nguyên tử trong DB, nên đoán song song không vượt quá 5 lần.
- Gửi mã: tối đa 3 lần/10 phút và 10 lần/ngày cho mỗi email. API công khai: 10 lần/phút/IP. Đăng nhập sai 5 lần trong 15 phút thì email đó bị chặn (429).
- Không lộ email nào đã đăng ký: gửi lại mã và quên mật khẩu luôn trả 200; đăng nhập sai trả cùng một thông báo, có băm giả khi email không tồn tại để thời gian phản hồi như nhau. Trạng thái "chưa xác thực" chỉ được báo khi mật khẩu đúng.
- Chỉ tài khoản phụ huynh đăng nhập ở đây. Quản trị đăng nhập ở trang riêng có TOTP (T-302).
- Gửi email: `MAIL_TRANSPORT=console` (in ra màn hình, dùng trên máy) hoặc `memory` (test). `console` bị chặn khi `NODE_ENV=production`, để không âm thầm không gửi mã. Gửi thật cần chọn nhà cung cấp email.

## 2. Kết quả test (chạy thật trên Linux, Node 22, PostgreSQL 16, Redis 7)

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run format:check` | PASS |
| `npm test` (unit) | PASS, 73/73 |
| `npm run test:integration` | PASS, 31/31 (18 test mới cho tài khoản) |
| `npm run build` | PASS |
| `prisma migrate diff` migration so với schema, trên DB trống | PASS, không lệch |
| Chạy thử API trên `next dev`: đăng ký → mã in ra console → xác thực → `/me` có gia đình dùng thử đến 21/11/2026 → đăng xuất → `/me` 401 → đăng nhập lại | PASS |
| Chạy thử trình duyệt (Chromium) trên `next start`: điền form đăng nhập → `/phu-huynh` → đăng xuất về `/dang-nhap?tb=dang-xuat`; không có lỗi CSP | PASS |
| Đăng nhập tài khoản mẫu sau seed | PASS |
| Form đăng ký, xác thực, quên mật khẩu bấm trên trình duyệt | NOT RUN (API phía sau đã có test tích hợp; trang mở được, mã 200) |
| CI trên GitHub Actions | NOT RUN (chạy khi PR được mở) |
| Safari iPad | NOT RUN |

Tiêu chí nghiệm thu:

| Mã | Trạng thái |
| --- | --- |
| AC-ACC-01 | Đạt phần email (đúng mã thì xác thực, sai 5 lần phải gửi lại, hết hạn 10 phút). Phần số điện thoại chờ T-203 |
| AC-ACC-02 | Đạt |
| AC-ACC-03 | Đạt |
| AC-ACC-04 | Đạt |
| AC-ACC-06 | Đạt |
| AC-SEC-01 | Phần cookie phiên HttpOnly, SameSite=Lax, `Secure` khi production: đạt theo test |

## 3. Lỗi và hạn chế còn tồn tại

- Phiên bản điều khoản và chính sách (`src/modules/account/legal.ts`, `2026-11-01`) là giá trị tạm. Cần văn bản pháp lý thật; khi đổi phiên bản, người dùng cũ phải đồng ý lại (chưa làm).
- Chưa có nhà cung cấp gửi email thật, nên chưa đăng ký được trên staging hay production.
- Khi chạy thử phát hiện route xác thực, đăng nhập bị lỗi nếu cấu hình gửi thư không dùng được dù không gửi thư. Đã sửa: chỉ lấy mailer khi thật sự gửi (có unit test).
- Chế độ `next dev` báo lỗi CSP với style nội tuyến của công cụ dev của Next.js; bản build production không có lỗi này.
- AC-BIL-01 ("tạo lại tài khoản cùng email không được dùng thử lần 2") cần làm cùng T-209 (xóa tài khoản) và T-801: hiện email là duy nhất nên chưa tạo lại được.

## 4. Rủi ro

- Gửi email vào thư rác (R-12): cần SPF, DKIM, DMARC khi chọn nhà cung cấp.
- Giới hạn theo IP dựa vào header `X-Forwarded-For`; khi triển khai phải bảo đảm proxy phía trước ghi đè header này, nếu không người dùng có thể giả IP để né giới hạn.

## 5. Task tiếp theo

T-207 (hồ sơ con, PIN), T-208 (chuyển chế độ học sinh/phụ huynh), T-209 (xuất, xóa dữ liệu). T-203 và T-205 làm khi có nhà cung cấp SMS và thông tin OAuth Google. Cần chủ dự án chọn nhà cung cấp email.
