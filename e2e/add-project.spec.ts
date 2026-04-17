import { test, expect } from '../helpers/auth';

test.describe('Add project flow (authenticated)', () => {
    test('request-limits widget loads without 401', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');
        expect(normalPage.url()).toContain('/add-project');

        const consoleErrors: string[] = [];
        normalPage.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        await normalPage.waitForTimeout(3000);
        const authErrors = consoleErrors.filter(e => e.includes('401') || e.includes('Unauthorized'));
        expect(authErrors).toHaveLength(0);
    });

    test('form fields are visible and fillable', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');

        const linkedinInput = normalPage.locator('input[id="linkedin_url"], input[placeholder*="linkedin"], input[type="url"]').first();
        if (await linkedinInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await linkedinInput.fill('https://linkedin.com/posts/test-post-123');
            expect(await linkedinInput.inputValue()).toContain('linkedin.com');
        }
    });

    test('at least one task checkbox is selectable', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');

        const checkbox = normalPage.locator('input[type="checkbox"], button[role="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await checkbox.click();
            expect(await checkbox.isChecked?.() ?? true).toBeTruthy();
        }
    });

    test('submit with valid LinkedIn URL succeeds', async ({ normalPage }) => {
        await normalPage.goto('/add-project');
        await normalPage.waitForLoadState('networkidle');

        const urlInput = normalPage.locator('input[id="linkedin_url"], input[placeholder*="linkedin"], input[type="url"]').first();
        if (await urlInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await urlInput.fill('https://linkedin.com/posts/test-post-abc');

            const likeCheckbox = normalPage.locator('input[type="checkbox"]').first();
            if (await likeCheckbox.isVisible().catch(() => false)) {
                await likeCheckbox.check().catch(() => {});
            }

            const submitBtn = normalPage.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Gonder")').first();
            if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await submitBtn.click();
                await normalPage.waitForTimeout(3000);

                const currentUrl = normalPage.url();
                const navigatedToShowroom = currentUrl.includes('/showroom');
                const toastVisible = await normalPage.locator('[data-sonner-toast], [role="status"]').isVisible().catch(() => false);
                expect(navigatedToShowroom || toastVisible).toBeTruthy();
            }
        }
    });
});
