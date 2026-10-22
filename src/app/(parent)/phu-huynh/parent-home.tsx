'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/client/api';
import ui from '@/components/ui.module.css';
import { Children, type Child } from './children';

interface Me {
  mode: string;
  user: { fullName: string };
  family: { name: string; status: string; trialEndsAt: string | null } | null;
}

export function ParentHome() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    const { items } = await api.get<{ items: Child[] }>('/students');
    setChildren(items);
  }, []);

  useEffect(() => {
    Promise.all([api.get<Me>('/me'), api.get<{ items: Child[] }>('/students')])
      .then(([m, s]) => {
        setMe(m);
        setChildren(s.items);
      })
      .catch((err: ApiError) => {
        if (err.status === 401) router.replace('/dang-nhap');
        // Máy đang ở chế độ học sinh: không cho xem trang phụ huynh.
        else if (err.status === 403) router.replace('/hoc-sinh');
        else setError(err.message);
      });
  }, [router]);

  async function logout() {
    await api.post('/auth/logout').catch(() => undefined);
    router.replace('/dang-nhap?tb=dang-xuat');
  }

  if (error) {
    return (
      <p className={ui.error} role="alert">
        {error}
      </p>
    );
  }
  if (!me) return <p>Đang tải...</p>;

  const trialEnds = me.family?.trialEndsAt
    ? new Date(me.family.trialEndsAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : null;

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Xin chào, {me.user.fullName}!</h1>
          {me.family?.status === 'trial' && trialEnds && (
            <p className={ui.muted}>Bạn đang dùng thử miễn phí đến hết ngày {trialEnds}.</p>
          )}
        </div>
        <div className={ui.actions}>
          {children.length > 0 && (
            <Link className={ui.primary} href="/chon-ho-so">
              Cho con học
            </Link>
          )}
          <button type="button" className={ui.button} onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <Children items={children} onChanged={loadChildren} />

      <p className={ui.muted}>Giao bài, theo dõi tiến độ và báo cáo của con đang được xây dựng.</p>
    </div>
  );
}
