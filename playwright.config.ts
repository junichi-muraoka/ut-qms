import { defineConfig, devices } from '@playwright/test';

/**
 * Qraft E2E テスト設定
 *
 * BASE_URL 環境変数で対象を切り替え可能:
 *   - ローカル: http://localhost:5173 (default)
 *   - Staging: https://qraft-staging.pages.dev
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* ローカルテスト時にクライアント開発サーバーを自動起動 */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev --prefix client',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
