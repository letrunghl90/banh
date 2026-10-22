# 12. Sổ đăng ký rủi ro

- Phiên bản: 0.1 (PHASE 03), ngày 22/10/2026
- Khả năng (K) và Tác động (T): 1 thấp, 2 vừa, 3 cao. Điểm = K × T. Xem lại mỗi milestone.

| Mã | Rủi ro | K | T | Điểm | Biện pháp phòng ngừa | Phương án dự phòng | Người theo dõi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Module camera có sẵn gửi hoặc lưu video lên máy chủ, hoặc nhận diện khuôn mặt, không đạt yêu cầu quyền riêng tư | 2 | 3 | 6 | Khảo sát sớm (T-001) | Sửa module hoặc viết adapter mới bằng MediaPipe trong trình duyệt | Tech lead |
| R-02 | Luật sư không duyệt phương án camera, hoặc cần hồ sơ thủ tục kéo dài | 2 | 3 | 6 | Thuê luật sư từ tuần 1, lập hồ sơ song song MVP | Ra MVP không camera; camera ở chế độ thử nghiệm giới hạn | Chủ dự án |
| R-03 | Thủ tục cổng thanh toán chậm hơn dự kiến | 2 | 3 | 6 | Nộp hồ sơ tuần 1 | Mở dùng thử miễn phí trước, bật thu phí sau khi cổng sẵn sàng | Chủ dự án |
| R-04 | Nội dung có sẵn không có cấu trúc, nhập hàng loạt tốn nhiều công | 2 | 3 | 6 | Xem mẫu nội dung trước khi chốt mô hình (T-002) | Nhập tay một phần; giảm số bài trong MVP | Tech lead |
| R-05 | Bản quyền: nội dung có sẵn lấy từ sách giáo khoa, logo cuộc thi trong mockup | 2 | 3 | 6 | Xác nhận quyền sử dụng nội dung (Q-02); không dùng logo khi chưa có giấy phép | Gỡ nội dung vi phạm | Chủ dự án |
| R-06 | Lộ dữ liệu giữa các gia đình (IDOR) | 1 | 3 | 3 | Lớp policy bắt buộc, test IDOR tự động mỗi endpoint | Quy trình sự cố, thông báo theo luật | Tech lead |
| R-07 | Ước tính thấp hơn thực tế (đội chưa xác định, mới chỉ có mockup) | 3 | 2 | 6 | Ước tính lại sau milestone 1; dự phòng 10 ngày sửa lỗi | Cắt P2 khỏi MVP | Tech lead |
| R-08 | Thiết kế UI chi tiết chưa có cho nhiều màn (thanh toán, cài đặt, quản trị, chấm tự luận) | 3 | 2 | 6 | Thiết kế viên làm trước 1 đến 2 tuần | Dùng thư viện component sẵn theo phong cách mockup | Chủ dự án |
| R-09 | Trẻ 8 tuổi khó dùng giao diện nhiều số liệu | 2 | 2 | 4 | Thử với 5 trẻ ở milestone 3 | Đơn giản hóa trang chủ học sinh | Thiết kế |
| R-10 | Phụ huynh không quay lại, tỷ lệ trả phí thấp sau 30 ngày | 2 | 3 | 6 | Báo cáo tuần, nhắc hết dùng thử, đo chỉ số trong thử nghiệm | Điều chỉnh giá, thời gian dùng thử | Chủ dự án |
| R-11 | Phản ứng tiêu cực của phụ huynh/báo chí về camera giám sát trẻ | 2 | 3 | 6 | Mặc định tắt, minh bạch, không lưu video, truyền thông rõ ràng | Tạm dừng tính năng | Chủ dự án |
| R-12 | Email/Zalo không tới phụ huynh (spam, mẫu tin bị từ chối) | 2 | 2 | 4 | SPF/DKIM/DMARC, nộp mẫu ZNS sớm | Thông báo trong ứng dụng là kênh chính | Dev B |
| R-13 | Mất dữ liệu do sự cố hoặc thao tác sai | 1 | 3 | 3 | PITR, diễn tập khôi phục, không chạy migration phá hủy khi chưa duyệt | Khôi phục theo thời điểm | Tech lead |
| R-14 | Câu hỏi Q-01..Q-14 trả lời chậm làm trễ milestone 1 | 2 | 2 | 4 | Ưu tiên 5 câu chặn đường găng (Q-01, Q-02, Q-03, Q-07, Q-09) | Thiết kế theo giả định, ghi rõ | Chủ dự án |
