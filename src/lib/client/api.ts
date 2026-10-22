'use client';

// Gọi API từ trình duyệt: tự gắn header CSRF (docs/08) và đọc lỗi theo định dạng thống nhất.

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: { field: string; issue: string }[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.message);
  }

  /** Thông báo lỗi của một trường (để hiện ngay dưới ô nhập). */
  field(name: string): boolean {
    return this.body.details?.some((d) => d.field === name) ?? false;
  }
}

function csrfToken(): string {
  const m = /(?:^|;\s*)ccl_csrf=([^;]+)/.exec(document.cookie);
  return m ? decodeURIComponent(m[1] ?? '') : '';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(method !== 'GET' ? { 'x-csrf-token': csrfToken() } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, {
      code: 'NETWORK',
      message: 'Không kết nối được máy chủ. Hãy kiểm tra mạng và thử lại.',
    });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error ?? { code: 'INTERNAL_ERROR', message: 'Đã có lỗi, vui lòng thử lại.' },
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => request<T>('POST', path, body),
};
