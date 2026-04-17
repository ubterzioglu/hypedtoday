import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateUuid, validateEnum, validateRequired, collectErrors } from '../_shared/validation.ts';

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
        const rl = await checkRateLimit(identifier, 'claim_task');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { post_id, task_type } = body;

        const validationError = collectErrors(
            validateRequired(post_id, 'post_id'),
            validateRequired(task_type, 'task_type'),
            post_id ? validateUuid(post_id, 'post_id') : null,
            task_type ? validateEnum(task_type, 'task_type', ['like', 'comment', 'repost']) : null,
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        const supabase = getSupabaseServiceClient();

        const { data: post, error: postError } = await supabase
            .from('linkedin_posts')
            .select('id, owner_user_id, status, requested_like, requested_comment, requested_repost')
            .eq('id', post_id)
            .single();

        if (postError || !post) {
            return errorResponse(req, 'Post not found', 404);
        }

        if (post.status !== 'active') {
            return errorResponse(req, 'Post is not active', 400, 'POST_NOT_ACTIVE');
        }

        if (post.owner_user_id === auth.userId) {
            return errorResponse(req, 'You cannot claim tasks on your own post', 400, 'OWN_POST');
        }

        const taskKey = `requested_${task_type}` as keyof typeof post;
        if (!post[taskKey]) {
            return errorResponse(req, `This post does not have ${task_type} task enabled`, 400, 'TASK_NOT_ENABLED');
        }

        const { data: hasActivePost } = await supabase
            .from('linkedin_posts')
            .select('id')
            .eq('owner_user_id', auth.userId)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

        if (!hasActivePost) {
            return errorResponse(req, 'You must have at least one active post before claiming tasks from others', 403, 'GIVE_TO_GET_REQUIRED');
        }

        const { data: existingClaim } = await supabase
            .from('task_claims')
            .select('id, status')
            .eq('post_id', post_id)
            .eq('task_type', task_type)
            .eq('supporter_user_id', auth.userId)
            .not('status', 'in', '(cancelled,expired)')
            .maybeSingle();

        if (existingClaim) {
            return errorResponse(req, 'You already have an active claim for this task', 409, 'DUPLICATE_CLAIM');
        }

        const { data: activeClaims } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'max_active_claims_per_user')
            .single();

        const maxActive = parseInt(activeClaims?.value ?? '5', 10);

        const { count: userActiveCount } = await supabase
            .from('task_claims')
            .select('*', { count: 'exact', head: true })
            .eq('supporter_user_id', auth.userId)
            .in('status', ['claimed', 'completed', 'pending_review']);

        if ((userActiveCount ?? 0) >= maxActive) {
            return errorResponse(req, `You have reached the maximum active claims limit (${maxActive})`, 429, 'MAX_CLAIMS');
        }

        const { data: claim, error: claimError } = await supabase
            .from('task_claims')
            .insert({
                post_id,
                task_type,
                supporter_user_id: auth.userId,
                owner_user_id: post.owner_user_id,
                status: 'claimed',
            })
            .select()
            .single();

        if (claimError) {
            return errorResponse(req, 'Failed to create claim: ' + claimError.message, 500);
        }

        return successResponse(req, { claim }, 201, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
