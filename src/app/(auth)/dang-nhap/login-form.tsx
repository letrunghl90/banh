'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/client/api';
import styles from '../auth.module.css';

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/login', { email, password, remember });
      router.replace('/phu-huynh');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.field?.('email') && apiErr.body.details?.[0]?.issue === 'unverified') {
        router.push(`/xac-thuc?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(apiErr);
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Đăng nhập</h1>
      <p className={styles.lead}>Hãy đăng nhập để tiếp tục hành trình học tập cùng con!</p>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {notice && <p className={styles.notice}>{notice}</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        )}
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Mật khẩu
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div className={styles.row}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>
          <Link className={styles.link} href="/quen-mat-khau">
            Quên mật khẩu?
          </Link>
        </div>
        <button className={styles.primary} type="submit" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <p className={styles.hint}>
          Con đăng nhập bằng cách chọn hồ sơ của mình sau khi phụ huynh đã đăng nhập trên máy.
        </p>
      </form>
      <p className={styles.footer}>
        Chưa có tài khoản?{' '}
        <Link className={styles.link} href="/dang-ky">
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}
