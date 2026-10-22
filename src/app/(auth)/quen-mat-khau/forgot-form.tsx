'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/client/api';
import styles from '../auth.module.css';

export function ForgotForm() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/password/forgot', { email });
      setStep('reset');
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/password/reset', { email, code, newPassword });
      router.replace('/dang-nhap?tb=dat-lai');
    } catch (err) {
      setError(err as ApiError);
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Quên mật khẩu</h1>
      {step === 'email' ? (
        <form className={styles.form} onSubmit={sendCode} noValidate>
          <p className={styles.lead}>
            Nhập email đã đăng ký, chúng tôi sẽ gửi mã đặt lại mật khẩu.
          </p>
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
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? 'Đang gửi…' : 'Gửi mã'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={reset} noValidate>
          <p className={styles.notice}>
            Nếu email này có tài khoản, mã đặt lại đã được gửi. Mã có hiệu lực trong 10 phút.
          </p>
          {error && (
            <p className={styles.error} role="alert">
              {error.message}
            </p>
          )}
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
          <label className={styles.label}>
            Mật khẩu mới
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
            <span className={styles.hint}>
              Ít nhất 8 ký tự. Mọi thiết bị đang đăng nhập sẽ bị đăng xuất.
            </span>
          </label>
          <button className={styles.primary} type="submit" disabled={busy || code.length !== 6}>
            {busy ? 'Đang đặt lại…' : 'Đặt lại mật khẩu'}
          </button>
          <button className={styles.secondary} type="button" onClick={() => setStep('email')}>
            Gửi lại mã
          </button>
        </form>
      )}
      <p className={styles.footer}>
        <Link className={styles.link} href="/dang-nhap">
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  );
}
