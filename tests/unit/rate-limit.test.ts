import { afterEach, describe, expect, it, vi } from 'vitest';
import { enforceRateLimit, getRateLimitStore, MemoryRateLimitStore } from '@/lib/rate-limit';

describe('rate limit', () => {
  it('cho phép đến giới hạn, vượt thì 429, hết cửa sổ thì mở lại', async () => {
    let now = 0;
    const store = new MemoryRateLimitStore(() => now);
    const rule = { key: 'login:1.2.3.4', limit: 3, windowSec: 60 };
    for (let i = 0; i < 3; i++) await enforceRateLimit(store, rule);
    await expect(enforceRateLimit(store, rule)).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
    });
    now = 61_000;
    await expect(enforceRateLimit(store, rule)).resolves.toBeUndefined();
  });

  it('các khóa khác nhau đếm riêng', async () => {
    const store = new MemoryRateLimitStore();
    await enforceRateLimit(store, { key: 'a', limit: 1, windowSec: 60 });
    await expect(
      enforceRateLimit(store, { key: 'b', limit: 1, windowSec: 60 }),
    ).resolves.toBeUndefined();
  });
});

describe('chọn kho đếm', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as { memoryRateLimitStore?: unknown }).memoryRateLimitStore;
  });

  it('REDIS_URL="memory" hoặc trống trên máy phát triển: kho trong bộ nhớ, dùng chung', async () => {
    for (const url of ['memory', '']) {
      vi.stubEnv('REDIS_URL', url);
      const a = getRateLimitStore();
      expect(a).toBeInstanceOf(MemoryRateLimitStore);
      await a.hit('k', 60);
      expect(await getRateLimitStore().peek('k')).toBe(1);
      delete (globalThis as { memoryRateLimitStore?: unknown }).memoryRateLimitStore;
    }
  });

  it('production không cho đếm trong bộ nhớ', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('REDIS_URL', 'memory');
    expect(() => getRateLimitStore()).toThrow(/Redis/);
  });
});
