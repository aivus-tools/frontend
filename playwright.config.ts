import { defineConfig, devices } from '@playwright/test';

const isExternalTarget = !!process.env.SMOKE_TEST_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: process.env.SMOKE_TEST_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /(^|\/)auth\.setup\.ts$/,
    },
    {
      name: 'smoke',
      testMatch: /(^|\/)smoke\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'chromium',
      testIgnore: [/smoke\.spec\.ts/, /brief-flows\//],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'client-no-auth',
      testMatch: /public-brief\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'client-setup',
      testMatch: /client-auth\.setup\.ts/,
    },
    {
      // Live LLM brief flows (public-brief, registration, logged-in, Wix webhook).
      // Long-running and opt-in via `npm run test:e2e:flows`; excluded from the
      // default suite. Fake media devices let the voice recorder run headless.
      name: 'brief-flows',
      testMatch: /brief-flows\/.*\.spec\.ts/,
      timeout: 720_000,
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
        permissions: ['microphone'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
      },
      dependencies: ['client-setup'],
    },
  ],
  webServer: isExternalTarget
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
