/**
 * IP của người gọi, dùng cho giới hạn tần suất. Giả định ứng dụng chạy sau một reverse proxy
 * tin cậy, proxy này ghi đè X-Forwarded-For (cấu hình ở T-107). Không dùng IP để phân quyền.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
