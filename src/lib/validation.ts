import { z } from 'zod';
import { AppError } from './errors';

/** Kiểm tra dữ liệu bằng zod; sai thì ném VALIDATION_ERROR kèm danh sách trường lỗi. */
export function parseWith<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const details = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || '_',
    issue: issue.code,
  }));
  const message = result.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ';
  throw new AppError('VALIDATION_ERROR', message, details);
}

export async function parseJsonBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AppError('VALIDATION_ERROR', 'Nội dung gửi lên không phải JSON hợp lệ', [
      { field: '_', issue: 'invalid_json' },
    ]);
  }
  return parseWith(schema, raw);
}

export function parseQuery<T extends z.ZodType>(req: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return parseWith(schema, params);
}
