import type { Metadata } from 'next';
import { StudentHome } from './student-home';

export const metadata: Metadata = { title: 'Học sinh · Cùng Con Học' };

/** Trang chủ học sinh tạm thời: nội dung thật làm ở T-701. */
export default function StudentPage() {
  return (
    <main>
      <StudentHome />
    </main>
  );
}
