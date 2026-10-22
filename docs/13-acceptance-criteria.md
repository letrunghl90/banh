# 13. Tiêu chí nghiệm thu

- Phiên bản: 0.1 (PHASE 03), ngày 22/10/2026
- Mỗi tiêu chí kiểm chứng được bằng test hoặc thao tác cụ thể. Một tiêu chí chỉ được đánh dấu đạt khi test tương ứng đã thực sự chạy và PASS (ghi trong tài liệu 15).
- Mã liên kết với task ở tài liệu 11 và yêu cầu ở tài liệu 02.

## Khảo sát

| Mã | Tiêu chí |
| --- | --- |
| AC-CAM-00 | Có báo cáo module camera: công nghệ, nơi xử lý video, dữ liệu gửi đi, kết quả chạy thử trên Chrome và Safari iPad, kết luận dùng được hay phải sửa |
| AC-CNT-00 | Có đặc tả định dạng nhập và ánh xạ đã thử với ít nhất 10 bài mỗi môn |

## Nền tảng

| Mã | Tiêu chí |
| --- | --- |
| AC-PLT-01 | `build` thành công; TypeScript strict không lỗi; lint không lỗi |
| AC-PLT-02 | Migration chạy trên DB trống; seed tạo dữ liệu mẫu có nhãn "mẫu" |
| AC-PLT-03 | Mỗi pull request chạy lint, typecheck, unit, integration, build; PR đỏ không merge được |
| AC-PLT-04 | Handler không gọi `requireActor` thì test kiến trúc báo lỗi; lỗi trả JSON đúng định dạng tài liệu 08 kèm `requestId` |
| AC-PLT-05 | Job thử nghiệm được worker xử lý; job lỗi được thử lại tối đa 3 lần |
| AC-PLT-06 | URL ký hết hạn sau thời gian cấu hình, truy cập sau đó bị từ chối |
| AC-PLT-07 | Merge vào nhánh chính tự triển khai staging; lỗi runtime hiện trong công cụ theo dõi lỗi |
| AC-SEC-01 | Header CSP, HSTS, X-Content-Type-Options, Referrer-Policy có mặt; cookie phiên HttpOnly, Secure, SameSite; thao tác ghi thiếu token CSRF bị từ chối 403 |

## Tài khoản

| Mã | Tiêu chí |
| --- | --- |
| AC-ACC-01 | Đăng ký bằng email (hoặc số điện thoại) nhận OTP; nhập đúng thì xác thực, sai 5 lần thì phải gửi lại mã; mã hết hạn sau 10 phút |
| AC-ACC-02 | Đăng nhập đúng tạo phiên; sai 5 lần trong 15 phút thì bị giới hạn 429 |
| AC-ACC-03 | Đăng xuất thu hồi phiên; cookie cũ gọi API trả 401 |
| AC-ACC-04 | Quên mật khẩu đặt lại được; mọi phiên cũ bị thu hồi |
| AC-ACC-05 | Đăng nhập Google tạo hoặc liên kết đúng tài khoản; `state` sai bị từ chối |
| AC-ACC-06 | Không đăng ký được nếu chưa đồng ý điều khoản; bảng `consents` lưu phiên bản và thời điểm |
| AC-ACC-07 | Phụ huynh tạo, sửa, xóa hồ sơ con; PIN phải đúng 4 chữ số và được băm |
| AC-ACC-08 | Chọn hồ sơ + PIN đúng vào chế độ học sinh; sai 5 lần khóa 15 phút |
| AC-ACC-09 | Ở chế độ học sinh, gọi bất kỳ API chỉ dành cho phụ huynh trả 403; về chế độ phụ huynh phải nhập đúng mật khẩu |
| AC-ACC-10 | Xuất dữ liệu tạo file chứa toàn bộ dữ liệu của con; xóa con thì sau 30 ngày không còn bản ghi học tập nào của con trong DB chính |

## Quản trị và nội dung

| Mã | Tiêu chí |
| --- | --- |
| AC-ADM-01 | Quản trị không đăng nhập được nếu thiếu mã TOTP |
| AC-ADM-02 | Quản trị tìm gia đình và gia hạn dùng thử; thay đổi ngày hết hạn hiển thị đúng với phụ huynh |
| AC-ADM-03 | Mỗi lần quản trị xem dữ liệu học sinh tạo một dòng audit log; audit log không sửa xóa được qua ứng dụng |
| AC-ADM-04 | Danh sách giao dịch khớp tổng tiền với dữ liệu sandbox của cổng |
| AC-CNT-01 | Tạo môn → chủ đề → bài học với nhiều bước; bài nháp không hiện với học sinh, bài xuất bản thì hiện |
| AC-CNT-02 | Tạo được đủ 5 loại câu hỏi, gắn kỹ năng, gom thành bộ bài tập |
| AC-CNT-03 | Tải lên video và PDF; học sinh xem được qua URL ký |
| AC-CNT-04 | Nhập file mẫu: dòng hợp lệ được tạo, dòng lỗi được báo kèm số dòng và lý do, không tạo dữ liệu nửa chừng cho dòng lỗi |
| AC-CNT-05 | Toàn bộ nội dung Toán và Tiếng Việt lớp 3 đã nhập; đội nội dung kiểm tra mẫu ngẫu nhiên 10% không phát hiện lỗi hiển thị |

## Thư viện

| Mã | Tiêu chí |
| --- | --- |
| AC-LIB-01 | Thư viện hiển thị 2 môn, lọc theo chủ đề, số bài và tiến độ đúng với dữ liệu |
| AC-LIB-02 | Chi tiết bài học có 4 tab, chuyển bước trước/sau, phát video trên Chrome, Safari iPad |
| AC-LIB-03 | Mở bài học cập nhật số lần xem, thời gian xem; hoàn thành bước cuối đánh dấu hoàn thành |

## Bài tập và làm bài

| Mã | Tiêu chí |
| --- | --- |
| AC-HW-01 | Phụ huynh giao 1 bộ bài cho 2 con với hạn nộp; mỗi con thấy bài trong danh sách của mình |
| AC-HW-02 | Phụ huynh gia đình A không giao được bài cho con gia đình B (404) |
| AC-HW-03 | Sửa hạn nộp được; hủy bài đã bắt đầu trả 409 |
| AC-HW-04 | Học sinh lọc Tất cả, Chưa làm, Đang làm, Đã hoàn thành đúng; bài quá hạn hiển thị "trễ hạn" |
| AC-HW-05 | Gợi ý trả tối đa 3 bộ bài thuộc kỹ năng có tỷ lệ đúng dưới 50% |
| AC-HW-06 | Lịch tuần hiển thị đúng khung giờ và trạng thái học |
| AC-ATT-01 | Học sinh bắt đầu, trả lời, thoát ra, vào lại thấy đủ câu đã trả lời và tiếp tục được |
| AC-ATT-02 | API lấy câu hỏi trước khi nộp không chứa đáp án hay lời giải |
| AC-ATT-03 | Bộ chấm điểm đạt toàn bộ bảng ca biên (khoảng trắng, hoa thường, dấu tiếng Việt chuẩn hóa NFC, nhiều đáp án đúng, số có dấu phẩy) |
| AC-ATT-04 | Nộp bài tính điểm thang 10 đúng; nộp 2 lần đồng thời chỉ tạo 1 kết quả |
| AC-ATT-05 | Màn kết quả hiện điểm, đúng/sai/bỏ trống, thời gian, lời giải từng câu |
| AC-ATT-06 | Câu tự luận chuyển "chờ nhận xét"; phụ huynh chấm xong thì điểm cập nhật và con thấy nhận xét |

## Tiến độ

| Mã | Tiêu chí |
| --- | --- |
| AC-PRG-01 | Trang chủ học sinh hiển thị bài hôm nay, thời gian học, điểm tuần, chuỗi ngày đúng với dữ liệu test |
| AC-PRG-02 | Trang chủ phụ huynh chuyển giữa các con; số liệu từng con đúng; không thấy con gia đình khác |
| AC-PRG-03 | Điểm mạnh/cần cải thiện đúng ngưỡng 80%/50% với tối thiểu 5 câu |
| AC-PRG-04 | Thời gian học và chuỗi ngày tính đúng theo giờ Việt Nam qua nửa đêm |
| AC-PRG-05 | Biểu đồ tuần và hoạt động gần đây khớp dữ liệu; danh sách phân trang |

## Thông báo

| Mã | Tiêu chí |
| --- | --- |
| AC-NTF-01 | Con nộp bài thì phụ huynh có thông báo trong ứng dụng, số chưa đọc tăng, đánh dấu đọc thì giảm |
| AC-NTF-02 | Email nhắc hết dùng thử gửi khi còn 3 ngày và 1 ngày (kiểm tra trên staging với hộp thư thử) |
| AC-NTF-03 | Tin Zalo ZNS gửi được với mẫu đã duyệt |
| AC-NTF-04 | Báo cáo tuần gửi tối Chủ nhật với số liệu đúng tuần |

## Thanh toán

| Mã | Tiêu chí |
| --- | --- |
| AC-BIL-01 | Gia đình mới có trạng thái dùng thử 30 ngày; tạo lại tài khoản cùng email/số điện thoại không được dùng thử lần 2 |
| AC-BIL-02 | Giá: 1 con 50.000 đ; 2 con 90.000 đ; 3 con 130.000 đ |
| AC-BIL-03 | Hết dùng thử chưa trả: hệ thống áp dụng đúng chính sách Q-03; đã trả: không bị chặn |
| AC-BIL-04 | Thanh toán sandbox thành công gia hạn gói đúng 1 tháng; thất bại không gia hạn |
| AC-BIL-05 | Callback sai chữ ký bị từ chối; callback gửi 2 lần chỉ gia hạn 1 lần |
| AC-BIL-06 | Giao dịch treo được đối soát và cập nhật đúng trạng thái |
| AC-BIL-07 | Phụ huynh xem gói hiện tại, ngày hết hạn, lịch sử thanh toán |

## Phát hành

| Mã | Tiêu chí |
| --- | --- |
| AC-REL-01 | 6 hành trình E2E PASS: đăng ký → tạo con; giao bài; con làm bài; phụ huynh xem kết quả; thanh toán sandbox; xóa dữ liệu con |
| AC-REL-02 | Tài liệu 16 không còn lỗi bảo mật mức cao hoặc nghiêm trọng đang mở |
| AC-REL-03 | Đạt NFR-PERF-03, 04 với 1.000 người dùng mô phỏng trên staging |
| AC-REL-04 | Chủ dự án ký nghiệm thu UAT |
| AC-REL-05 | Đã diễn tập khôi phục DB thành công; có rollback plan và smoke test viết sẵn |
| AC-REL-06 | Smoke test production PASS sau triển khai |

## Camera (GĐ2)

| Mã | Tiêu chí |
| --- | --- |
| AC-CAM-01 | Có văn bản luật sư duyệt phương án camera |
| AC-CAM-02 | Camera không chạy nếu phụ huynh chưa bật và chưa đồng ý; rút đồng ý thì dừng ngay |
| AC-CAM-03 | Khi camera chạy, chỉ báo "Camera đang bật" luôn hiển thị trên màn học sinh |
| AC-CAM-04 | Theo dõi lưu lượng mạng trong phiên: không có dữ liệu video/ảnh gửi lên máy chủ ứng dụng |
| AC-CAM-05 | Sự kiện tập trung hiển thị đúng trong báo cáo phiên và tuần |
| AC-CAM-06 | Chỉ phụ huynh cùng gia đình xem trực tiếp được; người khác kết nối bị từ chối |
| AC-CAM-07 | Nhóm thử nghiệm hoàn thành; phản hồi được ghi nhận |
