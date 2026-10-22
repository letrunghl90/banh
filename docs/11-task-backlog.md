# 11. Backlog công việc

- Phiên bản: 0.1 (PHASE 03), ngày 22/10/2026
- Ước tính tính bằng **ngày công lập trình viên** (1 người, 1 ngày làm việc), gồm cả viết test và tự review. Đây là ước tính ban đầu từ phạm vi đã mô tả, chưa có dữ liệu năng suất của đội; sai số dự kiến ±30%. Sẽ ước tính lại sau khi trả lời Q-01, Q-02, Q-09.
- Độ phức tạp: S (≤ 2 ngày), M (3 đến 5 ngày), L (6 đến 10 ngày).
- Cột "AC": mã tiêu chí nghiệm thu ở tài liệu 13. Cột "Test": U unit, I integration, E end-to-end, S security.
- Trạng thái: **Xong** T-101, T-102, T-103 (chờ CI chạy lần đầu), T-104, T-105, T-109, T-201, T-301 (xem docs/reports/m2-01-nen-tang.md); T-202 (phần email), T-204, T-206 (xem docs/reports/e02-01-tai-khoan.md). Các task còn lại: **Chưa bắt đầu**.

## E00. Chốt yêu cầu (milestone 1)

| Mã | Task | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-000 | Trả lời câu hỏi Q-01 đến Q-14 (chủ dự án) | | P0 | không tính | Chậm trả lời làm trễ toàn bộ | | |
| T-001 | Khảo sát module camera có sẵn: chạy thử, đọc mã/tài liệu, viết báo cáo vào tài liệu 05 | T-000 | P0 | M, 3 | Module không chạy được trên trình duyệt | AC-CAM-00 | thử thủ công |
| T-002 | Khảo sát nội dung có sẵn, chốt định dạng file nhập và ánh xạ sang bảng `lessons`, `questions` | T-000 | P0 | M, 3 | Nội dung không có cấu trúc | AC-CNT-00 | |
| T-003 | Chốt thiết kế UI chi tiết cho các màn MVP (thiết kế viên) | T-000 | P1 | ngoài đội dev | Thiếu thiết kế cho màn chưa có mockup | | |

## E01. Nền tảng kỹ thuật (milestone 2)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-101 | Khởi tạo repo Next.js (App Router, TS strict), ESLint, Prettier, cấu trúc thư mục | toàn repo | repo được cấp | P0 | S, 1 | | AC-PLT-01 | build |
| T-102 | Prisma + PostgreSQL, migration đầu tiên, script seed dữ liệu mẫu có nhãn | `prisma/` | T-101 | P0 | S, 2 | | AC-PLT-02 | I |
| T-103 | CI: lint, typecheck, unit, integration (DB tạm), build cho mỗi PR | `.github/` | T-101 | P0 | S, 2 | | AC-PLT-03 | |
| T-104 | Lớp dùng chung: `AppError`, logger có cấu trúc, `requireActor`, khung policy, zod helper, rate limit (Redis) | `src/lib/` | T-102 | P0 | M, 4 | Thiết kế sai lớp quyền ảnh hưởng mọi module | AC-PLT-04 | U, I |
| T-105 | Redis + BullMQ + tiến trình worker | `worker/` | T-101 | P0 | S, 2 | | AC-PLT-05 | I |
| T-106 | Kho file S3 + URL ký có hạn | `src/lib/storage` | T-101 | P1 | S, 2 | | AC-PLT-06 | I |
| T-107 | Môi trường staging, triển khai tự động từ nhánh chính, theo dõi lỗi | hạ tầng | T-103, Q-13 | P0 | M, 4 | Chưa chọn nhà cung cấp | AC-PLT-07 | smoke |
| T-108 | Playwright cho E2E chạy trong CI | `tests/e2e` | T-103 | P1 | S, 2 | | | |
| T-109 | Header bảo mật, CSP, cookie, CSRF | `middleware.ts` | T-104 | P0 | S, 2 | CSP chặn thư viện cần thiết | AC-SEC-01 | S |

## E02. Tài khoản và gia đình (M01)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-201 | Bảng `families`, `users`, `students`, `sessions`, `verification_codes`, `consents` | `prisma/` | T-102 | P0 | S, 1 | | | I |
| T-202 | Đăng ký, OTP email, đăng nhập, đăng xuất, phiên server | `modules/account`, `app/(auth)` | T-104, T-201 | P0 | M, 5 | | AC-ACC-01..03 | U, I, E, S |
| T-203 | OTP qua SMS cho số điện thoại | `modules/account` | T-202, nhà cung cấp SMS | P1 | S, 2 | Chi phí SMS | AC-ACC-01 | I |
| T-204 | Quên/đặt lại mật khẩu | `modules/account` | T-202 | P0 | S, 2 | | AC-ACC-04 | I, E |
| T-205 | Đăng nhập Google | `modules/account` | T-202 | P1 | S, 2 | | AC-ACC-05 | I |
| T-206 | Ghi nhận đồng ý điều khoản, quyền riêng tư (phiên bản văn bản) | `modules/account` | T-202 | P0 | S, 1 | Chưa có văn bản pháp lý | AC-ACC-06 | I |
| T-207 | CRUD hồ sơ con, PIN, chọn ảnh đại diện | `modules/account`, `app/(parent)` | T-202 | P0 | M, 3 | | AC-ACC-07 | U, I, E |
| T-208 | Chuyển chế độ học sinh (chọn hồ sơ + PIN, khóa sau 5 lần) và về chế độ phụ huynh (mật khẩu) | `modules/account` | T-207 | P0 | M, 3 | | AC-ACC-08, 09 | U, I, E, S |
| T-209 | Xuất và xóa dữ liệu của con; xóa tài khoản | `modules/account`, `worker/` | T-207, các module dữ liệu | P0 | M, 4 | Bỏ sót bảng khi xóa | AC-ACC-10 | I |

## E03. Nội dung và quản trị nội dung (M02, M11)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-301 | Bảng nội dung (grades, subjects, topics, lessons, assets, skills, questions, assessments) có version | `prisma/` | T-102, T-002 | P0 | S, 2 | Mô hình không khớp nội dung thật | | I |
| T-302 | Đăng nhập quản trị + TOTP | `modules/admin` | T-202 | P0 | S, 2 | | AC-ADM-01 | I, S |
| T-303 | Màn quản trị: cây môn/chủ đề/bài học, soạn các bước bài học | `app/admin` | T-301, T-302 | P1 | L, 6 | | AC-CNT-01 | E |
| T-304 | Màn quản trị câu hỏi (5 loại), gắn kỹ năng, bộ bài tập | `app/admin` | T-301 | P0 | L, 6 | | AC-CNT-02 | U, E |
| T-305 | Tải lên video/PDF lên kho file | `app/admin` | T-106 | P1 | S, 2 | | AC-CNT-03 | I |
| T-306 | Nhập hàng loạt nội dung có sẵn, báo lỗi từng dòng | `modules/content`, `worker/` | T-002, T-301 | P0 | L, 6 | Định dạng nguồn lộn xộn | AC-CNT-04 | U, I |
| T-307 | Nhập toàn bộ nội dung Toán và Tiếng Việt lớp 3, kiểm tra mẫu | vận hành | T-306 | P0 | M, 3 (dev) + đội nội dung | Lỗi nội dung phát hiện muộn | AC-CNT-05 | thủ công |
| T-308 | Quản trị: tìm gia đình, gia hạn dùng thử, audit log xem dữ liệu trẻ | `modules/admin` | T-202, T-501 | P1 | M, 3 | | AC-ADM-02, 03 | I, S |

## E04. Thư viện và bài học (M03)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-401 | API thư viện: môn, chủ đề, bài học, chi tiết (URL ký) | `modules/library` | T-301 | P1 | M, 3 | | AC-LIB-01 | I, S |
| T-402 | Màn Thư viện khóa học | `app/(student)` | T-401, T-003 | P1 | M, 3 | | AC-LIB-01 | E |
| T-403 | Màn Chi tiết bài học (4 tab, phân trang bước, video) | `app/(student)` | T-401 | P1 | M, 5 | Hiển thị nội dung đa dạng | AC-LIB-02 | E |
| T-404 | Ghi nhận tiến độ xem bài (`lesson_progress`) | `modules/library` | T-401 | P1 | S, 2 | | AC-LIB-03 | U, I |

## E05. Bài tập về nhà và làm bài (M04, M05)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-501 | Bảng `assignments`, `attempts`, `answers` | `prisma/` | T-301 | P0 | S, 1 | | | I |
| T-502 | API giao bài, sửa hạn, hủy (phụ huynh) + màn giao bài từ thư viện | `modules/homework`, `app/(parent)` | T-501, T-401 | P0 | M, 5 | | AC-HW-01..03 | U, I, E, S |
| T-503 | Màn Bài tập về nhà của học sinh (lọc, sắp hạn, tổng quan) | `app/(student)` | T-502 | P0 | M, 3 | | AC-HW-04 | E |
| T-504 | Bộ chấm điểm cho 4 loại câu tự chấm, chuẩn hóa đáp án | `modules/attempt/grading.ts` | T-301 | P0 | M, 3 | Đáp án Tiếng Việt có dấu, nhiều cách viết | AC-ATT-03 | U (bảng ca biên) |
| T-505 | API làm bài: bắt đầu/tiếp tục, lưu câu, nộp (transaction), kết quả | `modules/attempt` | T-501, T-504 | P0 | M, 5 | Mất câu trả lời khi mạng yếu | AC-ATT-01, 02, 04 | U, I, S |
| T-506 | Màn làm bài (bảng câu, lưu tự động, mất mạng) và màn kết quả | `app/(student)` | T-505 | P0 | L, 6 | Trải nghiệm trên máy tính bảng | AC-ATT-01, 05 | E |
| T-507 | Phụ huynh chấm câu tự luận | `modules/attempt`, `app/(parent)` | T-505 | P1 | M, 3 | | AC-ATT-06 | I, E |
| T-508 | Gợi ý bài theo kỹ năng yếu | `modules/homework` | T-602 | P2 | S, 2 | | AC-HW-05 | U |
| T-509 | Lịch học tuần | `modules/homework`, `app/(parent)` | T-207 | P2 | M, 3 | | AC-HW-06 | I, E |

## E06. Tiến độ, phiên học, trang chủ (M06, M09)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-601 | Phiên học, heartbeat, thời gian học, chuỗi ngày | `modules/session` | T-208 | P1 | M, 3 | Múi giờ | AC-PRG-04 | U, I |
| T-602 | Thống kê kỹ năng (`skill_stats`) qua job sau khi nộp; điểm mạnh/yếu | `modules/progress`, `worker/` | T-505 | P1 | M, 3 | | AC-PRG-03 | U, I |
| T-603 | API dashboard học sinh + màn Trang chủ học sinh | `modules/progress`, `app/(student)` | T-601, T-503 | P1 | M, 4 | | AC-PRG-01 | I, E |
| T-604 | API dashboard phụ huynh + màn Trang chủ phụ huynh (chọn con) | `modules/progress`, `app/(parent)` | T-602 | P0 | M, 5 | | AC-PRG-02 | I, E, S |
| T-605 | Màn Kết quả học tập: biểu đồ tuần, hoạt động gần đây (phân trang) | `app/(parent)` | T-604 | P1 | M, 3 | | AC-PRG-05 | E |

## E07. Thông báo (M07)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-701 | Thông báo trong ứng dụng, số chưa đọc | `modules/notify` | T-105 | P1 | M, 3 | | AC-NTF-01 | I, E |
| T-702 | Gửi email (xác thực, báo cáo tuần, nhắc hết dùng thử) | `modules/notify`, `worker/` | T-701 | P1 | S, 2 | Email vào spam | AC-NTF-02 | I |
| T-703 | Zalo ZNS | `modules/notify` | T-701, mẫu tin được duyệt | P2 | M, 3 | Duyệt mẫu tin lâu | AC-NTF-03 | I |
| T-704 | Báo cáo tuần tối Chủ nhật | `worker/` | T-602, T-702 | P1 | S, 2 | | AC-NTF-04 | I |
| T-705 | Cài đặt bật/tắt kênh | `app/(parent)` | T-701 | P2 | S, 1 | | | E |

## E08. Gói và thanh toán (M08)

| Mã | Task | Module/file | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-801 | Bảng `plans`, `subscriptions`, `subscription_students`, `payments`; dùng thử 30 ngày khi tạo gia đình | `modules/billing` | T-201 | P0 | S, 2 | | AC-BIL-01 | U, I |
| T-802 | Tính giá (con đầu 50.000 đ, con sau giảm 20%) | `modules/billing/pricing.ts` | T-801 | P0 | S, 1 | | AC-BIL-02 | U |
| T-803 | Chặn tính năng theo trạng thái gói (chính sách Q-03) | `src/lib/policy` | T-801, Q-03 | P0 | M, 3 | Chặn nhầm người đã trả tiền | AC-BIL-03 | U, I, E |
| T-804 | Tích hợp cổng thanh toán: checkout, callback có chữ ký, idempotent, trang quay về | `modules/billing` | T-802, Q-07 | P0 | L, 6 | Thủ tục cổng chậm; callback lỗi | AC-BIL-04, 05 | I, S |
| T-805 | Đối soát giao dịch treo (job) | `worker/` | T-804 | P1 | S, 2 | | AC-BIL-06 | I |
| T-806 | Màn gói và thanh toán, lịch sử, nhắc gia hạn | `app/(parent)` | T-804 | P1 | M, 3 | | AC-BIL-07 | E |
| T-807 | Quản trị: danh sách giao dịch, thống kê doanh thu | `app/admin` | T-804 | P1 | S, 2 | | AC-ADM-04 | I |

## E09. Kiểm thử, UAT, phát hành MVP (milestone 5 đến 7)

| Mã | Task | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC |
| --- | --- | --- | --- | --- | --- | --- |
| T-901 | Viết tài liệu 14 (chiến lược test), bổ sung E2E cho 6 hành trình chính | E02 đến E08 | P0 | M, 4 | | AC-REL-01 |
| T-902 | Kiểm thử bảo mật theo tài liệu 09 mục 7, viết tài liệu 16 | E02 đến E08 | P0 | M, 5 | Phát hiện lỗi muộn | AC-REL-02 |
| T-903 | Kiểm thử hiệu năng theo NFR-PERF | T-107 | P1 | S, 2 | | AC-REL-03 |
| T-904 | Sửa lỗi sau kiểm thử | T-901..903 | P0 | dự phòng 10 | | |
| T-905 | UAT với chủ dự án và nhóm gia đình thử nghiệm, ghi nhận phản hồi | T-904 | P0 | M, 5 | | AC-REL-04 |
| T-906 | Chuẩn bị production: DNS, HTTPS, secret, sao lưu, diễn tập khôi phục, rollback, smoke test | T-107 | P0 | M, 4 | | AC-REL-05 |
| T-907 | Triển khai production (khi chủ dự án cho phép) | T-905, T-906 | P0 | S, 1 | | AC-REL-06 |

## E10. Camera đồng hành (GĐ2, sau MVP; ước tính lại sau T-001)

| Mã | Task | Phụ thuộc | Ưu tiên | Ước tính | Rủi ro | AC |
| --- | --- | --- | --- | --- | --- | --- |
| T-1001 | Hồ sơ đánh giá tác động, luật sư duyệt | T-001 | P0 | ngoài đội dev | Không được duyệt | AC-CAM-01 |
| T-1002 | Đồng ý riêng cho camera, bật/tắt theo con | T-206 | P0 | S, 2 | | AC-CAM-02 |
| T-1003 | Adapter tích hợp module camera vào phiên học, chỉ báo camera đang bật | T-001, T-601 | P0 | L, 8 | Phụ thuộc module có sẵn | AC-CAM-03, 04 |
| T-1004 | API nhận sự kiện tập trung, báo cáo phiên và tuần | T-1003 | P1 | M, 5 | | AC-CAM-05 |
| T-1005 | Xem trực tiếp WebRTC + TURN, kiểm soát quyền kết nối | T-1003 | P1 | L, 8 | Mạng gia đình chặn kết nối | AC-CAM-06 |
| T-1006 | Thử nghiệm với nhóm nhỏ, kiểm thử bảo mật camera | T-1004, T-1005 | P0 | M, 5 | Phản ứng tiêu cực | AC-CAM-07 |

## Tổng ước tính MVP (E01 đến E09)

| Nhóm | Ngày công |
| --- | --- |
| E01 Nền tảng | 21 |
| E02 Tài khoản | 23 |
| E03 Nội dung | 30 |
| E04 Thư viện | 13 |
| E05 Bài tập, làm bài | 31 |
| E06 Tiến độ | 18 |
| E07 Thông báo | 11 |
| E08 Thanh toán | 19 |
| E09 Kiểm thử, phát hành | 31 |
| E00 khảo sát (dev) | 6 |
| **Tổng** | **khoảng 203** |

Với 2 lập trình viên toàn thời gian, khoảng 100 ngày công mỗi người, tức khoảng 20 tuần làm việc. Với 3 người, khoảng 14 tuần. Con số này lớn hơn ước tính "10 đến 12 tuần" trong tài liệu kế hoạch ban đầu; ước tính ở đây chi tiết hơn và đã gồm kiểm thử, UAT. Cách rút ngắn: bỏ P2 khỏi MVP (T-508, T-509, T-703, T-705, khoảng 9 ngày), dùng giao diện quản trị dựng sẵn (giảm khoảng 6 ngày), hoặc thêm người.
