# 09. Thiết kế bảo mật

- Phiên bản: 0.1 (PHASE 02), ngày 22/10/2026
- Phần pháp lý cần luật sư xác nhận. Không kết luận hệ thống "an toàn" trước khi có kiểm thử bảo mật ở PHASE 05.

## 1. Tài sản cần bảo vệ và mối đe dọa

| Tài sản | Mối đe dọa chính | Biện pháp |
| --- | --- | --- |
| Dữ liệu học tập và hồ sơ của trẻ | Phụ huynh gia đình khác xem được (IDOR); quản trị lạm dụng | Lọc theo `family_id` từ phiên; trả 404; audit log cho quản trị |
| Hình ảnh trẻ qua camera | Rò rỉ, ghi lén, lưu trữ trái phép | Xử lý tại máy, không lưu video; WebRTC mã hóa DTLS-SRTP; chỉ phụ huynh cùng gia đình kết nối |
| Tài khoản phụ huynh | Dò mật khẩu, chiếm phiên | Băm argon2id, giới hạn tần suất, OTP, cookie HttpOnly/Secure/SameSite, thu hồi phiên |
| Chế độ phụ huynh trên máy dùng chung | Trẻ tự vào chế độ phụ huynh, đổi cài đặt camera | Về chế độ phụ huynh phải nhập lại mật khẩu |
| Thanh toán | Giả mạo callback, thanh toán trùng | Kiểm tra chữ ký, idempotent, đối soát |
| Đáp án câu hỏi | Học sinh xem đáp án trước khi nộp | Không gửi `answer_key` trước khi nộp; chấm ở server |
| Nội dung có bản quyền | Tải hàng loạt video/PDF | URL ký có hạn ngắn, giới hạn tần suất |
| Tài khoản quản trị | Chiếm quyền toàn hệ thống | Bắt buộc 2FA, phiên ngắn, giới hạn IP (tùy chọn) |

## 2. Xác thực

| Luồng | Thiết kế |
| --- | --- |
| Đăng ký phụ huynh | Email hoặc số điện thoại + mật khẩu tối thiểu 8 ký tự; OTP 6 số hết hạn 10 phút |
| Đăng nhập | Tạo phiên ở server, token ngẫu nhiên 256 bit, lưu dạng băm; cookie hết hạn 30 ngày nếu "ghi nhớ", 1 ngày nếu không |
| Google | OAuth 2.0 Authorization Code + PKCE, kiểm tra `state` và `nonce` |
| Chọn hồ sơ con | Phiên chuyển `mode=student`, gắn `student_id`; PIN 4 số băm, khóa sau 5 lần sai |
| Về chế độ phụ huynh | Nhập lại mật khẩu (hoặc PIN phụ huynh nếu thêm sau) |
| Quản trị | Mật khẩu + TOTP bắt buộc; phiên 8 giờ |
| Đổi mật khẩu | Thu hồi mọi phiên khác |

## 3. Phân quyền (RBAC + phạm vi gia đình)

| Hành động | Phụ huynh | Học sinh | Quản trị |
| --- | --- | --- | --- |
| Xem/sửa hồ sơ con | Con trong gia đình | Chỉ xem của mình | Xem (có audit) |
| Giao, sửa, hủy bài | Có | Không | Không |
| Làm bài, nộp bài | Không | Của mình | Không |
| Chấm tự luận | Con trong gia đình | Không | Không |
| Xem tiến độ, báo cáo | Con trong gia đình | Của mình (bản đơn giản) | Tổng hợp, ẩn danh |
| Bật/tắt camera, xem trực tiếp | Con trong gia đình | Không | Không |
| Thanh toán | Có | Không | Xem, đối soát |
| Quản lý nội dung | Không | Không | Có |

Mọi kiểm tra quyền chạy ở server trong lớp `policy` của từng module. Giao diện ẩn nút chỉ để tiện dùng.

## 4. Bảo vệ ứng dụng web

- Validate mọi đầu vào bằng zod; Prisma dùng truy vấn tham số hóa; truy vấn SQL thô phải được review.
- Nội dung bài học do quản trị soạn: lưu dạng JSON có cấu trúc, render bằng component; nếu có HTML thì làm sạch bằng thư viện allowlist.
- CSRF: cookie `SameSite=Lax` cộng token CSRF cho thao tác ghi.
- Header: `Content-Security-Policy` chặt (không `unsafe-inline` cho script), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` chỉ cho phép camera trên trang phiên học của học sinh.
- Upload: chỉ quản trị; kiểm tra loại file theo nội dung, giới hạn dung lượng (video 2 GB, PDF 50 MB), lưu ở kho riêng tư.
- Log không chứa mật khẩu, OTP, token, PIN, nội dung callback nhạy cảm; che email và số điện thoại.
- Phụ thuộc: khóa phiên bản, quét lỗ hổng (npm audit, Dependabot) trong CI.

## 5. Secret và cấu hình

- Secret (DB, cổng thanh toán, Zalo, email, khóa ký URL) nằm trong trình quản lý secret của môi trường triển khai.
- Repository chỉ có `.env.example` với giá trị giả rõ ràng.
- Khóa của staging và production khác nhau; cổng thanh toán staging dùng sandbox.

## 6. Quyền riêng tư và camera

| Nguyên tắc | Cách thực hiện |
| --- | --- |
| Đồng ý | Đồng ý chung khi đăng ký; đồng ý riêng cho camera và ảnh chụp, có thể rút lại bất kỳ lúc nào |
| Minh bạch với trẻ | Chỉ báo "Camera đang bật" luôn hiển thị; màn giải thích bằng lời dễ hiểu cho trẻ |
| Tối thiểu dữ liệu | Máy chủ chỉ nhận sự kiện dạng số; không nhận diện danh tính khuôn mặt |
| Không lưu video | Xem trực tiếp qua WebRTC, không ghi; nếu module có sẵn gửi video lên máy chủ thì phải sửa trước khi dùng |
| Thời hạn lưu | Sự kiện tập trung 12 tháng (cần chốt); ảnh chụp (nếu có) 7 ngày |
| Xóa | Phụ huynh xóa dữ liệu camera của con trong Cài đặt |
| Đánh giá tác động | Lập hồ sơ trước khi bật camera cho người dùng thật |

## 7. Kiểm tra bắt buộc ở PHASE 05

IDOR giữa hai gia đình trên mọi endpoint có `{id}`; học sinh gọi API phụ huynh; giả mạo callback thanh toán; nhập PIN dò; lộ `answer_key`; XSS qua nội dung bài học; CSRF; header và cookie; URL ký hết hạn; rate limit; kết nối WebRTC trái phép.
