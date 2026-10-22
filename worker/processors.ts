import type { Job } from 'bullmq';
import type { Logger } from '../src/lib/logger';

export type Processor = (job: Job, log: Logger) => Promise<unknown>;

/**
 * Bảng xử lý theo tên job. Module sau thêm job của mình ở đây
 * (ví dụ progress.recalc, notify.attempt_submitted).
 */
export const processors: Record<string, Processor> = {
  /** Job kiểm tra worker còn chạy. */
  'system.ping': async (job) => ({ pong: true, at: new Date().toISOString(), data: job.data }),
};

export async function dispatch(job: Job, log: Logger): Promise<unknown> {
  const processor = processors[job.name];
  if (!processor) throw new Error(`Không có bộ xử lý cho job "${job.name}"`);
  return processor(job, log);
}
