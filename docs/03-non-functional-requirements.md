# 03. Yêu cầu phi chức năng

- Phiên bản: 0.1 (PHASE 01), ngày 22/10/2026
- Các con số dưới đây là mục tiêu đề xuất cho MVP. Chúng cần chủ dự án xác nhận và sẽ được đo bằng test thật ở PHASE 05, không phải cam kết đã đạt.

## 1. Quy mô và hiệu năng

| Mã | Yêu cầu | Mục tiêu MVP |
| --- | --- | --- |
| NFR-PERF-01 | Số gia đình | 5.000 gia đình, 8.000 học sinh trong năm đầu (giả định A-10) |
| NFR-PERF-02 | Người dùng đồng thời giờ cao điểm (19:00 đến 21:00) | 1.000 |
| NFR-PERF-03 | Thời gian phản hồi API đọc thông thường | p95 dưới 300 ms tại máy chủ |
| NFR-PERF-04 | Lưu câu trả lời và chấm câu tự động | p95 dưới 500 ms |
| NFR-PERF-05 | Tải trang lần đầu trên 4G, máy tính bảng tầm trung | LCP dưới 2,5 giây |
| NFR-PERF-06 | Video bài giảng | Phát qua CDN, có nhiều mức chất lượng, bắt đầu phát dưới 3 giây |
| NFR-PERF-07 | Danh sách dài (bài tập, hoạt động, giao dịch) | Có phân trang; truy vấn có index |

## 2. Khả dụng và vận hành

| Mã | Yêu cầu | Mục tiêu MVP |
| --- | --- | --- |
| NFR-OPS-01 | Thời gian hoạt động | 99,5% mỗi tháng |
| NFR-OPS-02 | Sao lưu cơ sở dữ liệu | Hằng ngày, giữ 30 ngày, có sao lưu liên tục để khôi phục về thời điểm (PITR) |
| NFR-OPS-03 | Mục tiêu khôi phục | RPO dưới 15 phút, RTO dưới 4 giờ |
| NFR-OPS-04 | Diễn tập khôi phục | Ít nhất 1 lần trước khi lên production, sau đó mỗi quý |
| NFR-OPS-05 | Môi trường | Local, CI, staging, production tách biệt; staging không dùng dữ liệu thật của trẻ |
| NFR-OPS-06 | Giám sát | Theo dõi lỗi, log có cấu trúc, cảnh báo khi lỗi 5xx hoặc thanh toán lỗi tăng |
| NFR-OPS-07 | Triển khai | Có quy trình rollback; migration phải tương thích ngược |
| NFR-OPS-08 | Bảo trì | Thông báo trước cho phụ huynh, không bảo trì 18:00 đến 22:00 |

## 3. Bảo mật

| Mã | Yêu cầu |
| --- | --- |
| NFR-SEC-01 | HTTPS toàn bộ, HSTS; cookie phiên `HttpOnly`, `Secure`, `SameSite` |
| NFR-SEC-02 | Mật khẩu băm bằng argon2id hoặc bcrypt; PIN học sinh băm và giới hạn số lần nhập sai (5 lần thì khóa 15 phút) |
| NFR-SEC-03 | Phân quyền kiểm tra ở máy chủ theo gia đình: phụ huynh chỉ truy cập con của mình; học sinh chỉ truy cập dữ liệu của chính mình (chống IDOR) |
| NFR-SEC-04 | Kiểm tra dữ liệu đầu vào ở mọi API bằng schema; chống injection, XSS; nội dung soạn thảo được làm sạch trước khi hiển thị |
| NFR-SEC-05 | Giới hạn tần suất cho đăng nhập, OTP, quên mật khẩu, nhập PIN |
| NFR-SEC-06 | Secret nằm trong trình quản lý secret của môi trường, không nằm trong repository |
| NFR-SEC-07 | Quản trị viên bắt buộc xác thực 2 lớp; mọi thao tác xem dữ liệu trẻ được ghi nhật ký |
| NFR-SEC-08 | Thanh toán: chỉ tin callback có chữ ký hợp lệ từ cổng; xử lý idempotent theo mã giao dịch |
| NFR-SEC-09 | Không lưu số thẻ hoặc thông tin thanh toán nhạy cảm; để cổng thanh toán xử lý |
| NFR-SEC-10 | File tải lên: giới hạn loại và dung lượng; truy cập file riêng qua URL ký có hạn |

## 4. Quyền riêng tư dữ liệu trẻ em

Phần pháp lý dưới đây dựa trên hiểu biết chung, **cần luật sư xác nhận** trước khi lên production.

| Mã | Yêu cầu |
| --- | --- |
| NFR-PRIV-01 | Tuân thủ quy định bảo vệ dữ liệu cá nhân của Việt Nam (Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân); trẻ từ đủ 7 tuổi cần sự đồng ý của cả cha mẹ và trẻ |
| NFR-PRIV-02 | Thu thập tối thiểu: không bắt buộc ngày sinh đầy đủ, địa chỉ, ảnh thật của trẻ; ảnh đại diện chọn từ bộ có sẵn |
| NFR-PRIV-03 | Không quảng cáo, không bán hoặc chia sẻ dữ liệu cho bên thứ ba ngoài nhà cung cấp hạ tầng cần thiết |
| NFR-PRIV-04 | Không có tính năng nhắn tin giữa trẻ với người ngoài gia đình |
| NFR-PRIV-05 | Phụ huynh xuất và xóa dữ liệu của con; dữ liệu xóa khỏi hệ thống chính trong 30 ngày, khỏi bản sao lưu theo vòng quay sao lưu |
| NFR-PRIV-06 | Camera: video không lưu lên máy chủ; máy chủ chỉ nhận sự kiện dạng chữ; không nhận diện danh tính khuôn mặt (cần kiểm chứng với module có sẵn) |
| NFR-PRIV-07 | Có hồ sơ đánh giá tác động xử lý dữ liệu cá nhân, đặc biệt cho camera, trước khi bật camera cho người dùng thật |
| NFR-PRIV-08 | Vị trí lưu dữ liệu (trong nước hay nước ngoài) theo tư vấn của luật sư |
| NFR-PRIV-09 | Công cụ phân tích hành vi tự lưu trữ hoặc không gửi dữ liệu nhận dạng trẻ ra ngoài |

## 5. Khả dụng cho người dùng (usability)

| Mã | Yêu cầu |
| --- | --- |
| NFR-UX-01 | Hỗ trợ trình duyệt: Chrome, Edge, Safari, Firefox 2 phiên bản gần nhất; iPad và máy tính bảng Android 10 inch trở lên |
| NFR-UX-02 | Bố cục đáp ứng từ 768 px; điện thoại hiển thị được nhưng không tối ưu trong MVP |
| NFR-UX-03 | Giao diện học sinh: chữ tối thiểu 16 px, nút bấm tối thiểu 44 px, ít chữ, có biểu tượng |
| NFR-UX-04 | Toàn bộ giao diện tiếng Việt; định dạng ngày dd/mm/yyyy, tiền VNĐ, múi giờ Asia/Ho_Chi_Minh |
| NFR-UX-05 | Mọi màn hình có trạng thái đang tải, trống, lỗi và thông báo lỗi dễ hiểu |
| NFR-UX-06 | Độ tương phản màu đạt WCAG 2.1 mức AA |

## 6. Bảo trì và mở rộng

| Mã | Yêu cầu |
| --- | --- |
| NFR-MNT-01 | Mã nguồn TypeScript, có lint, kiểm tra kiểu, test tự động chạy trong CI |
| NFR-MNT-02 | Cấu trúc module theo nghiệp vụ (M01 đến M11), để thêm môn, khối lớp, vai trò giáo viên mà không viết lại |
| NFR-MNT-03 | Khối lớp và môn là dữ liệu, không hardcode "lớp 3" trong code |
| NFR-MNT-04 | Có tài liệu cài đặt local, biến môi trường mẫu, quy trình triển khai |
| NFR-MNT-05 | Module camera tích hợp qua một lớp giao tiếp rõ ràng để có thể thay thế |
