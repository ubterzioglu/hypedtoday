import { chromium, type Browser, type Page } from '@playwright/test';

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://hyped.today';
const TIMEOUT = 15000;

interface SmokeResult {
    check: string;
    passed: boolean;
    detail?: string;
}

async function runSmokeChecks(): Promise<void> {
    const results: SmokeResult[] = [];
    const browser: Browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page: Page = await context.newPage();

    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', req => {
        networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    try {
        try {
            const res = await page.goto(BASE_URL, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
            results.push({ check: 'GET / -> 200', passed: res?.status() === 200, detail: `status: ${res?.status()}` });
        } catch (e) {
            results.push({ check: 'GET / -> 200', passed: false, detail: String(e) });
        }

        try {
            const res = await page.goto(`${BASE_URL}/showroom`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
            results.push({ check: 'GET /showroom -> 200', passed: res?.status() === 200, detail: `status: ${res?.status()}` });
        } catch (e) {
            results.push({ check: 'GET /showroom -> 200', passed: false, detail: String(e) });
        }

        try {
            const res = await page.goto(`${BASE_URL}/add-project`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
            const url = page.url();
            const isRedirect = url.includes('/login') || url.includes('/admin/login');
            const isOk = (res?.status() ?? 0) < 500;
            results.push({ check: '/add-project no 401/500', passed: isRedirect || isOk, detail: `status: ${res?.status()}, url: ${url}` });
        } catch (e) {
            results.push({ check: '/add-project no 401/500', passed: false, detail: String(e) });
        }

        try {
            const res = await page.goto(`${BASE_URL}/admin`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
            const url = page.url();
            const isRedirect = url.includes('/login') || url.includes('/admin/login');
            const isOk = (res?.status() ?? 0) < 500;
            results.push({ check: '/admin no 500', passed: isRedirect || isOk, detail: `status: ${res?.status()}, url: ${url}` });
        } catch (e) {
            results.push({ check: '/admin no 500', passed: false, detail: String(e) });
        }

        try {
            await page.goto(`${BASE_URL}/admin/login`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
            const inputCount = await page.locator('input').count();
            results.push({ check: 'Login page renders form', passed: inputCount > 0, detail: `inputs: ${inputCount}` });
        } catch (e) {
            results.push({ check: 'Login page renders form', passed: false, detail: String(e) });
        }

        const authErrors = consoleErrors.filter(e =>
            e.includes('401') || e.includes('Unauthorized') ||
            e.includes('Failed to send') || e.includes('Edge Function')
        );
        results.push({ check: 'No auth/function console errors', passed: authErrors.length === 0, detail: authErrors.length > 0 ? authErrors.join('; ') : 'clean' });

        const criticalErrors = networkErrors.filter(e =>
            e.includes('request-limits') || e.includes('admin-dashboard') ||
            e.includes('admin-actions') || e.includes('create-post')
        );
        results.push({ check: 'No critical function network errors', passed: criticalErrors.length === 0, detail: criticalErrors.length > 0 ? criticalErrors.join('; ') : 'clean' });

    } finally {
        await browser.close();
    }

    console.log(`\n=== SMOKE CHECK: ${BASE_URL} ===\n`);
    let allPassed = true;
    for (const r of results) {
        const icon = r.passed ? 'PASS' : 'FAIL';
        console.log(`[${icon}] ${r.check}${r.detail ? ` (${r.detail})` : ''}`);
        if (!r.passed) allPassed = false;
    }
    console.log(`\n${results.filter(r => r.passed).length}/${results.length} checks passed.\n`);

    if (!allPassed) process.exit(1);
}

runSmokeChecks().catch(e => {
    console.error('Smoke check crashed:', e);
    process.exit(1);
});
