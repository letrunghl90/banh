import { Queue, type ConnectionOptions, type JobsOptions } from 'bullmq';

// Tên hàng đợi dùng chung giữa web và worker (docs/06 ADR-03).
export const QUEUES = {
  system: 'system',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Job lỗi được thử lại tối đa 3 lần, giãn cách tăng dần (AC-PLT-05). */
export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1_000 },
  removeOnComplete: { age: 24 * 60 * 60, count: 1_000 },
  removeOnFail: { age: 7 * 24 * 60 * 60 },
};

export function redisConnection(url = process.env.REDIS_URL ?? 'redis://localhost:6379') {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username || undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    db: u.pathname.length > 1 ? Number(u.pathname.slice(1)) : 0,
    tls: u.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  } satisfies ConnectionOptions;
}

export function createQueue(name: QueueName, connection = redisConnection(), prefix?: string) {
  return new Queue(name, { connection, prefix, defaultJobOptions: DEFAULT_JOB_OPTIONS });
}
