# 08. Đặc tả API (đề xuất)

- Phiên bản: 0.1 (PHASE 02), ngày 22/10/2026
- REST, JSON, tiền tố `/api/v1`. Xác thực bằng cookie phiên `ccl_session` (HttpOnly). Thao tác ghi yêu cầu header `X-CSRF-Token` khớp với cookie CSRF.
- Cột "Quyền": `P` phụ huynh (chế độ phụ huynh), `S` học sinh (chế độ học sinh), `A` quản trị, `-` không cần đăng nhập. Mọi API có `P`/`S` chỉ truy cập dữ liệu trong gia đình của phiên.

## 1. Quy ước chung

**Lỗi:**

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Mã PIN phải gồm 4 chữ số", "details": [{ "field": "pin", "issue": "format" }] } }
```

| HTTP | code | Khi nào |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |
| 401 | `UNAUTHENTICATED` | Chưa đăng nhập hoặc phiên hết hạn |
| 403 | `FORBIDDEN` | Không có quyền (kể cả truy cập dữ liệu gia đình khác) |
| 402 | `SUBSCRIPTION_REQUIRED` | Hết dùng thử/hết gói, theo chính sách Q-03 |
| 404 | `NOT_FOUND` | Không tồn tại hoặc không thuộc gia đình (trả 404 để không lộ sự tồn tại) |
| 409 | `CONFLICT` | Trạng thái không cho phép (ví dụ hủy bài đã bắt đầu) |
| 429 | `RATE_LIMITED` | Vượt giới hạn tần suất |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống, kèm `requestId` |

**Phân trang:** `?cursor=...&limit=20` (tối đa 100), trả `{ "items": [...], "nextCursor": "..." }`.

**Thời gian:** ISO 8601 UTC; ngày hạn nộp dạng `YYYY-MM-DD` theo giờ Việt Nam.

## 2. Danh sách endpoint

### M01. Tài khoản

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/auth/register` | - | Đăng ký phụ huynh |
| POST | `/auth/verify` | - | Xác thực OTP; thành công thì tạo gia đình, bắt đầu dùng thử và đăng nhập |
| POST | `/auth/verify/resend` | - | Gửi lại mã xác thực: `{ email }`, luôn trả 200 |
| POST | `/auth/login` | - | Đăng nhập |
| GET | `/auth/google/callback` | - | Đăng nhập Google |
| POST | `/auth/logout` | P, S, A | Đăng xuất |
| POST | `/auth/password/forgot` · `/auth/password/reset` | - | Quên/đặt lại mật khẩu |
| GET | `/me` | P, S, A | Thông tin phiên, chế độ, gia đình, trạng thái gói |
| GET · POST | `/students` | P | Danh sách/tạo hồ sơ con |
| PATCH · DELETE | `/students/{id}` | P | Sửa/xóa hồ sơ con |
| POST | `/students/{id}/pin` | P | Đặt lại PIN; đồng thời mở khóa nếu con nhập sai quá 5 lần |
| POST | `/session/student` | P | Vào chế độ học sinh: `{ studentId, pin }`. Cấp token phiên mới, thu hồi token cũ, giữ nguyên hạn phiên |
| POST | `/session/parent` | S | Về chế độ phụ huynh: `{ password }`. Sai 5 lần/15 phút trả 429. Cấp token mới như trên |
| POST | `/students/{id}/export` | P | Yêu cầu xuất dữ liệu (job nền, gửi link) |
| POST | `/consents` | P | Ghi nhận đồng ý |

Ví dụ `POST /auth/register`:

```json
// request
{ "fullName": "Nguyễn Văn A", "email": "a@example.com", "phone": null, "password": "********", "acceptTermsVersion": "2026-11-01", "acceptPrivacyVersion": "2026-11-01" }
// 201
{ "userId": "…", "verification": { "channel": "email", "expiresAt": "…" } }
```

Ví dụ `POST /session/student`:

```json
// request
{ "studentId": "…", "pin": "1234" }
// 200
{ "mode": "student", "student": { "id": "…", "displayName": "Minh Anh", "avatarKey": "boy-03" } }
// 429 sau 5 lần sai: { "error": { "code": "RATE_LIMITED", "message": "Nhập sai PIN quá 5 lần. Thử lại sau 15 phút." } }
```

### M02, M03. Nội dung và thư viện

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/subjects` | P, S | Môn của lớp 3 |
| GET | `/subjects/{id}/topics` | P, S | Chủ đề, kèm tiến độ nếu là học sinh |
| GET | `/topics/{id}/lessons` | P, S | Bài học trong chủ đề |
| GET | `/lessons/{id}` | P, S | Chi tiết bài học, URL tài nguyên ký có hạn |
| POST | `/lessons/{id}/progress` | S | Ghi nhận xem bài: `{ stepIndex, secondsSpent, completed }` |
| GET | `/assessments?subjectId=&topicId=` | P | Bộ bài tập để giao |
| CRUD | `/admin/subjects`, `/admin/topics`, `/admin/lessons`, `/admin/questions`, `/admin/assessments` | A | Quản lý nội dung |
| POST | `/admin/imports` | A | Tải file nhập hàng loạt, trả `importId` |
| GET | `/admin/imports/{id}` | A | Trạng thái và lỗi từng dòng |
| POST | `/admin/uploads` | A | Lấy URL tải lên ký sẵn cho video/PDF |

### M04, M05. Bài tập và làm bài

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/assignments` | P | Giao bài: `{ assessmentId, studentIds: [], dueDate, note }` |
| GET | `/assignments?studentId=&status=` | P, S | Danh sách bài đã giao (học sinh chỉ thấy của mình) |
| PATCH | `/assignments/{id}` | P | Sửa hạn nộp |
| DELETE | `/assignments/{id}` | P | Hủy (409 nếu đã bắt đầu) |
| GET | `/assignments/suggestions?studentId=` | P | Tối đa 3 gợi ý theo kỹ năng yếu |
| POST | `/attempts` | S | Bắt đầu hoặc tiếp tục: `{ assessmentId, assignmentId }` |
| GET | `/attempts/{id}` | P, S | Câu hỏi (không có đáp án khi chưa nộp), câu trả lời đã lưu |
| PUT | `/attempts/{id}/answers/{questionId}` | S | Lưu câu trả lời: `{ response }` |
| POST | `/attempts/{id}/submit` | S | Nộp bài, trả kết quả |
| GET | `/attempts/{id}/result` | P, S | Kết quả, lời giải |
| POST | `/attempts/{id}/answers/{questionId}/review` | P | Chấm tự luận: `{ points, comment }` |

Ví dụ `POST /attempts/{id}/submit` 200:

```json
{ "attemptId": "…", "status": "graded", "score": 8.5, "correct": 17, "wrong": 3, "blank": 0, "durationSec": 1124, "isLate": false, "pendingReview": 0 }
```

### M06, M09. Tiến độ, phiên học

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/students/{id}/dashboard` | P, S | Số liệu trang chủ |
| GET | `/students/{id}/progress?range=7d` | P | Biểu đồ, theo môn, theo kỹ năng |
| GET | `/students/{id}/activity` | P | Hoạt động gần đây (phân trang) |
| GET | `/students/{id}/strengths` | P | Điểm mạnh, cần cải thiện |
| POST | `/study-sessions` · `/study-sessions/{id}/heartbeat` · `/study-sessions/{id}/end` | S | Phiên học |
| GET · PUT | `/students/{id}/schedule` | P | Lịch học tuần |

### M07. Thông báo

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/notifications` | P, S | Danh sách, số chưa đọc |
| POST | `/notifications/{id}/read` · `/notifications/read-all` | P, S | Đánh dấu đã đọc |
| GET · PUT | `/notification-prefs` | P | Bật/tắt kênh theo loại |

### M08. Thanh toán

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/billing/quote?studentIds=` | P | Tính giá: con đầu 50.000 đ, con sau 40.000 đ |
| POST | `/billing/checkout` | P | Tạo giao dịch, trả `redirectUrl` của cổng |
| POST | `/billing/webhooks/{provider}` | - (kiểm tra chữ ký) | Callback/IPN từ cổng, idempotent |
| GET | `/billing/return` | P | Trang quay về sau thanh toán, chỉ hiển thị trạng thái đọc từ DB |
| GET | `/billing/subscription` · `/billing/payments` | P | Gói hiện tại, lịch sử thanh toán |

Ví dụ `GET /billing/quote?studentIds=a,b`:

```json
{ "items": [ { "studentId": "a", "position": 1, "priceVnd": 50000 }, { "studentId": "b", "position": 2, "priceVnd": 40000 } ], "totalVnd": 90000, "periodMonths": 1 }
```

### M10. Camera (GĐ2, phụ thuộc Q-01)

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| PUT | `/students/{id}/camera-settings` | P | Bật/tắt, cần đồng ý `camera` |
| POST | `/study-sessions/{id}/focus-events` | S | Gửi lô sự kiện: `{ events: [{ occurredAt, type, score, durationSec }] }`, tối đa 50 sự kiện/lần |
| GET | `/study-sessions/{id}/focus-report` | P | Báo cáo phiên |
| GET | `/students/{id}/focus-summary?range=7d` | P | Báo cáo tuần |
| WS | `/ws/live` | P, S | Tín hiệu WebRTC; phụ huynh chỉ kết nối tới con trong gia đình đang có phiên học bật camera |

### M11. Quản trị

| Method | Đường dẫn | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/admin/families?q=` | A | Tìm gia đình (ghi audit log) |
| POST | `/admin/families/{id}/extend-trial` | A | Gia hạn dùng thử |
| GET | `/admin/payments` | A | Giao dịch, đối soát |
| GET | `/admin/stats` | A | Số gia đình, dùng thử, trả phí, doanh thu |

## 3. Giới hạn tần suất

| Endpoint | Giới hạn |
| --- | --- |
| `/auth/login`, `/auth/register` | 10 lần/phút/IP, 5 lần sai/15 phút/tài khoản |
| Gửi OTP | 3 lần/10 phút/đích, 10 lần/ngày |
| `/session/student` (PIN) | 5 lần sai thì khóa 15 phút |
| `/attempts/*/answers/*` | 120 lần/phút/học sinh |
| `/focus-events` | 12 lần/phút/phiên |
