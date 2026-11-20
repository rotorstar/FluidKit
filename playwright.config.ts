import { defineConfig } from '@playwright/test';

const baseURL = process.env.FLUID_STUDIO_URL ?? 'http://127.0.0.1:3011';
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: { baseURL, browserName: 'chromium', channel: process.env.FLUID_BROWSER_CHANNEL, viewport: { width:1280,height:720 }, screenshot:'only-on-failure' },
  webServer: process.env.FLUID_STUDIO_URL ? undefined : {
    command: 'npm run dev -w @fluidkit/studio -- --port 3011',
    url: baseURL, reuseExistingServer: !process.env.CI, timeout:120_000,
  },
});
