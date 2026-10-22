'use client';

import { useState, type FormEvent } from 'react';
import { Avatar } from '@/components/avatar';
import ui from '@/components/ui.module.css';
import { api, ApiError } from '@/lib/client/api';
import { AVATAR_KEYS, type AvatarKey } from '@/modules/account/avatars';

export interface Child {
  id: string;
  displayName: string;
  avatarKey: string | null;
  schoolName: string | null;
  grade: { id: string; name: string } | null;
}

type Editing = { kind: 'new' } | { kind: 'edit'; child: Child } | { kind: 'pin'; child: Child };

/** Quản lý hồ sơ con: thêm, sửa, đặt lại PIN, xóa (T-207, FR-01-05). */
export function Children({ items, onChanged }: { items: Child[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<Editing | null>(
    items.length === 0 ? { kind: 'new' } : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function done(message: string) {
    setEditing(null);
    setError(null);
    setNotice(message);
    await onChanged();
  }

  async function remove(child: Child) {
    const ok = window.confirm(
      `Xóa hồ sơ của ${child.displayName}? Hồ sơ biến mất ngay; dữ liệu học tập bị xóa hẳn sau 30 ngày.`,
    );
    if (!ok) return;
    try {
      await api.delete(`/students/${child.id}`);
      await done(`Đã xóa hồ sơ của ${child.displayName}.`);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  return (
    <section className={ui.card} aria-labelledby="children-title">
      <div className={ui.header}>
        <h2 id="children-title">Hồ sơ của con</h2>
        {!editing && (
          <button
            type="button"
            className={ui.button}
            onClick={() => {
              setNotice(null);
              setEditing({ kind: 'new' });
            }}
          >
            Thêm con
          </button>
        )}
      </div>

      {notice && <p className={ui.notice}>{notice}</p>}
      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}

      {items.length === 0 && !editing && <p className={ui.muted}>Chưa có hồ sơ nào.</p>}

      {items.length > 0 && (
        <ul className={ui.list}>
          {items.map((child) => (
            <li key={child.id} className={ui.item}>
              <Avatar avatarKey={child.avatarKey} />
              <div className={ui.itemMain}>
                <strong>{child.displayName}</strong>
                <span className={ui.muted}>
                  {[child.grade?.name, child.schoolName].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className={ui.actions}>
                <button
                  type="button"
                  className={ui.button}
                  onClick={() => setEditing({ kind: 'edit', child })}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className={ui.button}
                  onClick={() => setEditing({ kind: 'pin', child })}
                >
                  Đổi PIN
                </button>
                <button type="button" className={ui.danger} onClick={() => remove(child)}>
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing?.kind === 'new' && (
        <ChildForm
          onCancel={items.length > 0 ? () => setEditing(null) : undefined}
          onSaved={(name) => done(`Đã thêm hồ sơ của ${name}.`)}
        />
      )}
      {editing?.kind === 'edit' && (
        <ChildForm
          child={editing.child}
          onCancel={() => setEditing(null)}
          onSaved={(name) => done(`Đã lưu hồ sơ của ${name}.`)}
        />
      )}
      {editing?.kind === 'pin' && (
        <PinForm
          child={editing.child}
          onCancel={() => setEditing(null)}
          onSaved={() => done(`Đã đổi PIN của ${editing.child.displayName}.`)}
        />
      )}
    </section>
  );
}

function ChildForm({
  child,
  onCancel,
  onSaved,
}: {
  child?: Child;
  onCancel?: () => void;
  onSaved: (name: string) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(child?.displayName ?? '');
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(
    (AVATAR_KEYS as readonly string[]).includes(child?.avatarKey ?? '')
      ? (child!.avatarKey as AvatarKey)
      : 'girl-01',
  );
  const [schoolName, setSchoolName] = useState(child?.schoolName ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const saved = child
        ? await api.patch<Child>(`/students/${child.id}`, { displayName, avatarKey, schoolName })
        : await api.post<Child>('/students', { displayName, avatarKey, schoolName, pin });
      await onSaved(saved.displayName);
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <form className={ui.form} onSubmit={onSubmit} noValidate>
      <h3>{child ? `Sửa hồ sơ của ${child.displayName}` : 'Thêm hồ sơ con'}</h3>
      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}
      <label className={ui.label}>
        Tên của con
        <input
          className={ui.input}
          value={displayName}
          maxLength={50}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ví dụ: Minh Anh"
          required
        />
      </label>
      <fieldset className={ui.avatars}>
        <legend className={ui.label}>Ảnh đại diện</legend>
        {AVATAR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={ui.avatarOption}
            aria-pressed={avatarKey === key}
            aria-label={`Ảnh ${key}`}
            onClick={() => setAvatarKey(key)}
          >
            <Avatar avatarKey={key} />
          </button>
        ))}
      </fieldset>
      <label className={ui.label}>
        Trường (không bắt buộc)
        <input
          className={ui.input}
          value={schoolName}
          maxLength={120}
          onChange={(e) => setSchoolName(e.target.value)}
        />
      </label>
      {!child && (
        <label className={ui.label}>
          Mã PIN 4 số để con vào học
          <input
            className={`${ui.input} ${ui.pin}`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
          />
        </label>
      )}
      <div className={ui.actions}>
        <button type="submit" className={ui.primary} disabled={busy}>
          {busy ? 'Đang lưu...' : 'Lưu'}
        </button>
        {onCancel && (
          <button type="button" className={ui.button} onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

function PinForm({
  child,
  onCancel,
  onSaved,
}: {
  child: Child;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/students/${child.id}/pin`, { pin });
      await onSaved();
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <form className={ui.form} onSubmit={onSubmit} noValidate>
      <h3>Đổi PIN của {child.displayName}</h3>
      <p className={ui.muted}>Đổi PIN cũng mở khóa nếu con đã nhập sai quá nhiều lần.</p>
      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}
      <label className={ui.label}>
        Mã PIN mới (4 số)
        <input
          className={`${ui.input} ${ui.pin}`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          required
        />
      </label>
      <div className={ui.actions}>
        <button type="submit" className={ui.primary} disabled={busy}>
          {busy ? 'Đang lưu...' : 'Lưu PIN'}
        </button>
        <button type="button" className={ui.button} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}
