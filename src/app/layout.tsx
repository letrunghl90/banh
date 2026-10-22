import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cùng Con Học',
  description: 'Phụ huynh đồng hành cùng con học Toán và Tiếng Việt lớp 3',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Đọc header để trang luôn render động: CSP dùng nonce mới cho mỗi lần tải trang.
  await headers();
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
