import styles from './ui.module.css';

// Ảnh đại diện tạm: biểu tượng và màu nền theo khóa ảnh, chờ bộ ảnh của thiết kế (R-08).
const AVATARS: Record<string, { icon: string; className: string | undefined }> = {
  'girl-01': { icon: '👧', className: styles.girl01 },
  'girl-02': { icon: '👧', className: styles.girl02 },
  'girl-03': { icon: '👧', className: styles.girl03 },
  'boy-01': { icon: '👦', className: styles.boy01 },
  'boy-02': { icon: '👦', className: styles.boy02 },
  'boy-03': { icon: '👦', className: styles.boy03 },
};

export function Avatar({ avatarKey, large }: { avatarKey: string | null; large?: boolean }) {
  const a = AVATARS[avatarKey ?? ''] ?? { icon: '🙂', className: styles.boy01 };
  return (
    <span
      className={[styles.avatar, a.className, large ? styles.avatarLarge : ''].join(' ')}
      aria-hidden="true"
    >
      {a.icon}
    </span>
  );
}
