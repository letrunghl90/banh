import { describe, expect, it } from 'vitest';
import type { Actor } from '@/lib/auth/actor';
import { assertSameFamily, definePolicy } from '@/lib/policy';

const parent: Actor = { mode: 'parent', sessionId: 's', userId: 'u', familyId: 'f1' };
const student: Actor = {
  mode: 'student',
  sessionId: 's',
  userId: 'u',
  familyId: 'f1',
  studentId: 'st1',
};
const admin: Actor = { mode: 'admin', sessionId: 's', userId: 'a' };

describe('assertSameFamily', () => {
  it('cùng gia đình: cho qua', () => {
    expect(() => assertSameFamily(parent, 'f1')).not.toThrow();
  });
  it('gia đình khác hoặc thiếu: 404 để không lộ sự tồn tại', () => {
    expect(() => assertSameFamily(parent, 'f2')).toThrow(
      expect.objectContaining({ code: 'NOT_FOUND' }),
    );
    expect(() => assertSameFamily(student, null)).toThrow(
      expect.objectContaining({ code: 'NOT_FOUND' }),
    );
  });
  it('quản trị không bị giới hạn gia đình', () => {
    expect(() => assertSameFamily(admin, 'f9')).not.toThrow();
  });
});

describe('definePolicy', () => {
  const studentPolicy = definePolicy<{ familyId: string; id: string }, 'view' | 'edit'>({
    view: (a, s) =>
      (a.mode === 'parent' && a.familyId === s.familyId) ||
      (a.mode === 'student' && a.studentId === s.id),
    edit: (a, s) => a.mode === 'parent' && a.familyId === s.familyId,
  });
  const st1 = { familyId: 'f1', id: 'st1' };

  it('can trả đúng theo luật', () => {
    expect(studentPolicy.can('view', student, st1)).toBe(true);
    expect(studentPolicy.can('edit', student, st1)).toBe(false);
    expect(studentPolicy.can('edit', parent, st1)).toBe(true);
  });
  it('assert ném 403 khi không được phép', () => {
    expect(() => studentPolicy.assert('edit', student, st1)).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });
});
