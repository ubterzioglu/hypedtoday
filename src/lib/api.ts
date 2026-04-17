import { supabase } from '@/lib/supabase';
import type { PostComment } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
        ...options,
        headers: { ...headers, ...options.headers },
    });

    const data = await res.json();

    if (!res.ok) {
        throw { message: data.error?.message ?? 'Request failed', code: data.error?.code, status: res.status };
    }

    return data.data as T;
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
