import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Đăng nhập · Cùng Con Học' };

const NOTICES: Record<string, string> = {
  'dat-lai': 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.',
  'dang-xuat': 'Bạn đã đăng xuất.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tb?: string }>;
}) {
  const { tb } = await searchParams;
  return <LoginForm notice={tb ? NOTICES[tb] : undefined} />;
}
