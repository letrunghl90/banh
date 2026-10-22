import type { Actor } from './auth/actor';
import { AppError } from './errors';

/**
 * Dữ liệu thuộc gia đình khác trả 404 để không lộ sự tồn tại (docs/08, docs/09 mục 1).
 * familyId luôn lấy từ phiên (actor), không lấy từ tham số người dùng gửi lên.
 */
export function assertSameFamily(actor: Actor, resourceFamilyId: string | null | undefined): void {
  if (actor.mode === 'admin') return;
  if (!resourceFamilyId || resourceFamilyId !== actor.familyId) throw new AppError('NOT_FOUND');
}

export type Rule<R> = (actor: Actor, resource: R) => boolean;

/**
 * Khung policy cho từng module: khai báo luật theo tên hành động, dùng `can` để ẩn nút ở giao
 * diện và `assert` ở server.
 */
export function definePolicy<R, A extends string>(rules: Record<A, Rule<R>>) {
  return {
    can(action: A, actor: Actor, resource: R): boolean {
      return rules[action](actor, resource);
    },
    assert(action: A, actor: Actor, resource: R): void {
      if (!rules[action](actor, resource)) throw new AppError('FORBIDDEN');
    },
  };
}
