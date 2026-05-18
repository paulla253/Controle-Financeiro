import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const E2E_DB_PATH = path.resolve(__dirname, '../backend/data/control.e2e.sqlite');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },

  globalSetup: './scripts/reset-db.ts',

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: `npm run build && DATABASE_PATH=${E2E_DB_PATH} PORT=3000 node dist/main.js`,
      cwd: path.resolve(__dirname, '../backend'),
      port: 3000,
      reuseExistingServer: false,
      timeout: 90_000,
      stdout: 'pipe',
    },
    {
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../frontend'),
      port: 3001,
      reuseExistingServer: false,
      timeout: 90_000,
      env: {
        PORT: '3001',
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api/v1',
      },
    },
  ],
});
