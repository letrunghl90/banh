# Báo cáo module: Hồ sơ con và chế độ học sinh (E02, lần 2)

- Ngày: 22/10/2026
- Phạm vi: T-207, T-208. Chưa làm: T-209 (xuất, xóa dữ liệu), lý do ở mục 3.
- Nhánh xây trên phần tài khoản (PR #2).

## 1. Việc đã xong

| Task | Kết quả |
| --- | --- |
| T-207 | API `GET·POST /students`, `PATCH·DELETE /students/{id}`, `POST /students/{id}/pin`. Hồ sơ gồm tên, ảnh đại diện chọn từ bộ có sẵn, trường (không bắt buộc), lớp tự gán lớp 3. PIN đúng 4 chữ số, băm argon2id |
| T-208 | `POST /session/student` (chọn hồ sơ + PIN) và `POST /session/parent` (mật khẩu phụ huynh). Mỗi lần đổi chế độ cấp token phiên mới, thu hồi token cũ, giữ nguyên hạn phiên |
| Giao diện | `/phu-huynh`: danh sách con, thêm, sửa, đổi PIN, xóa. `/chon-ho-so`: "Ai đang học hôm nay?", chọn con và nhập PIN. `/hoc-sinh`: trang tạm của con, nút "Về chế độ phụ huynh" hỏi mật khẩu |

Quyết định thiết kế:

- Sai PIN 5 lần liên tiếp thì khóa hồ sơ đó 15 phút, kể cả khi sau đó nhập đúng. Phụ huynh đổi PIN thì mở khóa ngay. Mỗi lần thử được giữ chỗ nguyên tử trong DB trước khi kiểm tra PIN, nên đoán song song không vượt quá 5 lần.
- Về chế độ phụ huynh sai mật khẩu 5 lần trong 15 phút thì chặn (429), để trẻ không dò được mật khẩu trên máy dùng chung.
- Hồ sơ của gia đình khác trả 404 ở mọi endpoint (không lộ sự tồn tại). Học sinh gọi API phụ huynh trả 403.
- Xóa hồ sơ con: ẩn ngay (`deleted_at`) và đăng xuất mọi phiên học sinh của con. Xóa hẳn sau 30 ngày thuộc T-209.
- Ảnh đại diện: 6 khóa `girl-01..03`, `boy-01..03` (khớp dữ liệu mẫu `girl-01`). Giao diện tạm hiện biểu tượng và màu nền, chờ bộ ảnh của thiết kế (R-08).

Giả định cần chủ dự án xác nhận:

- **Mỗi gia đình tối đa 10 hồ sơ con** (`MAX_STUDENTS_PER_FAMILY`), để chặn tạo hàng loạt. Yêu cầu chưa nêu con số; đổi một hằng số nếu cần.
- MVP chỉ có lớp 3 nên hồ sơ không cho chọn lớp; lớp được gán tự động.

## 2. Kết quả test (chạy thật trên Linux, Node 22, PostgreSQL 16, Redis 7)

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run format:check` | PASS |
| `npm test` (unit) | PASS, 75/75 |
| `npm run test:integration` | PASS, 45/45 (14 test mới), chạy 2 lần liên tiếp |
| `npm run build` | PASS |
| Chromium trên `next start`: đăng nhập → thêm con → "Cho con học" → PIN sai báo lỗi → PIN đúng vào `/hoc-sinh` → mở `/phu-huynh` bị đưa về `/hoc-sinh` → mật khẩu sai báo lỗi → mật khẩu đúng về `/phu-huynh` → đổi PIN → sửa tên → xóa con | PASS |
| CI trên GitHub Actions | NOT RUN (chạy khi PR được mở) |
| Safari iPad | NOT RUN |

Test tích hợp mới: CRUD và PIN được băm; PIN sai định dạng; ảnh đại diện ngoài bộ; chặn gia đình khác (404 cho xem, sửa, xóa, đặt PIN, vào chế độ học sinh); giới hạn 10 con; vào chế độ học sinh cấp token mới, token cũ 401; sai 5 lần khóa 15 phút, đổi PIN mở khóa; hết khóa nhập lại được; 12 lần đoán song song chỉ kiểm tra tối đa 5; học sinh gọi 6 API phụ huynh đều 403; về chế độ phụ huynh cần đúng mật khẩu; sai mật khẩu 5 lần bị 429; xóa con thì phiên học sinh của con 401.

Tiêu chí nghiệm thu:

| Mã | Trạng thái |
| --- | --- |
| AC-ACC-07 | Đạt |
| AC-ACC-08 | Đạt |
| AC-ACC-09 | Đạt với các API phụ huynh hiện có; mỗi API phụ huynh thêm sau phải có test 403 tương ứng |

Lỗi phát hiện và đã sửa trong lần này: thời hạn cookie phiên tính lại theo hạn phiên bị làm tròn xuống (86399 thay vì 86400 giây), test cũ của phần đăng nhập bắt được; đã đổi sang làm tròn lên.

## 3. Lỗi và hạn chế còn tồn tại

- **T-209 chưa làm.** Xuất và xóa dữ liệu phải bao trùm mọi bảng có dữ liệu của con (bài làm, tiến độ, phiên học, camera), nhưng các module đó chưa có. Làm bây giờ sẽ phải sửa lại mỗi khi thêm module. Đề xuất: làm T-209 sau khi có M05 (làm bài) và M06 (tiến độ), kèm test kiểm tra không sót bảng.
- Màn chọn hồ sơ và trang học sinh là bản tạm, chưa theo mockup chi tiết (chưa có thiết kế cho các màn này).
- Chưa có PIN phụ huynh (FR-01-07 ghi "hoặc PIN phụ huynh"); hiện về chế độ phụ huynh bằng mật khẩu.

## 4. Rủi ro

- Phụ huynh quên PIN của con: đổi được ngay ở trang phụ huynh, không cần hỗ trợ.
- Trẻ biết mật khẩu phụ huynh thì vào được chế độ phụ huynh; đây là giới hạn của máy dùng chung (docs/09 mục 1).

## 5. Task tiếp theo

Theo docs/10, milestone 3 tiếp theo là E03 (quản trị và nội dung, bắt đầu T-302 đăng nhập quản trị có TOTP); phần nhập nội dung cần câu trả lời Q-02 (định dạng nội dung). T-209 làm sau M05, M06. T-203, T-205 khi có nhà cung cấp SMS và thông tin OAuth Google.
