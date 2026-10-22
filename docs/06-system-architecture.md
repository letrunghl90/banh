# 06. Kiến trúc hệ thống (đề xuất, chờ duyệt)

- Phiên bản: 0.1 (PHASE 02), ngày 22/10/2026
- Trạng thái: **đề xuất**. Chưa triển khai gì. Cần chủ dự án duyệt trước PHASE 04.

## 1. Quyết định kiến trúc chính

| Mã | Quyết định | Lý do | Phương án đã cân nhắc |
| --- | --- | --- | --- |
| ADR-01 | Một ứng dụng **Next.js (App Router, TypeScript)** làm cả giao diện và API, chia module theo nghiệp vụ (modular monolith) | Đội nhỏ, một ngôn ngữ, một lần triển khai; đủ cho quy mô 5.000 gia đình | Tách NestJS riêng: thêm một dịch vụ cần vận hành, chưa cần ở quy mô này |
| ADR-02 | **PostgreSQL** + **Prisma** | Dữ liệu quan hệ rõ (gia đình, bài, lượt làm, thanh toán); thống kê bằng SQL; migration có kiểm soát | MongoDB: yếu ở báo cáo và ràng buộc toàn vẹn |
| ADR-03 | **Redis + BullMQ** và một tiến trình **worker** riêng | Gửi thông báo, báo cáo tuần, đối soát thanh toán, nhập nội dung hàng loạt chạy nền | Cron trong Next.js: không bền khi khởi động lại |
| ADR-04 | Kho file tương thích **S3** + CDN; file riêng tư qua URL ký có hạn | Video và PDF lớn, không đi qua máy chủ ứng dụng | Lưu file trên đĩa máy chủ: khó mở rộng, khó sao lưu |
| ADR-05 | Phiên đăng nhập lưu ở máy chủ (bảng `sessions`), cookie `HttpOnly` | Thu hồi phiên được ngay (đổi mật khẩu, khóa tài khoản), chuyển chế độ phụ huynh/học sinh an toàn | JWT không trạng thái: khó thu hồi |
| ADR-06 | Camera tích hợp qua một **lớp adapter** trong trình duyệt học sinh; máy chủ chỉ nhận sự kiện | Giữ video trên máy con; thay module được | Gửi video lên máy chủ phân tích: rủi ro pháp lý và chi phí cao |
| ADR-07 | Xem trực tiếp bằng **WebRTC** ngang hàng, có máy chủ TURN; tín hiệu qua WebSocket | Không lưu video, độ trễ thấp | Phát qua máy chủ media: tốn chi phí, video đi qua hạ tầng |

ADR-06 và ADR-07 phụ thuộc Q-01 (module camera có sẵn). Có thể thay đổi sau khi khảo sát module.

Ghi chú: tài liệu kế hoạch ban đầu (Claude Doc) đề xuất NestJS cho API; ADR-01 thay bằng Next.js full-stack để giảm số dịch vụ cần vận hành. Nếu bạn muốn giữ NestJS, kiến trúc module vẫn giữ nguyên.

## 2. Sơ đồ tổng thể

```
                 ┌────────────────────── Trình duyệt ──────────────────────┐
                 │  Phụ huynh (web)     Học sinh (web)       Quản trị (web) │
                 │                      └ Adapter camera (GĐ2)              │
                 │                         xử lý video tại máy              │
                 └──────┬───────────────────┬──────────────────────┬───────┘
                        │ HTTPS             │ HTTPS + WebSocket    │ HTTPS
                        ▼                   ▼                      ▼
                 ┌──────────────────── Ứng dụng Next.js ──────────────────────┐
                 │  Giao diện (Server/Client Components)                       │
                 │  Route Handlers /api/v1/*  ·  Server Actions (form nội bộ)  │
                 │  Lớp dịch vụ theo module M01..M11                           │
                 │  Kiểm tra quyền + validate (zod) tại ranh giới              │
                 └───┬─────────────┬──────────────┬──────────────┬─────────────┘
                     ▼             ▼              ▼              ▼
               PostgreSQL     Redis/BullMQ    Kho file S3     Cổng thanh toán
                                  │            + CDN          (VNPay/MoMo)
                                  ▼
                            Worker nền ──► Email · Zalo ZNS · SMS OTP

   GĐ2: Học sinh ◄──── WebRTC (qua TURN nếu cần) ────► Phụ huynh   (không ghi)
```

## 3. Cấu trúc thư mục dự kiến

```
cung-con-hoc/
├─ src/
│  ├─ app/                      # Next.js App Router
│  │  ├─ (auth)/                # đăng nhập, đăng ký, chọn hồ sơ con
│  │  ├─ (parent)/              # màn hình phụ huynh
│  │  ├─ (student)/             # màn hình học sinh
│  │  ├─ admin/                 # quản trị
│  │  └─ api/v1/                # Route Handlers (REST)
│  ├─ modules/                  # logic nghiệp vụ, không phụ thuộc giao diện
│  │  ├─ account/   (M01)       ├─ content/   (M02)
│  │  ├─ library/   (M03)       ├─ homework/  (M04)
│  │  ├─ attempt/   (M05)       ├─ progress/  (M06)
│  │  ├─ notify/    (M07)       ├─ billing/   (M08)
│  │  ├─ session/   (M09)       ├─ camera/    (M10)
│  │  └─ admin/     (M11)
│  ├─ lib/                      # db client, auth, rbac, logger, errors, storage
│  └─ components/               # UI dùng chung
├─ worker/                      # tiến trình BullMQ
├─ prisma/                      # schema + migrations
├─ tests/                       # unit, integration, e2e (Playwright)
└─ docs/
```

Mỗi module có: `service.ts` (nghiệp vụ), `schema.ts` (zod), `repo.ts` (truy vấn), `policy.ts` (quyền), test kèm.

## 4. Quy ước Next.js

| Vấn đề | Quy ước |
| --- | --- |
| Router | App Router |
| Server/Client Components | Mặc định Server Component; Client Component chỉ cho phần tương tác (làm bài, biểu đồ, camera) |
| Ghi dữ liệu | Route Handlers `/api/v1/*` cho mọi thao tác (dùng chung cho web và app di động sau này); Server Actions chỉ cho form quản trị đơn giản và vẫn gọi lớp dịch vụ |
| Kết nối DB | Một Prisma client dùng chung (singleton), pool kết nối qua PgBouncer khi chạy nhiều tiến trình |
| Validate | zod ở mọi Route Handler và Server Action |
| Phân quyền | Hàm `requireActor()` + `policy` của module, gọi ở server trong mọi handler; giao diện chỉ ẩn nút để tiện dùng |
| Lỗi | Lớp `AppError` có mã lỗi; handler chuyển thành JSON thống nhất (tài liệu 08) |

## 5. Luồng dữ liệu chính

**Làm bài:** học sinh mở bài → `POST /attempts` tạo lượt làm (chụp phiên bản câu hỏi) → mỗi câu `PUT /attempts/{id}/answers/{questionId}` lưu và chấm ngay câu tự chấm → `POST /attempts/{id}/submit` tính điểm trong transaction → đẩy job `progress.recalc` và `notify.attempt_submitted` → worker cập nhật bảng tổng hợp kỹ năng và gửi thông báo phụ huynh.

**Thanh toán:** phụ huynh chọn con → `POST /billing/checkout` tạo `payment` trạng thái `pending` và URL cổng → cổng gọi `POST /billing/webhooks/{provider}` → kiểm tra chữ ký, idempotent theo mã giao dịch → transaction cập nhật `payment` và gia hạn `subscription` → thông báo. Worker đối soát các giao dịch `pending` quá 15 phút.

**Camera (GĐ2):** adapter trong trình duyệt học sinh → mỗi 10 đến 30 giây gửi `POST /study-sessions/{id}/focus-events` (điểm tập trung, loại sự kiện, thời điểm) → phụ huynh xem báo cáo. Xem trực tiếp: tín hiệu WebRTC qua WebSocket, luồng video đi thẳng giữa hai trình duyệt.

## 6. Môi trường

| Môi trường | Mục đích | Dữ liệu |
| --- | --- | --- |
| Local | Phát triển | Dữ liệu mẫu tạo bằng script seed, gắn nhãn rõ là dữ liệu mẫu |
| CI | Lint, typecheck, test, build cho mỗi pull request | Database tạm |
| Staging | Kiểm thử tích hợp, UAT; cổng thanh toán chế độ sandbox | Không dùng dữ liệu thật của trẻ |
| Production | Người dùng thật | Dữ liệu thật, sao lưu theo NFR-OPS |

Hạ tầng cụ thể (nhà cung cấp, vị trí) chờ Q-13 và tư vấn luật về vị trí dữ liệu.

## 7. Sao lưu, khôi phục, sự cố

- PostgreSQL dạng dịch vụ quản lý có PITR, sao lưu hằng ngày giữ 30 ngày, một bản sao lưu ở vùng khác.
- Kho file bật versioning; nội dung gốc có thể nhập lại.
- Redis chỉ chứa hàng đợi và bộ nhớ đệm; mất Redis không mất dữ liệu nghiệp vụ (job quan trọng như đối soát chạy lại được).
- Sổ tay sự cố: phát hiện (cảnh báo) → khoanh vùng → rollback bản triển khai hoặc khôi phục DB theo thời điểm → thông báo phụ huynh nếu ảnh hưởng dữ liệu → ghi nhận sau sự cố. Lộ dữ liệu cá nhân: thông báo cơ quan chức năng theo thời hạn luật định (cần luật sư xác nhận thời hạn).
