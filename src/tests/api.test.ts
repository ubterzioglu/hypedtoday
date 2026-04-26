import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';
import { mockSupabase } from '@/test/setup';

describe('ensureAuthenticatedSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    async function ensureAuthenticatedSession() {
        const { data: { session }, error } = await mockSupabase.auth.getSession();
        if (error) {
            throw {
                message: error.message,
                code: 'AUTH_SESSION_ERROR',
                status: 401,
            };
        }
        if (session?.access_token) {
            return;
        }

        const { data, error: refreshError } = await mockSupabase.auth.refreshSession();
        if (!data.session?.access_token || refreshError) {
            throw {
                message: 'Unauthorized',
                code: 'UNAUTHORIZED',
                status: 401,
            };
        }
    }

    it('returns when a session exists', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } },
        });
        await expect(ensureAuthenticatedSession()).resolves.toBeUndefined();
    });

    it('calls refreshSession when session is null', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.refreshSession.mockResolvedValue({
            data: { session: { access_token: 'refreshed-token' } },
        });
        await ensureAuthenticatedSession();
        expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('throws when both session and refresh fail', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.refreshSession.mockResolvedValue({
            data: { session: null },
        });
        await expect(ensureAuthenticatedSession()).rejects.toEqual({
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            status: 401,
        });
    });
});

describe('apiCall', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
        const { data: { session }, error: sessionError } = await mockSupabase.auth.getSession();
        if (sessionError) {
            throw {
                message: sessionError.message,
                code: 'AUTH_SESSION_ERROR',
                status: 401,
            };
        }
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            if (!refreshed.data.session?.access_token) {
                throw {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED',
                    status: 401,
                };
            }
        }
        const mergedHeaders = (options.headers as Record<string, string> | undefined) ?? {};
        const contentType = mergedHeaders['Content-Type'] ?? mergedHeaders['content-type'];
        const maybeJsonBody =
            typeof options.body === 'string' && (!contentType || contentType === 'application/json')
                ? JSON.parse(options.body)
                : options.body;
        const invokeHeaders = maybeJsonBody === undefined
            ? mergedHeaders
            : { 'Content-Type': 'application/json', ...mergedHeaders };

        const { data, error, response } = await mockSupabase.functions.invoke(path, {
            method: options.method,
            body: maybeJsonBody,
            headers: invokeHeaders,
        });

        if (error) {
            if (response) {
                const body = await response.json() as { error?: { message?: string; code?: string } };
                throw {
                    message: body.error?.message ?? error.message ?? 'Request failed',
                    code: body.error?.code ?? 'FUNCTION_ERROR',
                    status: response.status,
                };
            }
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
            body: JSON.parse(JSON.stringify({ linkedin_url: 'https://linkedin.com/post/1' })),
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('throws parsed function error details', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Function error' },
            response: {
                status: 401,
                json: vi.fn().mockResolvedValue({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }),
            },
        });
        await expect(apiCall('create-post', { method: 'POST', body: JSON.stringify({}) })).rejects.toEqual({
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            status: 401,
        });
    });
});

describe('api method calls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { access_token: 'tok' } },
        });
    });

    async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
        const { data: { session } } = await mockSupabase.auth.getSession();
        if (!session?.access_token) {
            const refreshed = await mockSupabase.auth.refreshSession();
            if (!refreshed.data.session?.access_token) {
                throw { message: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 };
            }
        }
        const mergedHeaders = (options.headers as Record<string, string> | undefined) ?? {};
        const contentType = mergedHeaders['Content-Type'] ?? mergedHeaders['content-type'];
        const maybeJsonBody =
            typeof options.body === 'string' && (!contentType || contentType === 'application/json')
                ? JSON.parse(options.body)
                : options.body;
        const invokeHeaders = maybeJsonBody === undefined
            ? mergedHeaders
            : { 'Content-Type': 'application/json', ...mergedHeaders };
        const { data, error } = await mockSupabase.functions.invoke(path, {
            method: options.method,
            body: maybeJsonBody,
            headers: invokeHeaders,
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
            headers: { 'Content-Type': 'application/json' },
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

describe('api.createPost', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase.auth.getSession.mockResolvedValue({
            data: {
                session: {
                    access_token: 'tok',
                    expires_at: Math.floor(Date.now() / 1000) + 3600,
                },
            },
        });
    });

    it('throws parsed Edge Function validation errors', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Edge Function returned a non-2xx status code' },
            response: new Response(
                JSON.stringify({
                    error: {
                        message: 'Invalid LinkedIn post URL. Use a LinkedIn post URL, not a profile URL.',
                        code: 'INVALID_URL',
                    },
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            ),
        });

        await expect(api.createPost({
            linkedin_url: 'https://www.linkedin.com/in/ubterzioglu/',
            requested_like: true,
            requested_comment: false,
            requested_repost: false,
        })).rejects.toEqual({
            message: 'Invalid LinkedIn post URL. Use a LinkedIn post URL, not a profile URL.',
            code: 'INVALID_URL',
            status: 400,
        });
    });
});

describe('linkedin profile api methods', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submitLinkedinProfile invokes the public edge function without requiring auth', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: {
                data: {
                    profile: {
                        id: 'profile-1',
                        first_name: 'Ada',
                        last_name: 'Lovelace',
                        whatsapp_number: '+905551112233',
                        linkedin_url: 'https://www.linkedin.com/in/ada',
                        created_at: '2026-04-26T10:00:00Z',
                    },
                },
            },
            error: null,
        });

        await expect(api.submitLinkedinProfile({
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '+905551112233',
            linkedin_url: 'https://www.linkedin.com/in/ada',
        })).resolves.toEqual({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                created_at: '2026-04-26T10:00:00Z',
            },
        });

        expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('submit-linkedin-profile', {
            method: 'POST',
            body: {
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
            },
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('submitLinkedinProfile falls back to authenticated direct insert when the edge function is missing', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: null,
            error: new Error('Failed to send a request to the Edge Function'),
        });
        const single = vi.fn().mockResolvedValue({
            data: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                created_at: '2026-04-26T10:00:00Z',
            },
            error: null,
        });
        const select = vi.fn().mockReturnValue({ single });
        const insert = vi.fn().mockReturnValue({ select });
        mockSupabase.from.mockReturnValue({ insert });

        await expect(api.submitLinkedinProfile({
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '+905551112233',
            linkedin_url: 'https://www.linkedin.com/in/ada',
        })).resolves.toEqual({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                created_at: '2026-04-26T10:00:00Z',
            },
        });

        expect(mockSupabase.from).toHaveBeenCalledWith('linkedin_profiles');
        expect(insert).toHaveBeenCalledWith({
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '+905551112233',
            linkedin_url: 'https://www.linkedin.com/in/ada',
        });
    });

    it('saveLinkedinProfile updates the authenticated profile without the edge function', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
        });
        const single = vi.fn().mockResolvedValue({
            data: {
                id: 'user-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                updated_at: '2026-04-26T12:00:00Z',
            },
            error: null,
        });
        const select = vi.fn().mockReturnValue({ single });
        const eq = vi.fn().mockReturnValue({ select });
        const update = vi.fn().mockReturnValue({ eq });
        mockSupabase.from.mockReturnValue({ update });

        await expect(api.saveLinkedinProfile({
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '+905551112233',
            linkedin_url: 'https://www.linkedin.com/in/ada',
        })).resolves.toEqual({
            profile: {
                id: 'user-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                updated_at: '2026-04-26T12:00:00Z',
            },
        });

        expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(update).toHaveBeenCalledWith({
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '+905551112233',
            linkedin_url: 'https://www.linkedin.com/in/ada',
            display_name: 'Ada Lovelace',
        });
        expect(eq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('getLinkedinProfiles reads profiles ordered newest first', async () => {
        const order = vi.fn().mockResolvedValue({
            data: [
                {
                    id: 'profile-2',
                    first_name: 'Grace',
                    last_name: 'Hopper',
                    whatsapp_number: '+905559998877',
                    linkedin_url: 'https://www.linkedin.com/in/grace',
                    created_at: '2026-04-26T11:00:00Z',
                },
            ],
            error: null,
        });
        const select = vi.fn().mockReturnValue({ order });
        mockSupabase.from.mockReturnValue({ select });

        await expect(api.getLinkedinProfiles()).resolves.toEqual([
            {
                id: 'profile-2',
                first_name: 'Grace',
                last_name: 'Hopper',
                whatsapp_number: '+905559998877',
                linkedin_url: 'https://www.linkedin.com/in/grace',
                created_at: '2026-04-26T11:00:00Z',
            },
        ]);

        expect(mockSupabase.from).toHaveBeenCalledWith('linkedin_profiles');
        expect(select).toHaveBeenCalledWith('id, first_name, last_name, whatsapp_number, linkedin_url, created_at');
        expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
});
