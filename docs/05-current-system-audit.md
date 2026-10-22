# 05. Khảo sát hệ thống hiện tại

- Phiên bản: 0.1 (PHASE 02), ngày 22/10/2026

## 1. Kết luận

Chưa có hệ thống phần mềm nào để khảo sát. Dự án chưa có repository, chưa có code, chưa có database, chưa có môi trường triển khai. Đây là dự án làm mới từ đầu (greenfield). Các mục khảo sát kỹ thuật trong master prompt (framework, schema, auth, biến môi trường, log...) vì vậy đều ở trạng thái **không áp dụng**, và được thay bằng thiết kế mới ở tài liệu 06 đến 09.

## 2. Tài sản hiện có

| Tài sản | Trạng thái | Đã kiểm tra | Ghi chú |
| --- | --- | --- | --- |
| 10 ảnh mockup UI (PNG) | Có | Có, đã xem từng ảnh | Chỉ là ảnh tĩnh; số liệu minh họa |
| File thiết kế gốc (Figma) | Chưa rõ | Không | Q-10 |
| Nội dung Toán, Tiếng Việt lớp 3 | Chủ dự án cho biết đã có | Không, chưa được chia sẻ | Q-02 |
| Module camera | Chủ dự án cho biết đã có | Không, chưa được chia sẻ | Q-01; cần khảo sát riêng khi có mã nguồn hoặc tài liệu |
| Repository | Không có | | Cần tạo hoặc cấp quyền |
| Tên miền, hạ tầng | Chưa rõ | Không | Q-13 |
| Tài khoản cổng thanh toán, Zalo OA | Chưa rõ | Không | Q-07 |

## 3. Việc khảo sát còn lại

1. Khi có module camera: đọc mã nguồn hoặc tài liệu, ghi nhận công nghệ, nơi xử lý video, dữ liệu gửi đi, giấy phép thư viện, hiệu năng trên máy tính bảng. Cập nhật tài liệu này và tài liệu 06, 09.
2. Khi có nội dung mẫu: xác định định dạng, cấu trúc, số lượng, các loại câu hỏi thực tế; cập nhật tài liệu 07 và thiết kế công cụ nhập.
3. Khi có file Figma: đối chiếu với danh sách màn hình ở tài liệu 02.

## 4. Điểm cần chú ý từ mockup

| Điểm | Mức độ | Đề xuất |
| --- | --- | --- |
| Mockup dùng logo Violympic, Kangaroo, IMO, ASMO và ảnh bìa sách "Kết nối tri thức với cuộc sống" | Cao (bản quyền, thương hiệu) | Không dùng khi chưa có giấy phép |
| Màn "Theo dõi học tập" có nút "Ghi hình", "Bật âm thanh", dòng ảnh theo thời gian | Cao (quyền riêng tư) | Bỏ ghi hình; ảnh chỉ khi đồng ý riêng (Q-12) |
| Học sinh có mục "Theo dõi camera" trong menu | Trung bình | Chỉ phụ huynh thấy |
| Chữ nhỏ, nhiều số liệu ở giao diện học sinh | Trung bình | Thử với trẻ thật, theo NFR-UX-03 |
| Hai phiên bản trang chủ phụ huynh | Thấp | Chọn một (Q-10) |
