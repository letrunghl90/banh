-- T-202: tài khoản vừa đăng ký, chưa xác thực thì chưa đăng nhập được.
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'pending' BEFORE 'active';
