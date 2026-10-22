import type { Metadata } from 'next';
import { VerifyForm } from './verify-form';

export const metadata: Metadata = { title: 'Xác thực email · Cùng Con Học' };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyForm initialEmail={typeof email === 'string' ? email : ''} />;
}
