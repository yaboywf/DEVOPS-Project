import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 4,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    coverage: 'on',
    screenshot: "only-on-failure",
    video: 'retain-on-failure',
    // headless: false,
  },

  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
      workers: 4
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
      workers: 1
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
      workers: 4
    },
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5'],
      workers: 4
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12'],
      workers: 4
    }
  ],

  webServer: {
    command: 'node index.js',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});

