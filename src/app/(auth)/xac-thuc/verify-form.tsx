'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/client/api';
import styles from '../auth.module.css';

export function VerifyForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await api.post('/auth/verify', { email, code });
      router.replace('/phu-huynh');
    } catch (err) {
      setError(err as ApiError);
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setNotice(null);
    try {
      await api.post('/auth/verify/resend', { email });
      setCode('');
      setNotice('Nếu email này đang chờ xác thực, mã mới đã được gửi. Hãy kiểm tra hộp thư.');
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Xác thực email</h1>
      <p className={styles.lead}>
        Nhập mã 6 số đã gửi tới email của bạn. Mã có hiệu lực trong 10 phút.
      </p>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Mã xác thực
          <input
            className={`${styles.input} ${styles.code}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
          />
        </label>
        <button className={styles.primary} type="submit" disabled={busy || code.length !== 6}>
          {busy ? 'Đang xác thực…' : 'Xác thực'}
        </button>
        <button className={styles.secondary} type="button" onClick={resend} disabled={!email}>
          Gửi lại mã
        </button>
      </form>
      <p className={styles.footer}>
        <Link className={styles.link} href="/dang-nhap">
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  );
}
