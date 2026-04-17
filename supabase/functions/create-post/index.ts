import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRequestLimits } from '../_shared/request-limits.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateMaxLength, validateUrl, collectErrors } from '../_shared/validation.ts';

const LINKEDIN_URL_PATTERN = /^https?:\/\/(www\.)?linkedin\.com\/posts\//;

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        const auth = await requireAuth(req);

        if (req.method !== 'POST') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const identifier = await getRateLimitIdentifier(req, auth.userId);
        const rl = await checkRateLimit(identifier, 'create_post');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { linkedin_url, title, description, requested_like, requested_comment, requested_repost } = body;

        if (!linkedin_url || !LINKEDIN_URL_PATTERN.test(linkedin_url)) {
            return errorResponse(req, 'Invalid LinkedIn post URL. Must be a linkedin.com/posts/ URL.', 400, 'INVALID_URL');
        }

        const validationError = collectErrors(
            validateMaxLength(title, 'title', 200),
            validateMaxLength(description, 'description', 2000),
            validateUrl(linkedin_url, 'linkedin_url'),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        if (!requested_like && !requested_comment && !requested_repost) {
            return errorResponse(req, 'At least one task type must be selected (like, comment, or repost).', 400, 'NO_TASKS');
        }

        const limitCheck = await checkRequestLimits(auth.userId);
        if (!limitCheck.allowed) {
            return errorResponse(req, limitCheck.message ?? 'Request limit exceeded', 429, limitCheck.reason);
        }

        const supabase = getSupabaseServiceClient();

        const { data: post, error: postError } = await supabase
            .from('linkedin_posts')
            .insert({
                owner_user_id: auth.userId,
                linkedin_url,
                title: title || null,
                description: description || null,
                requested_like: !!requested_like,
                requested_comment: !!requested_comment,
                requested_repost: !!requested_repost,
                status: 'active',
            })
            .select()
            .single();

        if (postError) {
            return errorResponse(req, 'Failed to create post: ' + postError.message, 500);
        }

        const taskInserts: { post_id: string; task_type: string; is_enabled: boolean }[] = [];
        const points = await getBasePoints(supabase);

        if (requested_like) taskInserts.push({ post_id: post.id, task_type: 'like', is_enabled: true });
        if (requested_comment) taskInserts.push({ post_id: post.id, task_type: 'comment', is_enabled: true });
        if (requested_repost) taskInserts.push({ post_id: post.id, task_type: 'repost', is_enabled: true });

        const { data: tasks } = await supabase
            .from('post_tasks')
            .insert(taskInserts.map(t => ({ ...t, base_points: points[t.task_type] ?? 10 })))
            .select();

        return successResponse(req, { post, tasks }, 201, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});

async function getBasePoints(supabase: ReturnType<typeof getSupabaseServiceClient>) {
    const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['points_like', 'points_comment', 'points_repost']);

    const result: Record<string, number> = { like: 10, comment: 15, repost: 10 };
    for (const row of data ?? []) {
        const type = row.key.replace('points_', '');
        result[type] = parseInt(row.value, 10);
    }
    return result;
}
