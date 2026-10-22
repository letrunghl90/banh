import type { Redis } from 'ioredis';
import { AppError } from './errors';
import { getRedis } from './redis';

export interface RateLimitStore {
  /** Tăng bộ đếm của khóa trong cửa sổ hiện tại, trả số lần đã đếm. */
  hit(key: string, windowSec: number): Promise<number>;
  /** Đọc bộ đếm hiện tại mà không tăng (0 nếu chưa có hoặc đã hết cửa sổ). */
  peek(key: string): Promise<number>;
  /** Xóa bộ đếm, ví dụ sau khi đăng nhập đúng. */
  reset(key: string): Promise<void>;
}

export class RedisRateLimitStore implements RateLimitStore {
  constructor(
    private readonly redis: Redis,
    private readonly prefix = 'rl:',
  ) {}

  async hit(key: string, windowSec: number): Promise<number> {
    const k = this.prefix + key;
    const res = await this.redis.multi().incr(k).expire(k, windowSec, 'NX').exec();
    const count = res?.[0]?.[1];
    return typeof count === 'number' ? count : Number(count);
  }

  async peek(key: string): Promise<number> {
    return Number((await this.redis.get(this.prefix + key)) ?? 0);
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(this.prefix + key);
  }
}

/** Dùng cho test và máy phát triển không có Redis. */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  async hit(key: string, windowSec: number): Promise<number> {
    const t = this.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= t) {
      this.buckets.set(key, { count: 1, resetAt: t + windowSec * 1000 });
      return 1;
    }
    bucket.count += 1;
    return bucket.count;
  }

  async peek(key: string): Promise<number> {
    const bucket = this.buckets.get(key);
    return bucket && bucket.resetAt > this.now() ? bucket.count : 0;
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }
}

const globalForStore = globalThis as unknown as { memoryRateLimitStore?: MemoryRateLimitStore };

/**
 * Kho đếm của ứng dụng, dùng kết nối Redis chung.
 * Máy phát triển không có Redis: đặt `REDIS_URL="memory"` (hoặc để trống) thì đếm trong bộ nhớ
 * của tiến trình. Production bắt buộc Redis vì nhiều tiến trình phải dùng chung bộ đếm.
 */
export function getRateLimitStore(): RateLimitStore {
  const url = process.env.REDIS_URL;
  if (url === '' || url === 'memory') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production cần REDIS_URL trỏ tới Redis thật cho giới hạn tần suất');
    }
    globalForStore.memoryRateLimitStore ??= new MemoryRateLimitStore();
    return globalForStore.memoryRateLimitStore;
  }
  return new RedisRateLimitStore(getRedis());
}

export interface RateLimitRule {
  key: string;
  limit: number;
  windowSec: number;
  message?: string;
}

/** Ném RATE_LIMITED (429) khi vượt giới hạn (docs/08 mục 3). */
export async function enforceRateLimit(store: RateLimitStore, rule: RateLimitRule): Promise<void> {
  const count = await store.hit(rule.key, rule.windowSec);
  if (count > rule.limit) throw new AppError('RATE_LIMITED', rule.message);
}
