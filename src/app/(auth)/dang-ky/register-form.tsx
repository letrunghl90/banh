'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/client/api';
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from '@/modules/account/legal';
import styles from '../auth.module.css';

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError(
        new ApiError(400, {
          code: 'VALIDATION_ERROR',
          message: 'Bạn cần đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư.',
        }),
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        acceptTermsVersion: CURRENT_TERMS_VERSION,
        acceptPrivacyVersion: CURRENT_PRIVACY_VERSION,
      });
      router.push(`/xac-thuc?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      setError(err as ApiError);
      setBusy(false);
    }
  }

  const bad = (f: string) =>
    error?.field(f) ? `${styles.input} ${styles.inputError}` : styles.input;

  return (
    <>
      <h1 className={styles.title}>Đăng ký</h1>
      <p className={styles.lead}>Tạo tài khoản phụ huynh, dùng thử miễn phí 30 ngày.</p>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {error && (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        )}
        <label className={styles.label}>
          Họ và tên phụ huynh
          <input
            className={bad('fullName')}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            className={bad('email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Mật khẩu
          <input
            className={bad('password')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <span className={styles.hint}>Ít nhất 8 ký tự.</span>
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            Tôi đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư của Cùng Con Học, bao gồm
            việc xử lý dữ liệu học tập của con tôi.
          </span>
        </label>
        <button className={styles.primary} type="submit" disabled={busy}>
          {busy ? 'Đang tạo tài khoản…' : 'Đăng ký'}
        </button>
      </form>
      <p className={styles.footer}>
        Đã có tài khoản?{' '}
        <Link className={styles.link} href="/dang-nhap">
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
