import type { Redis } from 'ioredis';
import { AppError } from './errors';

export interface RateLimitStore {
  /** Tăng bộ đếm của khóa trong cửa sổ hiện tại, trả số lần đã đếm. */
  hit(key: string, windowSec: number): Promise<number>;
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
