'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Avatar } from '@/components/avatar';
import ui from '@/components/ui.module.css';
import { api, ApiError } from '@/lib/client/api';

interface Child {
  id: string;
  displayName: string;
  avatarKey: string | null;
}

export function ProfilePicker() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [selected, setSelected] = useState<Child | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ items: Child[] }>('/students')
      .then(({ items }) => {
        setChildren(items);
        if (items.length === 1) setSelected(items[0] ?? null);
      })
      .catch((err: ApiError) => {
        if (err.status === 401) router.replace('/dang-nhap');
        else if (err.status === 403) router.replace('/hoc-sinh');
        else setError(err.message);
      });
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await api.post('/session/student', { studentId: selected.id, pin });
      router.replace('/hoc-sinh');
    } catch (err) {
      setError((err as ApiError).message);
      setPin('');
      setBusy(false);
    }
  }

  if (!children) {
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
        <h1>Ai đang học hôm nay?</h1>
        <Link className={ui.button} href="/phu-huynh">
          Quay lại
        </Link>
      </header>

      {children.length === 0 ? (
        <p className={ui.muted}>
          Chưa có hồ sơ con. Phụ huynh hãy <Link href="/phu-huynh">tạo hồ sơ</Link> trước.
        </p>
      ) : (
        <div className={ui.profiles}>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              className={ui.profile}
              aria-pressed={selected?.id === child.id}
              onClick={() => {
                setSelected(child);
                setPin('');
                setError(null);
              }}
            >
              <Avatar avatarKey={child.avatarKey} large />
              <strong>{child.displayName}</strong>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <form className={`${ui.card} ${ui.form}`} onSubmit={onSubmit} noValidate>
          {error && (
            <p className={ui.error} role="alert">
              {error}
            </p>
          )}
          <label className={ui.label}>
            {selected.displayName} ơi, nhập mã PIN của con nhé
            <input
              className={`${ui.input} ${ui.pin}`}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </label>
          <div className={ui.actions}>
            <button type="submit" className={ui.primary} disabled={busy || pin.length !== 4}>
              {busy ? 'Đang vào...' : 'Vào học'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
