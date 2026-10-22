// Test kiến trúc (AC-PLT-04): mọi Route Handler phải đi qua authedRoute (gọi requireActor)
// hoặc publicRoute có trong danh sách cho phép.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const API_DIR = path.resolve('src/app/api');
const MODULES_DIR = path.resolve('src/modules');

/** Route công khai được duyệt. Thêm route mới vào đây phải có lý do trong review. */
const PUBLIC_ROUTES = new Set(['v1/health/route.ts']);

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function walk(dir: string): string[] {
  let out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

/** Kiểm tra một file route; trả danh sách vi phạm. Tách ra để test được chính luật này. */
export function checkRouteSource(rel: string, src: string): string[] {
  const problems: string[] = [];
  for (const m of METHODS) {
    if (new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(src)) {
      problems.push(`${rel}: ${m} khai báo bằng function, phải dùng authedRoute/publicRoute`);
    }
    const match = src.match(new RegExp(`export\\s+const\\s+${m}\\s*=\\s*(\\w+)\\(`));
    if (!match) continue;
    const wrapper = match[1];
    if (wrapper === 'publicRoute' && !PUBLIC_ROUTES.has(rel)) {
      problems.push(`${rel}: ${m} dùng publicRoute nhưng chưa có trong danh sách route công khai`);
    } else if (wrapper !== 'publicRoute' && wrapper !== 'authedRoute') {
      problems.push(`${rel}: ${m} phải bọc bằng authedRoute hoặc publicRoute, đang là ${wrapper}`);
    }
  }
  if (/export\s*\{[^}]*\b(GET|POST|PUT|PATCH|DELETE)\b/.test(src)) {
    problems.push(
      `${rel}: không export lại handler, khai báo trực tiếp bằng authedRoute/publicRoute`,
    );
  }
  return problems;
}

describe('kiến trúc', () => {
  it('mọi Route Handler đều kiểm tra đăng nhập hoặc được duyệt là công khai', () => {
    const files = walk(API_DIR).filter((f) => /route\.tsx?$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    const problems = files.flatMap((f) =>
      checkRouteSource(
        path.relative(API_DIR, f).split(path.sep).join('/'),
        readFileSync(f, 'utf8'),
      ),
    );
    expect(problems).toEqual([]);
  });

  it('luật bắt được handler thiếu requireActor', () => {
    expect(checkRouteSource('v1/x/route.ts', 'export async function GET() {}')).toHaveLength(1);
    expect(
      checkRouteSource('v1/x/route.ts', 'export const POST = publicRoute(async () => r)'),
    ).toHaveLength(1);
    expect(
      checkRouteSource('v1/x/route.ts', 'export const POST = wrap(async () => r)'),
    ).toHaveLength(1);
    expect(checkRouteSource('v1/x/route.ts', 'const GET = 1; export { GET }')).toHaveLength(1);
    expect(
      checkRouteSource('v1/x/route.ts', "export const GET = authedRoute(['parent'], h)"),
    ).toEqual([]);
  });

  it('module nghiệp vụ không phụ thuộc giao diện (src/app)', () => {
    const offenders = walk(MODULES_DIR)
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => /from\s+['"](@\/app|\.\.\/\.\.\/app)/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
