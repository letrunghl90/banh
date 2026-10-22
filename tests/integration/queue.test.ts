import { QueueEvents, Worker } from 'bullmq';
import { afterAll, describe, expect, it } from 'vitest';
import { createQueue, QUEUES, redisConnection } from '@/lib/queue';
import { enforceRateLimit, RedisRateLimitStore } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';
import { getRedis } from '@/lib/redis';
import { dispatch, processors } from '../../worker/processors';

// Prefix riêng cho mỗi lần chạy để không lẫn với hàng đợi thật.
const prefix = `test-${crypto.randomUUID()}`;
const connection = redisConnection();
const log = createLogger({ service: 'test' }, () => {}, 'error');
const closers: Array<() => Promise<unknown>> = [];

afterAll(async () => {
  for (const close of closers.reverse()) await close();
  await getRedis().quit();
});

describe('hàng đợi BullMQ (AC-PLT-05)', () => {
  it('worker xử lý job thử nghiệm system.ping', async () => {
    const queue = createQueue(QUEUES.system, connection, prefix);
    const events = new QueueEvents(QUEUES.system, { connection, prefix });
    const worker = new Worker(QUEUES.system, (job) => dispatch(job, log), { connection, prefix });
    closers.push(
      () => queue.close(),
      () => events.close(),
      () => worker.close(),
    );
    await events.waitUntilReady();

    const job = await queue.add('system.ping', { hello: 'thế giới' });
    const result = await job.waitUntilFinished(events, 10_000);
    expect(result).toMatchObject({ pong: true, data: { hello: 'thế giới' } });
  });

  it('job lỗi được thử lại đúng 3 lần rồi dừng', async () => {
    let calls = 0;
    processors['test.always_fail'] = async () => {
      calls += 1;
      throw new Error('lỗi cố ý');
    };
    const name = `${QUEUES.system}`;
    const p = `${prefix}-retry`;
    const queue = createQueue(QUEUES.system, connection, p);
    const events = new QueueEvents(name, { connection, prefix: p });
    const worker = new Worker(name, (job) => dispatch(job, log), { connection, prefix: p });
    closers.push(
      () => queue.close(),
      () => events.close(),
      () => worker.close(),
    );
    await events.waitUntilReady();

    const job = await queue.add('test.always_fail', {}, { backoff: { type: 'fixed', delay: 10 } });
    await expect(job.waitUntilFinished(events, 15_000)).rejects.toThrow('lỗi cố ý');
    const final = await queue.getJob(job.id!);
    expect(final?.attemptsMade).toBe(3);
    expect(calls).toBe(3);
    delete processors['test.always_fail'];
  });

  it('job không có bộ xử lý thì lỗi rõ ràng', async () => {
    await expect(dispatch({ name: 'khong.ton.tai' } as never, log)).rejects.toThrow(
      'Không có bộ xử lý',
    );
  });
});

describe('rate limit trên Redis', () => {
  it('đếm theo cửa sổ và chặn khi vượt', async () => {
    const store = new RedisRateLimitStore(getRedis(), `${prefix}:rl:`);
    const rule = { key: 'pin:st1', limit: 5, windowSec: 60 };
    for (let i = 0; i < 5; i++) await enforceRateLimit(store, rule);
    await expect(enforceRateLimit(store, rule)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    expect(await getRedis().ttl(`${prefix}:rl:pin:st1`)).toBeGreaterThan(0);
  });
});
