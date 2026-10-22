import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Đăng ký · Cùng Con Học' };

export default function RegisterPage() {
  return <RegisterForm />;
}
