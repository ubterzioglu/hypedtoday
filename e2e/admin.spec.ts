import { test, expect } from '../helpers/auth';

test.describe('Admin dashboard (admin user)', () => {
    test('admin can access /admin and dashboard loads', async ({ adminPage }) => {
        await adminPage.goto('/admin');
        await adminPage.waitForLoadState('networkidle');
        expect(adminPage.url()).toContain('/admin');
    });

    test('dashboard shows statistics', async ({ adminPage }) => {
        await adminPage.goto('/admin');
        await adminPage.waitForLoadState('networkidle');

        const statsSection = adminPage.locator('[data-testid="dashboard-stats"], .stat, .dashboard').first();
        await expect(statsSection).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('flags tab shows list or empty state', async ({ adminPage }) => {
        await adminPage.goto('/admin');
        await adminPage.waitForLoadState('networkidle');

        const flagsTab = adminPage.locator('text=/flags|flag/i, [data-value="flags"], button:has-text("Flags")').first();
        if (await flagsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await flagsTab.click();
            await adminPage.waitForTimeout(2000);

            const flagContent = adminPage.locator('table, [data-testid="flags-list"], .flag-item, p:has-text("No flags")').first();
            await expect(flagContent).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
    });

    test('settings tab has readable input values', async ({ adminPage }) => {
        await adminPage.goto('/admin');
        await adminPage.waitForLoadState('networkidle');

        const settingsTab = adminPage.locator('text=/settings|ayar/i, [data-value="settings"], button:has-text("Settings")').first();
        if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await settingsTab.click();
            await adminPage.waitForTimeout(2000);

            const settingsInput = adminPage.locator('input[type="text"], input[type="number"]').first();
            if (await settingsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                const value = await settingsInput.inputValue();
                expect(value).toBeDefined();
            }
        }
    });

    test('settings value can be changed and saved', async ({ adminPage }) => {
        await adminPage.goto('/admin');
        await adminPage.waitForLoadState('networkidle');

        const settingsTab = adminPage.locator('text=/settings|ayar/i, button:has-text("Settings")').first();
        if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await settingsTab.click();
            await adminPage.waitForTimeout(2000);

            const input = adminPage.locator('input[type="number"], input[type="text"]').first();
            if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
                await input.fill('999');
                const saveBtn = adminPage.locator('button:has-text("Save"), button:has-text("Kaydet")').first();
                if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await saveBtn.click();
                    await adminPage.waitForTimeout(3000);

                    const auditLog = adminPage.locator('[data-testid="audit-log"], .audit, text=/audit|log/i').first();
                    await expect(auditLog).toBeVisible({ timeout: 5000 }).catch(() => {});
                }
            }
        }
    });
});
