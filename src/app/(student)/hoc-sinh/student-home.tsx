'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Avatar } from '@/components/avatar';
import ui from '@/components/ui.module.css';
import { api, ApiError } from '@/lib/client/api';

interface Me {
  mode: string;
  student: { id: string; displayName: string; avatarKey: string | null } | null;
}

export function StudentHome() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Me>('/me')
      .then((m) => {
        if (m.mode !== 'student') router.replace('/phu-huynh');
        else setMe(m);
      })
      .catch((err: ApiError) => {
        if (err.status === 401) router.replace('/dang-nhap');
        else setError(err.message);
      });
  }, [router]);

  async function toParent(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/session/parent', { password });
      router.replace('/phu-huynh');
    } catch (err) {
      setError((err as ApiError).message);
      setPassword('');
      setBusy(false);
    }
  }

  if (!me?.student) {
    return error ? (
      <p className={ui.error} role="alert">
        {error}
      </p>
    ) : (
      <p>Đang tải...</p>
    );
  }

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div className={ui.actions}>
          <Avatar avatarKey={me.student.avatarKey} large />
          <h1>Chào {me.student.displayName}!</h1>
        </div>
        {!asking && (
          <button type="button" className={ui.button} onClick={() => setAsking(true)}>
            Về chế độ phụ huynh
          </button>
        )}
      </header>

      {asking && (
        <form className={`${ui.card} ${ui.form}`} onSubmit={toParent} noValidate>
          <p className={ui.muted}>Phụ huynh nhập mật khẩu để quay lại.</p>
          {error && (
            <p className={ui.error} role="alert">
              {error}
            </p>
          )}
          <label className={ui.label}>
            Mật khẩu phụ huynh
            <input
              className={ui.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </label>
          <div className={ui.actions}>
            <button type="submit" className={ui.primary} disabled={busy || !password}>
              {busy ? 'Đang kiểm tra...' : 'Xác nhận'}
            </button>
            <button
              type="button"
              className={ui.button}
              onClick={() => {
                setAsking(false);
                setPassword('');
                setError(null);
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <p className={ui.muted}>Bài học và bài tập của con sẽ hiện ở đây.</p>
    </div>
  );
}
