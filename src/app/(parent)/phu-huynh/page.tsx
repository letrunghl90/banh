import type { Metadata } from 'next';
import { ParentHome } from './parent-home';

export const metadata: Metadata = { title: 'Phụ huynh · Cùng Con Học' };

/** Trang chủ phụ huynh tạm thời: chỉ xác nhận đã đăng nhập. Nội dung thật làm ở T-702. */
export default function ParentPage() {
  return (
    <main>
      <ParentHome />
    </main>
  );
}
