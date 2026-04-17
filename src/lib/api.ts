import { supabase } from '@/lib/supabase';
import type { PostComment } from '@/types';

interface ApiError {
    message: string;
    code: string;
    status: number;
}

function headersToObject(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }
    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }
    return { ...headers };
}

function buildApiError(message: string, code = 'FUNCTION_ERROR', status = 500): ApiError {
    return { message, code, status };
}

async function ensureAuthenticatedSession(): Promise<void> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        throw buildApiError(error.message, 'AUTH_SESSION_ERROR', 401);
    }

    if (session?.access_token) {
        return;
    }

    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (!data.session?.access_token || refreshError) {
        throw buildApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }
}

async function readFunctionError(response: Response | undefined, fallbackMessage: string): Promise<ApiError> {
    if (!response) {
        return buildApiError(fallbackMessage);
    }

    try {
        const body = await response.clone().json() as { error?: { message?: string; code?: string } };
        return buildApiError(
            body.error?.message ?? fallbackMessage,
            body.error?.code ?? 'FUNCTION_ERROR',
            response.status || 500,
        );
    } catch {
        return buildApiError(fallbackMessage, 'FUNCTION_ERROR', response.status || 500);
    }
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
    await ensureAuthenticatedSession();

    const mergedHeaders = headersToObject(options.headers);
    const contentType = mergedHeaders['Content-Type'] ?? mergedHeaders['content-type'];
    const maybeJsonBody =
        typeof options.body === 'string' && (!contentType || contentType === 'application/json')
            ? JSON.parse(options.body)
            : options.body;

    const invokeHeaders =
        maybeJsonBody === undefined
            ? mergedHeaders
            : { 'Content-Type': 'application/json', ...mergedHeaders };

    const { data, error, response } = await supabase.functions.invoke(path, {
        method: options.method,
        body: maybeJsonBody,
        headers: invokeHeaders,
    });

    if (error) {
        throw await readFunctionError(response, error.message ?? 'Request failed');
    }

    return (data as { data?: T }).data as T;
}

export const api = {
    async createPost(body: {
        linkedin_url: string;
        title?: string;
        description?: string;
        requested_like: boolean;
        requested_comment: boolean;
        requested_repost: boolean;
    }) {
        return apiCall<{ post: unknown; tasks: unknown[] }>('create-post', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async claimTask(body: { post_id: string; task_type: string }) {
        return apiCall<{ claim: unknown }>('claim-task', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async completeClaim(body: {
        claim_id: string;
        supporter_note?: string;
        comment_text?: string;
        repost_text?: string;
        proof_screenshot_url?: string;
    }) {
        return apiCall<{ claim: unknown }>('complete-claim', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async reviewClaim(body: { claim_id: string; decision: 'approved' | 'rejected'; note?: string }) {
        return apiCall<{ claim: unknown }>('review-claim', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async getRequestLimits() {
        return apiCall<unknown>('request-limits');
    },

    async getAdminDashboard() {
        return apiCall<unknown>('admin-dashboard');
    },

    async adminAction(body: {
        action_type: string;
        target_user_id?: string;
        target_post_id?: string;
        target_claim_id?: string;
        payload?: Record<string, unknown>;
        note?: string;
    }) {
        return apiCall<{ success: boolean }>('admin-actions', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async submitFeedback(body: { message: string }) {
        return apiCall<{ success: boolean }>('submit-feedback', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async submitReport(body: {
        target_type: 'post' | 'claim';
        target_id: string;
        flag_type: string;
        reason: string;
    }) {
        return apiCall<{ reported: boolean }>('submit-report', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async getPostComments(postId: string): Promise<PostComment[]> {
        const { data, error } = await supabase
            .from('task_claims')
            .select(`
                id,
                comment_text,
                approved_at,
                profiles!task_claims_supporter_user_id_fkey (
                    display_name
                )
            `)
            .eq('post_id', postId)
            .eq('task_type', 'comment')
            .eq('status', 'approved')
            .not('comment_text', 'is', null)
            .order('approved_at', { ascending: false });

        if (error) {
            throw new Error('Failed to load comments: ' + error.message);
        }

        return (data ?? []).map((row) => ({
            id: row.id as string,
            comment_text: row.comment_text as string,
            approved_at: row.approved_at as string,
            supporter_display_name: (row.profiles as { display_name: string | null } | null)?.display_name ?? null,
        }));
    },
};
