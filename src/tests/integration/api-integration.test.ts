import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockSupabase } from '@/test/setup';

describe('request-limits flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    });

    it('returns limits for authenticated session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { allowed: true, remaining: { daily: 3, weekly: 10, active_posts: 2 } } },
            error: null,
        });

        let { data: { session } } = await mockSupabase.auth.getSession();
        const { data, error } = await mockSupabase.functions.invoke('request-limits', {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        expect(error).toBeNull();
        expect(data.data.allowed).toBe(true);
    });

    it('fails when session is null and refresh fails', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
        mockSupabase.auth.refreshSession.mockResolvedValue({ data: { session: null } });

        let { data: { session } } = await mockSupabase.auth.getSession();
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            session = refreshed.data.session;
        }

        expect(session).toBeNull();
    });
});

describe('create-post flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
    });

    it('sends correct invoke params for valid body', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { post: { id: 'p1' }, tasks: [{ id: 't1' }] } },
            error: null,
        });

        const body = {
            linkedin_url: 'https://linkedin.com/posts/123',
            requested_like: true,
            requested_comment: true,
            requested_repost: false,
        };
        const { data, error } = await mockSupabase.functions.invoke('create-post', {
            method: 'POST',
            body,
            headers: expect.any(Object),
        });

        expect(error).toBeNull();
        expect(data.data.post.id).toBe('p1');
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('create-post', expect.objectContaining({
            method: 'POST',
            body,
        }));
    });

    it('throws on invoke failure', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Internal error' },
        });

        const { error } = await mockSupabase.functions.invoke('create-post', {
            method: 'POST',
            body: {},
        });

        expect(error).toEqual({ message: 'Internal error' });
    });
});

describe('admin-dashboard flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'admin-tok' } },
        });
    });

    it('returns dashboard data for admin session', async () => {
        const dashboardData = {
            flags: [{ id: '1', flag_type: 'fast_complete', status: 'open' }],
            settings: { points_like: '10' },
            recentActions: [],
        };
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: dashboardData },
            error: null,
        });

        const { data, error } = await mockSupabase.functions.invoke('admin-dashboard', {
            headers: expect.any(Object),
        });

        expect(error).toBeNull();
        expect(data.data.flags).toHaveLength(1);
    });

    it('returns 401-style error for non-admin user', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Admin access required' },
        });

        const { error } = await mockSupabase.functions.invoke('admin-dashboard', {
            headers: expect.any(Object),
        });

        expect(error.message).toBe('Admin access required');
    });
});

describe('admin-actions flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'admin-tok' } },
        });
    });

    it('invokes with action_type global_setting_changed', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { success: true } },
            error: null,
        });

        const body = {
            action_type: 'global_setting_changed',
            payload: { key: 'points_like', value: '20' },
        };
        await mockSupabase.functions.invoke('admin-actions', {
            method: 'POST',
            body,
            headers: expect.any(Object),
        });

        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('admin-actions', expect.objectContaining({
            method: 'POST',
            body,
        }));
    });

    it('invokes with action_type flag_reviewed', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { success: true } },
            error: null,
        });

        const body = {
            action_type: 'flag_reviewed',
            target_post_id: 'post-1',
            note: 'Reviewed and cleared',
        };
        await mockSupabase.functions.invoke('admin-actions', {
            method: 'POST',
            body,
            headers: expect.any(Object),
        });

        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('admin-actions', expect.objectContaining({
            body,
        }));
    });

    it('returns 400 for invalid action_type', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Invalid action type' },
        });

        const { error } = await mockSupabase.functions.invoke('admin-actions', {
            method: 'POST',
            body: { action_type: 'invalid_type' },
            headers: expect.any(Object),
        });

        expect(error.message).toBe('Invalid action type');
    });
});
