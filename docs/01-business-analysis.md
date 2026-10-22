# 01. Phân tích nghiệp vụ: Cùng Con Học

- Phiên bản: 0.1 (bản nháp PHASE 01)
- Ngày: 22/10/2026
- Nguồn: 10 ảnh mockup UI do chủ dự án gửi, và các quyết định chốt trong trao đổi ngày 22/10/2026.
- Trạng thái dự án: chưa có repository, chưa có code. Mọi màn hình hiện chỉ là **giao diện mẫu (mockup ảnh)**.

## 1. Mục tiêu và vấn đề cần giải quyết

**Vấn đề.** Phụ huynh có con học lớp 3 muốn kèm con học ở nhà nhưng thiếu thời gian và thiếu công cụ để:

- biết hôm nay con cần học gì, làm bài gì;
- biết con làm bài ra sao, yếu ở kỹ năng nào;
- biết con có thật sự tập trung khi ngồi học hay không.

**Mục tiêu sản phẩm.** Một nền tảng web giúp phụ huynh giao bài, con tự học và làm bài, hệ thống chấm và tổng hợp tiến độ, và phụ huynh theo dõi con học qua camera.

**Mục tiêu kinh doanh.** Thu phí thuê bao theo từng học sinh: dùng thử miễn phí 30 ngày, sau đó 50.000 đ/tháng cho mỗi con, từ con thứ hai giảm 20% (40.000 đ/tháng).

**Chỉ số thành công đề xuất cho MVP** (giả định, cần chủ dự án xác nhận ngưỡng):

| Chỉ số | Cách đo | Ngưỡng đề xuất |
| --- | --- | --- |
| Gia đình dùng thử | Số gia đình đăng ký trong giai đoạn thử nghiệm | 30 đến 50 |
| Mức độ sử dụng | Tỷ lệ học sinh làm từ 3 bài mỗi tuần | trên 50% |
| Chuyển đổi trả phí | Tỷ lệ gia đình trả tiền sau 30 ngày dùng thử | sẽ đặt sau khi có dữ liệu |
| Phụ huynh quay lại | Tỷ lệ phụ huynh mở báo cáo tuần | trên 50% |

## 2. Phạm vi đã chốt

| Hạng mục | Quyết định |
| --- | --- |
| Khối lớp | Chỉ lớp 3 |
| Môn học trong MVP | Toán và Tiếng Việt |
| Người giao bài tập về nhà | Phụ huynh |
| Thu phí | Thử 30 ngày miễn phí; 50.000 đ/tháng/học sinh; con thứ hai giảm 20% |
| Nền tảng | Web trước (máy tính và máy tính bảng); ứng dụng di động để sau |
| Camera | Cần thiết, là tính năng cốt lõi; module camera **đã có sẵn** |
| Nội dung học tập | **Đã có sẵn** |

Ngoài phạm vi MVP: Tiếng Anh, Scratch, vai trò giáo viên, lớp học, xếp hạng trong lớp, đề thi theo dạng các cuộc thi (Violympic, Kangaroo, IMO, ASMO), thành tích và huy hiệu.

## 3. Đối tượng sử dụng và vai trò

| Vai trò | Ai | Mục tiêu | Có trong MVP |
| --- | --- | --- | --- |
| Phụ huynh | Cha mẹ hoặc người giám hộ của học sinh lớp 3 | Giao bài, theo dõi tiến độ, theo dõi qua camera, trả phí | Có |
| Học sinh | Trẻ khoảng 8 tuổi | Biết việc hôm nay, học bài, làm bài, được khen | Có |
| Quản trị viên | Đội vận hành của chủ dự án | Nhập và quản lý nội dung, hỗ trợ người dùng, xem doanh thu | Có (bản đơn giản) |
| Giáo viên | Giáo viên hoặc gia sư | Giao bài cho lớp, xem kết quả cả lớp | Không (giai đoạn 3) |

Quan hệ chính: một **gia đình** có một hoặc nhiều phụ huynh và một hoặc nhiều học sinh. Học sinh không tự đăng ký; tài khoản học sinh do phụ huynh tạo và quản lý.

## 4. Quy trình nghiệp vụ đầu cuối

### 4.1. Đăng ký và dùng thử

1. Phụ huynh đăng ký bằng số điện thoại hoặc email (hoặc Google).
2. Phụ huynh đọc và đồng ý điều khoản, chính sách quyền riêng tư.
3. Phụ huynh tạo hồ sơ cho từng con (tên hiển thị, lớp, trường, ảnh đại diện, mã PIN).
4. Hệ thống bắt đầu 30 ngày dùng thử cho gia đình.
5. Con đăng nhập trên thiết bị gia đình bằng cách chọn hồ sơ và nhập PIN.

### 4.2. Giao bài và làm bài (vòng lặp chính)

1. Phụ huynh mở thư viện, chọn bài hoặc chủ đề Toán/Tiếng Việt, chọn con, đặt hạn nộp.
2. Hệ thống có thể gợi ý bài dựa trên kỹ năng con còn yếu; phụ huynh quyết định có giao hay không.
3. Con thấy bài trong "Bài tập hôm nay", mở bài học nếu cần ôn, rồi làm bài.
4. Hệ thống chấm ngay câu trắc nghiệm và câu điền đáp án.
5. Câu tự luận (ví dụ viết đoạn văn Tiếng Việt) chuyển sang phụ huynh xem và nhận xét.
6. Kết quả cập nhật vào tiến độ, điểm mạnh và kỹ năng cần cải thiện.
7. Phụ huynh nhận thông báo khi con hoàn thành bài hoặc trễ hạn, và báo cáo tổng hợp hằng tuần.

### 4.3. Học có camera (giai đoạn 2)

1. Phụ huynh bật tính năng camera cho từng con và xác nhận đồng ý riêng cho camera.
2. Khi con bắt đầu phiên học, trình duyệt xin quyền camera; màn hình luôn báo cho con biết camera đang bật.
3. Module camera có sẵn ước lượng mức tập trung, tư thế ngồi, rời vị trí.
4. Hệ thống ghi nhận các sự kiện (không ghi video lên máy chủ, nếu module cho phép).
5. Phụ huynh xem trực tiếp (nếu bật) và xem báo cáo tập trung theo phiên, theo tuần.

### 4.4. Thanh toán

1. Trước khi hết dùng thử 3 ngày và 1 ngày, hệ thống nhắc phụ huynh.
2. Phụ huynh chọn số con cần đăng ký gói, hệ thống tính giá (con đầu 50.000 đ, các con sau 40.000 đ).
3. Phụ huynh thanh toán qua cổng thanh toán (VNPay hoặc MoMo, chưa chốt).
4. Gói gia hạn hằng tháng. Nếu thanh toán lỗi, hệ thống nhắc và cho thời gian ân hạn (chưa chốt).
5. Khi hết dùng thử hoặc hết gói mà chưa trả: cách xử lý chưa chốt (xem tài liệu 04).

## 5. Danh sách module và quan hệ

| Mã | Module | Mô tả | Phụ thuộc |
| --- | --- | --- | --- |
| M01 | Tài khoản và gia đình | Đăng ký, đăng nhập, hồ sơ con, PIN, đồng ý | không |
| M02 | Nội dung | Chương trình lớp 3, chủ đề, bài học, câu hỏi, kỹ năng; nhập hàng loạt | không |
| M03 | Thư viện và bài học | Duyệt, tìm, xem chi tiết bài học cho học sinh và phụ huynh | M02 |
| M04 | Bài tập về nhà | Phụ huynh giao bài, hạn nộp, gợi ý bài | M01, M02 |
| M05 | Làm bài và chấm điểm | Làm bài, lưu câu trả lời, chấm tự động, phụ huynh nhận xét tự luận | M02, M04 |
| M06 | Tiến độ và báo cáo | Thống kê, điểm mạnh/yếu theo kỹ năng, thời gian học, chuỗi ngày học | M05, M09 |
| M07 | Thông báo | Trong ứng dụng, email, Zalo; nhắc hạn, nhắc hết dùng thử | M01, M04, M08 |
| M08 | Gói và thanh toán | Dùng thử, giá theo con, giảm giá con thứ hai, gia hạn, hóa đơn | M01 |
| M09 | Phiên học | Bắt đầu/kết thúc phiên, thời gian học | M01 |
| M10 | Camera đồng hành | Tích hợp module camera có sẵn, sự kiện tập trung, xem trực tiếp | M01, M09 (giai đoạn 2) |
| M11 | Quản trị | Quản lý người dùng, nội dung, gói, nhật ký truy cập | tất cả |

## 6. Hiện trạng: đã có, còn thiếu, chỉ là giao diện mẫu

| Hạng mục | Hiện trạng |
| --- | --- |
| Thiết kế UI | 10 ảnh mockup tĩnh (11 màn hình). Chưa có file thiết kế gốc (Figma) được chia sẻ. |
| Code ứng dụng | Chưa có. Chưa có repository. |
| Nội dung Toán, Tiếng Việt lớp 3 | Chủ dự án cho biết đã có. Chưa rõ định dạng và số lượng. |
| Module camera | Chủ dự án cho biết đã có. Chưa rõ công nghệ, nơi xử lý video, có lưu video hay không. |
| Màn hình trong menu nhưng chưa có mockup | Hồ sơ con, Lịch học (trang riêng), Thư viện tài liệu, Thành tích, Thời gian học, Thông báo, Cài đặt, Thanh toán, Quản trị nội dung, màn phụ huynh chấm bài tự luận |
| Số liệu trên mockup | Đều là dữ liệu minh họa, không dùng làm dữ liệu thật. |

Ghi chú về mockup:

- Có 2 phiên bản trang chủ phụ huynh khác nhau (Chị Lan và Anh Phương); cần chọn một hoặc gộp.
- Mockup có tab "Giáo viên" ở màn đăng nhập, xếp hạng trong lớp và đề thi các cuộc thi; các phần này ngoài phạm vi MVP.
- Menu của học sinh đang có mục "Theo dõi camera"; mục này nên chỉ dành cho phụ huynh.
- Giao diện học sinh có nhiều số liệu và chữ nhỏ so với trẻ 8 tuổi; nên thử với trẻ thật.

## 7. Hệ thống bên ngoài cần tích hợp

| Hệ thống | Mục đích | Giai đoạn | Trạng thái |
| --- | --- | --- | --- |
| Google OAuth | Đăng nhập bằng Google cho phụ huynh | MVP | cần tạo ứng dụng Google |
| Cổng thanh toán (VNPay hoặc MoMo) | Thu phí thuê bao | MVP | cần đăng ký tài khoản doanh nghiệp |
| Zalo ZNS | Gửi thông báo cho phụ huynh | MVP | cần tài khoản Zalo OA và mẫu tin được duyệt |
| Dịch vụ email | Xác thực, khôi phục mật khẩu, báo cáo tuần | MVP | chưa chọn |
| SMS OTP | Xác thực số điện thoại (nếu dùng) | MVP | chưa chọn |
| Lưu trữ file và CDN | Video bài giảng, PDF, ảnh | MVP | chưa chọn |
| Module camera có sẵn | Ước lượng tập trung | Giai đoạn 2 | cần tài liệu kỹ thuật |
| Máy chủ TURN (WebRTC) | Xem trực tiếp | Giai đoạn 2 | chưa chọn |
