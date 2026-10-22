import { z } from 'zod';
import { PASSWORD_MAX, PASSWORD_MIN } from '@/lib/auth/password';
import { OTP_LENGTH } from '@/lib/auth/otp';
import { AVATAR_KEYS } from './avatars';

export const emailSchema = z
  .string({ error: 'Vui lòng nhập email' })
  .trim()
  .toLowerCase()
  .max(254, { error: 'Email quá dài' })
  .pipe(z.email({ error: 'Email không hợp lệ' }));

export const passwordSchema = z
  .string({ error: 'Vui lòng nhập mật khẩu' })
  .min(PASSWORD_MIN, { error: `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự` })
  .max(PASSWORD_MAX, { error: `Mật khẩu tối đa ${PASSWORD_MAX} ký tự` });

const otpSchema = z
  .string({ error: 'Vui lòng nhập mã xác thực' })
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), { error: `Mã xác thực gồm ${OTP_LENGTH} chữ số` });

// Số điện thoại cần SMS (T-203) nên lần này chỉ đăng ký và đăng nhập bằng email.
export const registerSchema = z.object({
  fullName: z
    .string({ error: 'Vui lòng nhập họ tên' })
    .trim()
    .min(2, { error: 'Họ tên quá ngắn' })
    .max(100, { error: 'Họ tên tối đa 100 ký tự' }),
  email: emailSchema,
  password: passwordSchema,
  acceptTermsVersion: z.string({ error: 'Bạn cần đồng ý điều khoản sử dụng' }),
  acceptPrivacyVersion: z.string({ error: 'Bạn cần đồng ý chính sách quyền riêng tư' }),
});

export const verifySchema = z.object({ email: emailSchema, code: otpSchema });

export const emailOnlySchema = z.object({ email: emailSchema });

export const loginSchema = z.object({
  email: emailSchema,
  // Đăng nhập không kiểm tra độ dài tối thiểu để không lộ quy tắc của tài khoản cũ.
  password: z.string({ error: 'Vui lòng nhập mật khẩu' }).min(1).max(PASSWORD_MAX),
  remember: z.boolean().optional().default(false),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Hồ sơ con (T-207, FR-01-05).

export const pinSchema = z
  .string({ error: 'Vui lòng nhập mã PIN' })
  .regex(/^\d{4}$/, { error: 'Mã PIN phải gồm 4 chữ số' });

const displayNameSchema = z
  .string({ error: 'Vui lòng nhập tên của con' })
  .trim()
  .min(1, { error: 'Vui lòng nhập tên của con' })
  .max(50, { error: 'Tên tối đa 50 ký tự' });

const avatarSchema = z.enum(AVATAR_KEYS, { error: 'Ảnh đại diện không hợp lệ' });

const schoolNameSchema = z
  .string()
  .trim()
  .max(120, { error: 'Tên trường tối đa 120 ký tự' })
  .transform((v) => v || null)
  .nullable();

export const createStudentSchema = z.object({
  displayName: displayNameSchema,
  avatarKey: avatarSchema,
  schoolName: schoolNameSchema.optional().default(null),
  pin: pinSchema,
});

export const updateStudentSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    avatarKey: avatarSchema.optional(),
    schoolName: schoolNameSchema.optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    error: 'Không có thông tin nào để cập nhật',
  });

export const setPinSchema = z.object({ pin: pinSchema });

export const enterStudentModeSchema = z.object({ studentId: z.uuid(), pin: pinSchema });

export const enterParentModeSchema = z.object({
  password: z.string({ error: 'Vui lòng nhập mật khẩu' }).min(1).max(PASSWORD_MAX),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const studentIdParamSchema = z.object({
  id: z.uuid({ error: 'Không tìm thấy hồ sơ của con' }),
});
