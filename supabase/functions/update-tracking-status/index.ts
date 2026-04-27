import { requireAuth } from '../_shared/auth.ts';
import { handleCors, originCheck } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { collectErrors, validateEnum, validateMaxLength, validateRequired, validateUuid } from '../_shared/validation.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);
        if (req.method !== 'POST') return errorResponse(req, 'Method not allowed', 405);

        const auth = await requireAuth(req);
        const body = await req.json();
        const trackingId = String(body.tracking_id ?? '').trim();
        const statusValue = String(body.status ?? '').trim();
        const note = typeof body.note === 'string' ? body.note.trim() : '';

        const validationError = collectErrors(
            validateRequired(trackingId, 'tracking_id'),
            validateUuid(trackingId, 'tracking_id'),
            validateEnum(statusValue, 'status', ['liked', 'not_yet', 'skipped']),
            validateMaxLength(note, 'note', 500),
        );
        if (validationError) return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');

        const supabase = getSupabaseServiceClient();

        const { data: tracking, error: trackingError } = await supabase
            .from('post_like_tracking')
            .select('id, member_user_id, post_id')
            .eq('id', trackingId)
            .maybeSingle();

        if (trackingError) return errorResponse(req, trackingError.message, 500);
        if (!tracking) return errorResponse(req, 'Tracking row not found.', 404, 'NOT_FOUND');
        if (String(tracking.member_user_id) !== auth.userId) {
            return errorResponse(req, 'You can only update your own tracking row.', 403, 'FORBIDDEN');
        }

        const { data: post, error: postError } = await supabase
            .from('linkedin_posts')
            .select('id, status')
            .eq('id', tracking.post_id)
            .maybeSingle();

        if (postError) return errorResponse(req, postError.message, 500);
        if (!post || String(post.status) !== 'open') {
            return errorResponse(req, 'Only open posts can be updated.', 400, 'POST_NOT_OPEN');
        }

        const { data: updated, error: updateError } = await supabase
            .from('post_like_tracking')
            .update({
                status: statusValue,
                marked_at: new Date().toISOString(),
                note: note || null,
            })
            .eq('id', trackingId)
            .select('id, post_id, member_user_id, status, marked_at, note, created_at')
            .single();

        if (updateError) return errorResponse(req, updateError.message, 500);

        return successResponse(req, { tracking: updated });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
