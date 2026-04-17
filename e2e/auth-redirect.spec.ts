import { test, expect } from '../helpers/auth';

test.describe('Auth redirect flow', () => {
    test('anonymous user visiting /add-project is redirected to login', async ({ page }) => {
        await page.goto('/add-project');
        await page.waitForURL('**/admin/login**', { timeout: 10000 });
        expect(page.url()).toContain('/admin/login');
        expect(page.url()).toContain('next=');
    });

    test('login page preserves next parameter', async ({ page }) => {
        await page.goto('/add-project');
        await page.waitForURL('**/admin/login**', { timeout: 10000 });
        const url = new URL(page.url());
        const next = url.searchParams.get('next');
        expect(next).toContain('/add-project');
    });

    test('authenticated user can access /add-project after redirect', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');
        expect(normalPage.url()).toContain('/add-project');
    });

    test('auth callback with next param redirects correctly', async ({ normalPage }) => {
        await normalPage.goto('/auth/callback?next=/showroom');
        await normalPage.waitForTimeout(2000);
        expect(normalPage.url()).toMatch(/\/(showroom|$)/);
    });
});
