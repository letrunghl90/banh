import { Redis } from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

/** Một kết nối Redis dùng chung, tạo khi cần (tạo lại nếu kết nối cũ đã bị đóng hẳn). */
export function getRedis(): Redis {
  if (!globalForRedis.redis || globalForRedis.redis.status === 'end') {
    globalForRedis.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: false,
    });
  }
  return globalForRedis.redis;
}
