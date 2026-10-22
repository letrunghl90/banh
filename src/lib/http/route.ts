import { NextResponse } from 'next/server';
import { requireActor, type Actor, type ActorMode } from '../auth/actor';
import { toErrorBody } from '../errors';
import { logger, type Logger } from '../logger';

import { REQUEST_ID_HEADER } from './constants';

export { REQUEST_ID_HEADER };

type Params = Record<string, string | string[] | undefined>;

/** Ngữ cảnh Next.js truyền vào Route Handler (params là Promise từ Next 15). */
export interface RouteContext {
  params: Promise<Params>;
}

export interface BaseContext {
  requestId: string;
  log: Logger;
  params: Params;
}

export interface AuthedContext<M extends ActorMode> extends BaseContext {
  actor: Extract<Actor, { mode: M }>;
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

export function json<T>(data: T, init?: ResponseInit): Response {
  return NextResponse.json(data, init);
}

function requestIdOf(req: Request): string {
  const incoming = req.headers.get(REQUEST_ID_HEADER);
  return incoming && /^[A-Za-z0-9-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
}

async function run<C extends BaseContext>(
  req: Request,
  routeCtx: RouteContext | undefined,
  build: (base: BaseContext) => Promise<C>,
  handler: Handler<C>,
): Promise<Response> {
  const requestId = requestIdOf(req);
  const path = new URL(req.url).pathname;
  const log = logger.child({ requestId, method: req.method, path });
  const started = performance.now();
  let res: Response;
  try {
    const params = (await routeCtx?.params) ?? {};
    const ctx = await build({ requestId, log, params });
    res = await handler(req, ctx);
  } catch (err) {
    const { status, body } = toErrorBody(err, requestId);
    if (status >= 500) log.error('request_failed', { err });
    res = NextResponse.json(body, { status });
  }
  res.headers.set(REQUEST_ID_HEADER, requestId);
  log.info('request', { status: res.status, ms: Math.round(performance.now() - started) });
  return res;
}

/**
 * Route không cần đăng nhập. Mỗi file dùng publicRoute phải có trong danh sách cho phép của
 * test kiến trúc (tests/unit/architecture.test.ts).
 */
export function publicRoute(handler: Handler<BaseContext>) {
  return (req: Request, routeCtx?: RouteContext) =>
    run(req, routeCtx, async (base) => base, handler);
}

/** Route cần đăng nhập: gọi requireActor trước khi chạy handler. */
export function authedRoute<M extends ActorMode>(
  modes: readonly M[],
  handler: Handler<AuthedContext<M>>,
) {
  return (req: Request, routeCtx?: RouteContext) =>
    run(
      req,
      routeCtx,
      async (base) => {
        const actor = await requireActor(req, modes);
        return { ...base, actor, log: base.log.child({ userId: actor.userId, mode: actor.mode }) };
      },
      handler,
    );
}
