# 04. Giả định và câu hỏi cần xác nhận

- Phiên bản: 0.1 (PHASE 01), ngày 22/10/2026
- Giả định là điều tôi tạm dùng để thiết kế. Nếu sai, cột "Ảnh hưởng nếu sai" cho biết phần nào phải làm lại.

## 1. Quyết định đã chốt (22/10/2026)

| Mã | Quyết định |
| --- | --- |
| D-01 | Chỉ phục vụ lớp 3 |
| D-02 | MVP gồm môn Toán và Tiếng Việt |
| D-03 | Phụ huynh là người giao bài tập về nhà |
| D-04 | Dùng thử miễn phí 30 ngày |
| D-05 | 50.000 đ/tháng cho mỗi học sinh; học sinh thứ hai giảm 20% |
| D-06 | Làm bản web trước |
| D-07 | Camera là tính năng cần thiết; module camera đã có sẵn |
| D-08 | Nội dung học tập đã có sẵn |

## 2. Câu hỏi cần xác nhận

Sắp theo mức ảnh hưởng tới kiến trúc, chi phí và phạm vi.

| Mã | Câu hỏi | Vì sao quan trọng | Ảnh hưởng tới |
| --- | --- | --- | --- |
| Q-01 | Module camera có sẵn hoạt động thế nào? Viết bằng gì, chạy trên trình duyệt hay máy chủ, có gửi hoặc lưu video không, là code của bạn hay dịch vụ bên ngoài, có tài liệu hoặc mã nguồn không? | Quyết định kiến trúc giai đoạn 2, rủi ro pháp lý, chi phí máy chủ | Kiến trúc, bảo mật, pháp lý |
| Q-02 | Nội dung có sẵn đang ở định dạng gì (Word, Excel, PDF, PowerPoint, video, một hệ thống khác)? Có khoảng bao nhiêu bài học, câu hỏi, video? Bạn có quyền sử dụng thương mại không? | Quyết định công cụ nhập hàng loạt và mô hình câu hỏi | M02, thời gian GĐ1 |
| Q-03 | Hết 30 ngày dùng thử (hoặc hết gói) mà chưa trả tiền thì: khóa toàn bộ, hay vẫn cho phụ huynh xem lại kết quả cũ nhưng không giao bài mới? | Quy tắc phân quyền theo trạng thái gói | M08, mọi màn hình |
| Q-04 | Thêm con giữa chu kỳ thì tính tiền thế nào: trả đủ tháng, tính theo ngày còn lại, hay bắt đầu chu kỳ riêng cho con đó? | Logic tính tiền | M08 |
| Q-05 | Camera nằm trong gói 50.000 đ hay là gói riêng? | Mô hình giá, phân quyền tính năng | M08, M10 |
| Q-06 | Dùng thử 30 ngày tính theo gia đình hay theo từng con? Con thêm sau có được 30 ngày riêng không? | Logic dùng thử | M08 |
| Q-07 | Chọn cổng thanh toán nào (VNPay, MoMo, cả hai)? Công ty đã có pháp nhân và tài khoản doanh nghiệp chưa? | Thủ tục đăng ký mất vài tuần | M08, tiến độ |
| Q-08 | Có cần xuất hóa đơn điện tử (VAT) cho phụ huynh không? | Tích hợp thêm nhà cung cấp hóa đơn | M08 |
| Q-09 | Ngân sách và quy mô đội phát triển? Ai làm thiết kế UI chi tiết? | Ước tính thời gian ở tài liệu 10 | Kế hoạch |
| Q-10 | Có file thiết kế gốc (Figma) không, hay chỉ có ảnh? Chọn bản trang chủ phụ huynh nào (Chị Lan hay Anh Phương)? | Thiết kế chi tiết | Giao diện |
| Q-11 | Đăng nhập học sinh bằng chọn hồ sơ + PIN trên thiết bị gia đình có chấp nhận không, hay cần tài khoản/mật khẩu riêng? | Luồng xác thực | M01 |
| Q-12 | Có muốn lưu ảnh chụp theo mốc thời gian (dòng ảnh trong mockup "Theo dõi học tập") không? | Đây là dữ liệu hình ảnh trẻ trên máy chủ, rủi ro cao | M10, pháp lý |
| Q-13 | Tên miền, nhà cung cấp hạ tầng mong muốn (trong nước hay AWS/GCP)? | Triển khai, vị trí dữ liệu | Hạ tầng |
| Q-14 | Đã có luật sư tư vấn về dữ liệu trẻ em chưa? | Điều kiện để bật camera | GĐ2 |

## 3. Giả định đang dùng

| Mã | Giả định | Ảnh hưởng nếu sai |
| --- | --- | --- |
| A-01 | Một gia đình có 1 tài khoản phụ huynh chính trong MVP; mời phụ huynh thứ hai để sau | Thêm luồng mời và phân quyền nhiều phụ huynh |
| A-02 | Học sinh đăng nhập bằng chọn hồ sơ + PIN 4 số trên thiết bị phụ huynh đã đăng nhập | Phải thêm tài khoản học sinh độc lập (Q-11) |
| A-03 | Điểm hiển thị theo thang 10, làm tròn 1 chữ số thập phân | Đổi công thức hiển thị |
| A-04 | Làm lại bài được phép; báo cáo lấy lần cao nhất, lịch sử giữ mọi lần | Đổi công thức thống kê |
| A-05 | Câu tự luận Tiếng Việt do phụ huynh chấm; không dùng AI chấm trong MVP | Thêm tích hợp AI chấm, chi phí |
| A-06 | Ngưỡng điểm mạnh 80%, cần cải thiện dưới 50%, tối thiểu 5 câu mỗi kỹ năng | Chỉnh tham số |
| A-07 | Chuỗi ngày học tính khi có ít nhất 1 bài hoàn thành trong ngày (giờ Việt Nam) | Chỉnh quy tắc |
| A-08 | Gói thanh toán thủ công mỗi tháng (phụ huynh bấm gia hạn); trừ tiền tự động làm sau nếu cổng hỗ trợ | Thêm tích hợp token hóa thẻ/ví |
| A-09 | Nội dung có sẵn có thể chuyển về cấu trúc môn → chủ đề → bài học → câu hỏi | Thiết kế lại mô hình nội dung |
| A-10 | Quy mô năm đầu khoảng 5.000 gia đình | Chọn hạ tầng khác |
| A-11 | Module camera chạy được trong trình duyệt và có thể cấu hình để không gửi video lên máy chủ | Nếu không, phải viết lại hoặc chấp nhận rủi ro pháp lý cao hơn |
| A-12 | Công nghệ đề xuất là Next.js + PostgreSQL (sẽ trình bày ở PHASE 02); không có ràng buộc công nghệ từ phía bạn | Đổi công nghệ theo yêu cầu của bạn |
| A-13 | Dự án bắt đầu từ đầu (greenfield): chưa có repository, chưa có code | Nếu đã có code, PHASE 02 phải khảo sát lại |

## 4. Trường hợp ngoại lệ cần thiết kế

| Tình huống | Cách xử lý đề xuất |
| --- | --- |
| Con đang làm bài thì mất mạng | Câu trả lời đã lưu vẫn giữ; câu đang chọn lưu lại khi có mạng; báo "đang mất kết nối" |
| Con mở cùng bài trên 2 thiết bị | Cùng một lượt làm; câu trả lời mới nhất thắng |
| Phụ huynh hủy bài khi con đang làm | Không cho hủy; chỉ cho sửa hạn |
| Nội dung bị sửa sau khi đã giao | Lượt làm giữ phiên bản câu hỏi lúc bắt đầu |
| Thanh toán thành công nhưng callback đến trễ | Hiển thị "đang xác nhận"; đối soát định kỳ với cổng |
| Callback thanh toán gửi trùng | Xử lý idempotent theo mã giao dịch |
| Phụ huynh xóa con có gói đang hiệu lực | Cảnh báo; không hoàn tiền tự động (cần chốt chính sách hoàn tiền) |
| Quên PIN của con | Phụ huynh đặt lại PIN trong chế độ phụ huynh |
| Trình duyệt không cho quyền camera | Phiên học vẫn chạy, ghi nhận "không có camera"; báo phụ huynh |
