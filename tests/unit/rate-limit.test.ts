import { describe, expect, it } from 'vitest';
import { enforceRateLimit, MemoryRateLimitStore } from '@/lib/rate-limit';

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
