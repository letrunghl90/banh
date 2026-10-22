'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/client/api';
import styles from './parent.module.css';

interface Me {
  mode: string;
  user: { fullName: string };
  family: { name: string; status: string; trialEndsAt: string | null } | null;
}

export function ParentHome() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Me>('/me')
      .then(setMe)
      .catch((err: ApiError) => {
        if (err.status === 401) router.replace('/dang-nhap');
        else setError(err.message);
      });
  }, [router]);

  async function logout() {
    await api.post('/auth/logout').catch(() => undefined);
    router.replace('/dang-nhap?tb=dang-xuat');
  }

  if (error) return <p role="alert">{error}</p>;
  if (!me) return <p>Đang tải...</p>;

  const trialEnds = me.family?.trialEndsAt
    ? new Date(me.family.trialEndsAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : null;

  return (
    <section className={styles.box}>
      <h1>Xin chào, {me.user.fullName}!</h1>
      {me.family && <p>{me.family.name}</p>}
      {me.family?.status === 'trial' && trialEnds && (
        <p>Bạn đang dùng thử miễn phí đến hết ngày {trialEnds}.</p>
      )}
      <p className={styles.muted}>
        Trang chủ phụ huynh (hồ sơ con, giao bài, tiến độ) đang được xây dựng.
      </p>
      <button type="button" className={styles.button} onClick={logout}>
        Đăng xuất
      </button>
    </section>
  );
}
