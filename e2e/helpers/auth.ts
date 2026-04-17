import { test as base, expect, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type UserFixture = {
    adminPage: Page;
    normalPage: Page;
};

const SUPABASE_URL = process.env.E2E_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY!;

async function injectSession(page: Page, email: string, password: string) {
    const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Login failed for ${email}: ${error.message}`);

    const session = data.session!;
    const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

    await page.goto('/');
    await page.evaluate(
        ({ key, sessionData }) => {
            localStorage.setItem(key, JSON.stringify(sessionData));
        },
        { key: storageKey, sessionData: { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at, token_type: 'bearer', user: session.user } }
    );
    await page.reload();
    await page.waitForLoadState('networkidle');
}

export const test = base.extend<UserFixture>({
    adminPage: async ({ page }, use) => {
        await injectSession(page, process.env.E2E_ADMIN_EMAIL!, process.env.E2E_ADMIN_PASSWORD!);
        await use(page);
    },
    normalPage: async ({ page }, use) => {
        await injectSession(page, process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
        await use(page);
    },
});

export { expect, injectSession };
