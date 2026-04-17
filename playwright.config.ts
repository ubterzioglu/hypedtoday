import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    fullyParallel: true,
    retries: 1,
    reporter: 'html',
    use: {
        baseURL: process.env.E2E_BASE_URL || 'https://hyped.today',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
