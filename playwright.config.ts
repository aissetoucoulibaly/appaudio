import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    ...devices['iPhone 13'],
    defaultBrowserType: 'chromium',
    baseURL: 'http://127.0.0.1:8081',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
