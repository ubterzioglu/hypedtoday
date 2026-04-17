import { test, expect } from '../helpers/auth';

test.describe('Permission boundaries', () => {
    test('unauthenticated user cannot access /admin', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/admin/login');
    });

    test('unauthenticated user cannot access /add-project', async ({ page }) => {
        await page.goto('/add-project');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/admin/login');
    });

    test('unauthenticated user cannot access /my-reviews', async ({ page }) => {
        await page.goto('/my-reviews');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/admin/login');
    });

    test('unauthenticated user cannot access /my-claims', async ({ page }) => {
        await page.goto('/my-claims');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/admin/login');
    });

    test('normal user cannot access /admin', async ({ normalPage }) => {
        await normalPage.goto('/admin');
        await normalPage.waitForLoadState('networkidle');
        expect(normalPage.url()).not.toContain('/admin');
    });

    test('admin user can access /add-project', async ({ adminPage }) => {
        await adminPage.goto('/add-project');
        await adminPage.waitForLoadState('networkidle');
        expect(adminPage.url()).toContain('/add-project');
    });

    test('logout redirects protected route to login', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');
        expect(normalPage.url()).toContain('/add-project');

        const logoutBtn = normalPage.locator('button:has-text("Logout"), button:has-text("Cikis"), [data-testid="logout"]').first();
        if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await logoutBtn.click();
            await normalPage.waitForLoadState('networkidle');

            await normalPage.goto('/add-project');
            await normalPage.waitForLoadState('networkidle');
            expect(normalPage.url()).toContain('/admin/login');
        }
    });
});
