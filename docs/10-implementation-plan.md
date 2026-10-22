# 10. Kế hoạch triển khai

- Phiên bản: 0.1 (PHASE 03), ngày 22/10/2026
- Cơ sở ước tính: backlog tài liệu 11 (khoảng 203 ngày công cho MVP), giả định đội **3 lập trình viên toàn thời gian** (Q-09 chưa trả lời). Với 2 người, mỗi milestone phát triển kéo dài khoảng 1,5 lần.
- Tuần được đếm từ ngày bắt đầu (T0) là ngày chủ dự án duyệt kế hoạch và cấp repository. Chưa gắn ngày lịch cụ thể.
- PHASE 04 (viết code) chỉ bắt đầu khi chủ dự án duyệt tài liệu 06 đến 13.

## 1. Milestone

| # | Milestone | Tuần | Task chính | Điều kiện hoàn thành (gate) |
| --- | --- | --- | --- | --- |
| 1 | Khảo sát và chốt yêu cầu | T0 đến T0+1 | E00: trả lời Q-01..Q-14, khảo sát camera (T-001), nội dung (T-002) | Q-01, Q-02, Q-03, Q-07, Q-09 có câu trả lời; tài liệu 01 đến 13 được duyệt |
| 2 | Kiến trúc và nền tảng | tuần 2 đến 3 | E01, T-201, T-301 | CI xanh; staging chạy được trang trống có đăng nhập; AC-PLT-* đạt |
| 3 | Phát triển MVP (lõi) | tuần 4 đến 9 | E02, E03, E04, E05 (P0, P1) | Phụ huynh đăng ký, tạo con, giao bài; con làm bài và xem kết quả trên staging |
| 4 | Hoàn thiện chức năng | tuần 10 đến 12 | E06, E07, E08, phần còn lại của E03 | Thanh toán sandbox chạy đầu cuối; nội dung thật đã nhập (T-307) |
| 5 | Kiểm thử và sửa lỗi | tuần 13 đến 14 | T-901 đến T-904 | Không còn lỗi P0/P1 mở; tài liệu 15, 16, 17 có kết quả thật |
| 6 | UAT và nghiệm thu | tuần 15 đến 16 | T-905 | Chủ dự án ký nghiệm thu theo tài liệu 13 |
| 7 | Staging và production | tuần 17 | T-906, T-907 | Có lệnh cho phép triển khai của chủ dự án; smoke test production đạt |
| 8 | Bảo hành, theo dõi, cải tiến | từ tuần 18 | Sửa lỗi, đo chỉ số thành công, bắt đầu GĐ2 camera (E10) | Thử nghiệm 30 đến 50 gia đình trong 4 tuần |

Tổng đến khi MVP lên production: **khoảng 17 tuần** với 3 người, **khoảng 23 tuần** với 2 người.

## 2. Thứ tự và phụ thuộc

Đường găng (critical path):

```
T-000 câu trả lời ──► T-002 nội dung ──► T-301 bảng nội dung ──► T-306 nhập hàng loạt ──► T-307 nhập thật ──► UAT
T-101 repo ──► T-104 lớp quyền ──► T-202 đăng nhập ──► T-207 hồ sơ con ──► T-208 chế độ học sinh
                                                      └► T-501 ──► T-505 làm bài ──► T-506 màn làm bài ──► T-602 thống kê ──► T-604 trang chủ phụ huynh
Q-07 cổng thanh toán (thủ tục bên ngoài, có thể mất 2 đến 4 tuần) ──► T-804 thanh toán ──► T-806
```

Việc có thể chạy song song: thủ tục cổng thanh toán, Zalo OA, luật sư và văn bản pháp lý bắt đầu ngay tuần đầu; thiết kế UI chi tiết (T-003) đi trước phát triển giao diện 1 đến 2 tuần; khảo sát và hồ sơ pháp lý cho camera (T-001, T-1001) chạy song song với MVP.

## 3. Phân công gợi ý (3 lập trình viên)

| Người | Trọng tâm |
| --- | --- |
| Dev A (backend, tech lead) | E01, lớp quyền, E05 API và chấm điểm, E08 thanh toán, bảo mật |
| Dev B (fullstack) | E02 tài khoản, E06 tiến độ, E07 thông báo |
| Dev C (frontend) | E04 thư viện, màn làm bài, các trang chủ, E03 màn quản trị |

## 4. Giai đoạn sau MVP

| Giai đoạn | Nội dung | Ước tính | Điều kiện bắt đầu |
| --- | --- | --- | --- |
| GĐ2 Camera đồng hành | E10 | khoảng 28 ngày công + thời gian pháp lý; ước tính lại sau T-001 | Luật sư duyệt; T-001 xác nhận module dùng được |
| GĐ3 Đề thi và mở rộng | Đề thi có giờ, thi có giám sát, thành tích, Tiếng Anh, Scratch, giáo viên | ước tính khi bắt đầu | Chỉ số thành công MVP đạt |

## 5. Báo cáo trong quá trình

Sau mỗi module (theo master prompt): việc đã xong, file thay đổi, kết quả test (PASS/FAIL/BLOCKED/NOT RUN), lỗi còn tồn tại, rủi ro, task tiếp theo. Cập nhật trạng thái trong tài liệu 11.
