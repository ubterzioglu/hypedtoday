import { requireAuth } from '../_shared/auth.ts';
import { handleCors, originCheck } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { collectErrors, validateRequired, validateUuid } from '../_shared/validation.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);
        if (req.method !== 'POST') return errorResponse(req, 'Method not allowed', 405);

        const auth = await requireAuth(req);
        const body = await req.json();
        const postId = String(body.post_id ?? '').trim();

        const validationError = collectErrors(
            validateRequired(postId, 'post_id'),
            validateUuid(postId, 'post_id'),
        );
        if (validationError) return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');

        const supabase = getSupabaseServiceClient();

        const { data: post, error: postError } = await supabase
            .from('linkedin_posts')
            .select('id, owner_user_id, status')
            .eq('id', postId)
            .maybeSingle();

        if (postError) return errorResponse(req, postError.message, 500);
        if (!post) return errorResponse(req, 'Tracked post not found.', 404, 'NOT_FOUND');

        if (String(post.owner_user_id) !== auth.userId && auth.role !== 'admin') {
            return errorResponse(req, 'Only the post owner can close this post.', 403, 'FORBIDDEN');
        }

        const { data: updated, error: updateError } = await supabase
            .from('linkedin_posts')
            .update({ status: 'closed' })
            .eq('id', postId)
            .select('id, owner_user_id, linkedin_url, published_at, note, status, created_at')
            .single();

        if (updateError) return errorResponse(req, updateError.message, 500);

        return successResponse(req, { post: updated });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
