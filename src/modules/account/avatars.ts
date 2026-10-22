// Bộ ảnh đại diện có sẵn cho hồ sơ con (FR-01-05). Tách riêng để giao diện dùng được.
export const AVATAR_KEYS = ['girl-01', 'girl-02', 'girl-03', 'boy-01', 'boy-02', 'boy-03'] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];
