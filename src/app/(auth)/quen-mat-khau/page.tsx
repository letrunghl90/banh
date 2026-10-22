import type { Metadata } from 'next';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = { title: 'Quên mật khẩu · Cùng Con Học' };

export default function ForgotPage() {
  return <ForgotForm />;
}
