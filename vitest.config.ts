import path from 'node:path';
import { defineConfig } from 'vitest/config';

const alias = { '@': path.resolve(__dirname, 'src') };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
          env: { LOG_LEVEL: 'warn', AUTH_SECRET: 'test-only-not-a-real-secret-0123456789abcdef' },
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/integration/setup.ts'],
          environment: 'node',
          // Dùng chung một database test, chạy trong một tiến trình để không giẫm dữ liệu của nhau.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          env: {
            LOG_LEVEL: 'warn',
            MAIL_TRANSPORT: 'memory',
            AUTH_SECRET: 'test-only-not-a-real-secret-0123456789abcdef',
          },
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
