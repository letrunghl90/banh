import { Worker } from 'bullmq';
import { QUEUES, redisConnection } from '../src/lib/queue';
import { createLogger } from '../src/lib/logger';
import { dispatch } from './processors';

const log = createLogger({ service: 'worker' });
const connection = redisConnection();

const workers = Object.values(QUEUES).map((queue) => {
  const worker = new Worker(
    queue,
    (job) => dispatch(job, log.child({ queue, jobId: job.id, job: job.name })),
    {
      connection,
      concurrency: 5,
    },
  );
  worker.on('completed', (job) =>
    log.info('job_completed', { queue, jobId: job.id, job: job.name }),
  );
  worker.on('failed', (job, err) =>
    log.warn('job_failed', {
      queue,
      jobId: job?.id,
      job: job?.name,
      attempt: job?.attemptsMade,
      err,
    }),
  );
  return worker;
});

log.info('worker_started', { queues: Object.values(QUEUES) });

async function shutdown(signal: string) {
  log.info('worker_stopping', { signal });
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
