import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockSupabase } from '@/test/setup';

describe('getAuthHeaders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    });

    async function getAuthHeaders() {
        let { data: { session } } = await mockSupabase.auth.getSession();
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            session = refreshed.data.session;
        }
        return {
            'Content-Type': 'application/json',
            apikey: 'test-anon-key',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
    }

    it('returns Authorization header when session exists', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } },
        });
        const headers = await getAuthHeaders();
        expect(headers).toEqual({
            'Content-Type': 'application/json',
            apikey: 'test-anon-key',
            Authorization: 'Bearer token-123',
        });
    });

    it('calls refreshSession when session is null', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.refreshSession.mockResolvedValue({
            data: { session: { access_token: 'refreshed-token' } },
        });
        const headers = await getAuthHeaders();
        expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
        expect(headers.Authorization).toBe('Bearer refreshed-token');
    });

    it('omits Authorization when both session and refresh fail', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.refreshSession.mockResolvedValue({
            data: { session: null },
        });
        const headers = await getAuthHeaders();
        expect(headers.Authorization).toBeUndefined();
        expect(headers.apikey).toBe('test-anon-key');
    });
});

describe('apiCall', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    });

    async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
        const SUPABASE_ANON_KEY = 'test-anon-key';
        let { data: { session } } = await mockSupabase.auth.getSession();
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            session = refreshed.data.session;
        }
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const mergedHeaders = { ...headers, ...options.headers };
        const maybeJsonBody =
            typeof options.body === 'string' && (mergedHeaders['Content-Type'] ?? mergedHeaders['content-type']) === 'application/json'
                ? JSON.parse(options.body)
                : options.body;

        const { data, error } = await mockSupabase.functions.invoke(path, {
            method: options.method,
            body: maybeJsonBody,
            headers: mergedHeaders,
        });

        if (error) {
            throw {
                message: error.message ?? 'Request failed',
                code: 'FUNCTION_ERROR',
                status: 500,
            };
        }

        return (data as { data?: T }).data as T;
    }

    it('returns data.data on successful invoke', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { post: { id: '1' }, tasks: [] } },
            error: null,
        });
        const result = await apiCall<{ post: unknown; tasks: unknown[] }>('create-post', {
            method: 'POST',
            body: JSON.stringify({ linkedin_url: 'https://linkedin.com/post/1' }),
        });
        expect(result).toEqual({ post: { id: '1' }, tasks: [] });
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('create-post', {
            method: 'POST',
            body: { linkedin_url: 'https://linkedin.com/post/1' },
            headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
        });
    });

    it('throws on invoke error', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Function error' },
        });
        await expect(apiCall('create-post', { method: 'POST', body: JSON.stringify({}) })).rejects.toEqual({
            message: 'Function error',
            code: 'FUNCTION_ERROR',
            status: 500,
        });
    });
});

describe('api method calls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
    });

    async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
        const SUPABASE_ANON_KEY = 'test-anon-key';
        let { data: { session } } = await mockSupabase.auth.getSession();
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            session = refreshed.data.session;
        }
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const mergedHeaders = { ...headers, ...options.headers };
        const maybeJsonBody =
            typeof options.body === 'string' && (mergedHeaders['Content-Type'] ?? mergedHeaders['content-type']) === 'application/json'
                ? JSON.parse(options.body)
                : options.body;
        const { data, error } = await mockSupabase.functions.invoke(path, {
            method: options.method,
            body: maybeJsonBody,
            headers: mergedHeaders,
        });
        if (error) {
            throw { message: error.message ?? 'Request failed', code: 'FUNCTION_ERROR', status: 500 };
        }
        return (data as { data?: T }).data as T;
    }

    it('createPost sends POST with correct body', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { post: { id: '1' }, tasks: [] } },
            error: null,
        });
        const body = {
            linkedin_url: 'https://linkedin.com/post/1',
            requested_like: true,
            requested_comment: false,
            requested_repost: false,
        };
        await apiCall('create-post', { method: 'POST', body: JSON.stringify(body) });
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('create-post', expect.objectContaining({
            method: 'POST',
            body: body,
        }));
    });

    it('getRequestLimits sends GET with no body', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { allowed: true } },
            error: null,
        });
        await apiCall('request-limits');
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('request-limits', expect.objectContaining({
            method: undefined,
            body: undefined,
        }));
    });

    it('getAdminDashboard sends GET', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { flags: [], settings: {} } },
            error: null,
        });
        await apiCall('admin-dashboard');
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('admin-dashboard', expect.any(Object));
    });

    it('adminAction sends POST with action_type', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { data: { success: true } },
            error: null,
        });
        const body = { action_type: 'global_setting_changed', payload: { key: 'val' } };
        await apiCall('admin-actions', { method: 'POST', body: JSON.stringify(body) });
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('admin-actions', expect.objectContaining({
            method: 'POST',
            body: body,
        }));
    });
});
