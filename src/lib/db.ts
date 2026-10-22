import { PrismaClient } from '@prisma/client';

// Một Prisma client dùng chung cho cả tiến trình (docs/06 mục 4).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
