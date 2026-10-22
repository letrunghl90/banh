// Logger có cấu trúc (một dòng JSON mỗi bản ghi). Che dữ liệu nhạy cảm theo docs/09 mục 4.

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SECRET_KEYS = /pass(word)?|otp|token|pin|secret|code_?hash|authorization|cookie|signature/i;
const EMAIL_KEYS = /e-?mail/i;
const PHONE_KEYS = /phone|sdt/i;

export function maskEmail(value: string): string {
  const [user, domain] = value.split('@');
  if (!user || !domain) return '***';
  return `${user.slice(0, 1)}***@${domain}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length <= 3 ? '***' : `***${digits.slice(-3)}`;
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth]';
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      if (SECRET_KEYS.test(key)) out[key] = '[REDACTED]';
      else if (EMAIL_KEYS.test(key) && typeof v === 'string') out[key] = maskEmail(v);
      else if (PHONE_KEYS.test(key) && typeof v === 'string') out[key] = maskPhone(v);
      else out[key] = redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

export interface Logger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
  child(fields: Record<string, unknown>): Logger;
}

export type LogSink = (line: string) => void;

export function createLogger(
  base: Record<string, unknown> = {},
  sink: LogSink = (line) => process.stdout.write(line + '\n'),
  minLevel: Level = (process.env.LOG_LEVEL as Level | undefined) ?? 'info',
): Logger {
  const write = (level: Level, msg: string, fields?: Record<string, unknown>) => {
    if (LEVELS[level] < (LEVELS[minLevel] ?? LEVELS.info)) return;
    const record = redact({ ...base, ...fields }) as Record<string, unknown>;
    sink(JSON.stringify({ time: new Date().toISOString(), level, msg, ...record }));
  };
  return {
    debug: (m, f) => write('debug', m, f),
    info: (m, f) => write('info', m, f),
    warn: (m, f) => write('warn', m, f),
    error: (m, f) => write('error', m, f),
    child: (fields) => createLogger({ ...base, ...fields }, sink, minLevel),
  };
}

export const logger = createLogger({ service: 'web' });
