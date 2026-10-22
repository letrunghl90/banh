# 02. Yêu cầu chức năng

- Phiên bản: 0.1 (PHASE 01), ngày 22/10/2026
- Ký hiệu ưu tiên: **P0** cốt lõi/bảo mật, **P1** cần cho MVP, **P2** sau MVP, **P3** mở rộng.
- Ký hiệu giai đoạn: **GĐ1** MVP web, **GĐ2** camera, **GĐ3** đề thi và mở rộng.
- Mỗi yêu cầu có mã `FR-<module>-<số>` để truy vết sang backlog (tài liệu 11) và tiêu chí nghiệm thu (tài liệu 13).

## M01. Tài khoản và gia đình

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-01-01 | Phụ huynh đăng ký bằng số điện thoại hoặc email và mật khẩu; xác thực bằng mã OTP gửi về số điện thoại hoặc email | Phụ huynh | P0 | GĐ1 |
| FR-01-02 | Phụ huynh đăng nhập bằng Google | Phụ huynh | P1 | GĐ1 |
| FR-01-03 | Đăng nhập, đăng xuất, "ghi nhớ đăng nhập", quên mật khẩu | Phụ huynh, quản trị | P0 | GĐ1 |
| FR-01-04 | Khi đăng ký, phụ huynh phải đồng ý điều khoản và chính sách quyền riêng tư; hệ thống lưu phiên bản văn bản và thời điểm đồng ý | Phụ huynh | P0 | GĐ1 |
| FR-01-05 | Phụ huynh tạo, sửa, xóa hồ sơ con: tên hiển thị, ảnh đại diện (chọn từ bộ có sẵn), lớp, trường (không bắt buộc), mã PIN 4 số | Phụ huynh | P0 | GĐ1 |
| FR-01-06 | Học sinh đăng nhập trên thiết bị đã có phụ huynh đăng nhập: chọn hồ sơ con và nhập PIN | Học sinh | P0 | GĐ1 |
| FR-01-07 | Chuyển từ chế độ học sinh sang chế độ phụ huynh phải nhập lại mật khẩu (hoặc PIN phụ huynh) | Phụ huynh | P0 | GĐ1 |
| FR-01-08 | Phụ huynh mời phụ huynh thứ hai vào cùng gia đình | Phụ huynh | P2 | GĐ3 |
| FR-01-09 | Phụ huynh xuất và xóa toàn bộ dữ liệu của một con | Phụ huynh | P0 | GĐ1 |
| FR-01-10 | Phụ huynh xóa tài khoản gia đình | Phụ huynh | P1 | GĐ1 |

Tab "Học sinh", "Giáo viên" trên màn đăng nhập trong mockup: MVP chỉ có lối vào phụ huynh và lối vào học sinh qua chọn hồ sơ; tab Giáo viên ẩn.

## M02. Nội dung

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-02-01 | Quản lý cây nội dung: môn → chủ đề → bài học, có thứ tự, chỉ lớp 3, môn Toán và Tiếng Việt | Quản trị | P0 | GĐ1 |
| FR-02-02 | Bài học gồm các bước (khám phá, kiến thức trọng tâm, luyện tập) với văn bản, hình ảnh; kèm video bài giảng và tài liệu đính kèm (PDF) | Quản trị | P1 | GĐ1 |
| FR-02-03 | Ngân hàng câu hỏi với các loại: trắc nghiệm một đáp án, trắc nghiệm nhiều đáp án, điền đáp án ngắn (số hoặc từ), đúng/sai, tự luận | Quản trị | P0 | GĐ1 |
| FR-02-04 | Mỗi câu hỏi có đáp án, lời giải, độ khó (dễ, trung bình, khó) và gắn với 1 hoặc nhiều kỹ năng | Quản trị | P1 | GĐ1 |
| FR-02-05 | Tạo bộ bài tập (assessment) từ danh sách câu hỏi, có thời gian dự kiến | Quản trị | P0 | GĐ1 |
| FR-02-06 | Nhập hàng loạt nội dung có sẵn từ file (định dạng sẽ chốt sau khi xem nội dung mẫu), báo lỗi từng dòng | Quản trị | P0 | GĐ1 |
| FR-02-07 | Nội dung có trạng thái nháp và đã xuất bản; học sinh chỉ thấy nội dung đã xuất bản | Quản trị | P1 | GĐ1 |
| FR-02-08 | Tải lên video và PDF, lưu trên kho file, phát qua CDN | Quản trị | P1 | GĐ1 |

## M03. Thư viện và bài học

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-03-01 | Thư viện khóa học: lọc theo môn và chủ đề, hiển thị số bài, tiến độ theo chủ đề | Học sinh, phụ huynh | P1 | GĐ1 |
| FR-03-02 | Chi tiết bài học: 4 tab (nội dung, video, luyện tập, tài liệu), phân trang các bước, nút bài trước/bài tiếp | Học sinh | P1 | GĐ1 |
| FR-03-03 | Ghi nhận học sinh đã xem bài học, thời gian xem, số lần xem lại, đã hoàn thành | Học sinh | P1 | GĐ1 |
| FR-03-04 | Tìm kiếm bài học theo tên | Học sinh, phụ huynh | P2 | GĐ1 |

## M04. Bài tập về nhà

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-04-01 | Phụ huynh giao một bộ bài tập cho một hoặc nhiều con, đặt hạn nộp (ngày) | Phụ huynh | P0 | GĐ1 |
| FR-04-02 | Phụ huynh sửa hạn nộp hoặc hủy bài đã giao khi con chưa bắt đầu | Phụ huynh | P1 | GĐ1 |
| FR-04-03 | Hệ thống gợi ý tối đa 3 bộ bài tập theo kỹ năng con còn yếu; phụ huynh bấm giao hoặc bỏ qua | Phụ huynh | P2 | GĐ1 |
| FR-04-04 | Danh sách bài tập của học sinh: lọc Tất cả, Chưa làm, Đang làm, Đã hoàn thành; hiển thị môn, số câu, thời gian dự kiến, hạn nộp | Học sinh | P0 | GĐ1 |
| FR-04-05 | Khối "Bài tập sắp đến hạn" và "Tổng quan bài tập" (tỷ lệ hoàn thành) | Học sinh | P1 | GĐ1 |
| FR-04-06 | Bài quá hạn vẫn cho làm, được đánh dấu "nộp trễ" | Học sinh | P1 | GĐ1 |
| FR-04-07 | Lịch học tuần: phụ huynh đặt khung giờ học cho từng môn; hiển thị trạng thái Đã học, Đang học, Chưa học | Phụ huynh | P2 | GĐ1 |

## M05. Làm bài và chấm điểm

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-05-01 | Học sinh bắt đầu, làm từng câu, chuyển câu, xem bảng câu (đã làm, đang làm, chưa làm), nộp bài | Học sinh | P0 | GĐ1 |
| FR-05-02 | Câu trả lời được lưu ngay khi chọn; thoát ra vào lại vẫn tiếp tục được ("Tiếp tục làm") | Học sinh | P0 | GĐ1 |
| FR-05-03 | Chấm tự động trắc nghiệm, đúng/sai, điền đáp án (so khớp chuẩn hóa: bỏ khoảng trắng thừa, không phân biệt hoa thường, chấp nhận nhiều đáp án đúng) | Hệ thống | P0 | GĐ1 |
| FR-05-04 | Câu tự luận chuyển trạng thái "chờ phụ huynh nhận xét"; phụ huynh chấm điểm và viết nhận xét | Phụ huynh | P1 | GĐ1 |
| FR-05-05 | Sau khi nộp: hiển thị điểm (thang 10), số câu đúng/sai/bỏ trống, thời gian làm, lời giải từng câu | Học sinh, phụ huynh | P0 | GĐ1 |
| FR-05-06 | Cho làm lại bài; điểm báo cáo lấy lần làm cao nhất (giả định, xem tài liệu 04) | Học sinh | P1 | GĐ1 |
| FR-05-07 | Chế độ làm bài có giờ (đếm ngược, tự nộp khi hết giờ) | Học sinh | P2 | GĐ3 |

## M06. Tiến độ và báo cáo

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-06-01 | Trang chủ học sinh: bài tập hôm nay (x/y hoàn thành), thời gian học hôm nay, điểm trung bình tuần, chuỗi ngày học, tiến độ theo môn, hoạt động gần đây, gợi ý hôm nay | Học sinh | P1 | GĐ1 |
| FR-06-02 | Trang chủ phụ huynh: chọn con, số bài đã học, bài tập đã hoàn thành, thời gian học tuần, tỷ lệ hoàn thành, tiến độ theo môn, lịch tuần, thông báo | Phụ huynh | P0 | GĐ1 |
| FR-06-03 | Kết quả học tập: điểm trung bình, số bài đã làm, biểu đồ theo tuần, bảng hoạt động gần đây (thời gian, tên bài, loại, kết quả, điểm) | Phụ huynh | P1 | GĐ1 |
| FR-06-04 | Điểm mạnh và cần cải thiện: tính theo tỷ lệ đúng của từng kỹ năng trên tối thiểu 5 câu; từ 80% là điểm mạnh, dưới 50% là cần cải thiện | Phụ huynh | P1 | GĐ1 |
| FR-06-05 | So sánh với tuần trước (tăng/giảm điểm, số bài) | Phụ huynh | P2 | GĐ1 |
| FR-06-06 | Báo cáo tuần gửi phụ huynh vào tối Chủ nhật | Phụ huynh | P1 | GĐ1 |
| FR-06-07 | Xếp hạng trong lớp | Phụ huynh | P3 | GĐ3 |

## M07. Thông báo

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-07-01 | Thông báo trong ứng dụng, có số chưa đọc, đánh dấu đã đọc | Tất cả | P1 | GĐ1 |
| FR-07-02 | Sự kiện thông báo phụ huynh: con hoàn thành bài, con trễ hạn, có câu tự luận chờ nhận xét, sắp hết dùng thử (còn 3 ngày, 1 ngày), thanh toán thành công/thất bại, báo cáo tuần | Phụ huynh | P1 | GĐ1 |
| FR-07-03 | Gửi qua email và Zalo ZNS; phụ huynh tắt/bật từng loại trong Cài đặt | Phụ huynh | P2 | GĐ1 |
| FR-07-04 | Nhắc học sinh trong ứng dụng: có bài mới, bài sắp đến hạn | Học sinh | P1 | GĐ1 |

## M08. Gói và thanh toán

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-08-01 | Gia đình mới được dùng thử miễn phí 30 ngày, tính từ lúc tạo tài khoản; mỗi gia đình chỉ được dùng thử 1 lần | Hệ thống | P0 | GĐ1 |
| FR-08-02 | Giá: con thứ nhất 50.000 đ/tháng; mỗi con từ thứ hai giảm 20% (40.000 đ/tháng) | Hệ thống | P0 | GĐ1 |
| FR-08-03 | Phụ huynh chọn những con cần đăng ký, xem tổng tiền trước khi thanh toán | Phụ huynh | P0 | GĐ1 |
| FR-08-04 | Thanh toán qua cổng thanh toán; xác nhận bằng callback/IPN có kiểm tra chữ ký, không tin kết quả từ trình duyệt | Hệ thống | P0 | GĐ1 |
| FR-08-05 | Gói theo chu kỳ 1 tháng; nhắc gia hạn trước 3 ngày; phụ huynh gia hạn thủ công nếu cổng không hỗ trợ trừ tiền tự động | Phụ huynh | P1 | GĐ1 |
| FR-08-06 | Lịch sử thanh toán và hóa đơn (biên nhận) trong Cài đặt | Phụ huynh | P1 | GĐ1 |
| FR-08-07 | Khi hết dùng thử/hết gói: áp dụng chính sách khóa đã chốt (xem câu hỏi Q-03 tài liệu 04) | Hệ thống | P0 | GĐ1 |
| FR-08-08 | Thêm hoặc bớt con giữa chu kỳ: cách tính tiền chưa chốt (Q-04) | Phụ huynh | P2 | GĐ1 |

## M09. Phiên học

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-09-01 | Ghi nhận phiên học khi học sinh mở bài học hoặc làm bài, kết thúc sau 5 phút không hoạt động | Hệ thống | P1 | GĐ1 |
| FR-09-02 | Tính thời gian học theo ngày, tuần; chuỗi ngày học liên tục (có ít nhất 1 bài hoàn thành trong ngày) | Hệ thống | P1 | GĐ1 |

## M10. Camera đồng hành (GĐ2)

Yêu cầu chi tiết phụ thuộc vào module camera có sẵn (Q-01). Bản dưới đây là mục tiêu.

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-10-01 | Camera mặc định tắt; phụ huynh bật cho từng con sau khi đọc giải thích và đồng ý riêng | Phụ huynh | P0 | GĐ2 |
| FR-10-02 | Khi camera chạy, màn hình học sinh luôn hiện chỉ báo "Camera đang bật" | Học sinh | P0 | GĐ2 |
| FR-10-03 | Ước lượng mức tập trung (%), tư thế ngồi, nhìn màn hình, rời vị trí; gửi lên máy chủ dạng sự kiện, không gửi video | Hệ thống | P0 | GĐ2 |
| FR-10-04 | Phụ huynh xem trực tiếp hình ảnh của con khi con đang trong phiên học; không ghi lại | Phụ huynh | P1 | GĐ2 |
| FR-10-05 | Báo cáo tập trung theo phiên (biểu đồ theo thời gian, nhật ký sự kiện) và theo tuần | Phụ huynh | P1 | GĐ2 |
| FR-10-06 | Phụ huynh tạm dừng hoặc kết thúc theo dõi | Phụ huynh | P1 | GĐ2 |
| FR-10-07 | Mức tập trung không dùng để trừ điểm hay xếp hạng; giao diện ghi rõ đây là ước lượng | Hệ thống | P0 | GĐ2 |
| FR-10-08 | Ảnh chụp theo mốc thời gian (dòng ảnh trong mockup): chỉ khi phụ huynh đồng ý riêng, mã hóa, tự xóa sau 7 ngày | Phụ huynh | P2 | GĐ2 |
| FR-10-09 | Thi có giám sát camera | Học sinh | P2 | GĐ3 |

## M11. Quản trị

| Mã | Yêu cầu | Vai trò | Ưu tiên | GĐ |
| --- | --- | --- | --- | --- |
| FR-11-01 | Đăng nhập quản trị riêng, bắt buộc xác thực 2 lớp | Quản trị | P0 | GĐ1 |
| FR-11-02 | Tìm gia đình theo email/số điện thoại, xem trạng thái gói, gia hạn dùng thử thủ công | Quản trị | P1 | GĐ1 |
| FR-11-03 | Danh sách giao dịch thanh toán, đối soát với cổng | Quản trị | P1 | GĐ1 |
| FR-11-04 | Nhật ký mọi lần quản trị xem dữ liệu của học sinh | Hệ thống | P0 | GĐ1 |
| FR-11-05 | Báo cáo tổng: số gia đình, dùng thử, trả phí, doanh thu tháng | Quản trị | P2 | GĐ1 |

## Ngoài phạm vi MVP (ghi nhận để không bị bỏ sót)

Đề kiểm tra và đề thi theo dạng cuộc thi, lịch cuộc thi, thành tích và huy hiệu, Tiếng Anh, Scratch, vai trò giáo viên và lớp học, thư viện tài liệu riêng, ứng dụng di động.
