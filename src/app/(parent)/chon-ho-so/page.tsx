import type { Metadata } from 'next';
import { ProfilePicker } from './profile-picker';

export const metadata: Metadata = { title: 'Chọn hồ sơ · Cùng Con Học' };

/** Con chọn hồ sơ của mình và nhập PIN để vào học (T-208, FR-01-06). */
export default function ChooseProfilePage() {
  return (
    <main>
      <ProfilePicker />
    </main>
  );
}
