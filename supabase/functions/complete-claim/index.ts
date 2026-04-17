import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateMaxLength, validateUrl, collectErrors } from '../_shared/validation.ts';

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
        const rl = await checkRateLimit(identifier, 'complete_claim');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { claim_id, supporter_note, comment_text, repost_text, proof_screenshot_url } = body;

        const validationError = collectErrors(
            validateRequired(claim_id, 'claim_id'),
            validateMaxLength(supporter_note, 'supporter_note', 1000),
            validateMaxLength(comment_text, 'comment_text', 2000),
            validateMaxLength(repost_text, 'repost_text', 2000),
            validateUrl(proof_screenshot_url, 'proof_screenshot_url'),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        const supabase = getSupabaseServiceClient();

        const { data: claim, error: claimError } = await supabase
            .from('task_claims')
            .select('*')
            .eq('id', claim_id)
            .single();

        if (claimError || !claim) {
            return errorResponse(req, 'Claim not found', 404);
        }

        if (claim.supporter_user_id !== auth.userId) {
            return errorResponse(req, 'You can only complete your own claims', 403);
        }

        if (claim.status !== 'claimed') {
            return errorResponse(req, 'Claim is not in claimable state', 400, 'INVALID_STATUS');
        }

        const { data: fastCompleteSetting } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'fast_complete_seconds')
            .single();

        const fastCompleteSeconds = parseInt(fastCompleteSetting?.value ?? '30', 10);
        const startedAt = new Date(claim.started_at);
        const elapsed = (Date.now() - startedAt.getTime()) / 1000;

        if (elapsed < fastCompleteSeconds) {
            return errorResponse(req, `Completed too fast. Please wait at least ${fastCompleteSeconds} seconds before marking as complete.`, 400, 'TOO_FAST');
        }

        if (claim.task_type === 'comment' && comment_text) {
            const { data: minLenSetting } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'min_comment_length')
                .single();
            const minLen = parseInt(minLenSetting?.value ?? '10', 10);
            if (comment_text.trim().length < minLen) {
                return errorResponse(req, `Comment must be at least ${minLen} characters`, 400, 'COMMENT_TOO_SHORT');
            }
        }

        const updateData: Record<string, unknown> = {
            status: 'pending_review',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (supporter_note) updateData.supporter_note = supporter_note;
        if (comment_text) updateData.comment_text = comment_text;
        if (repost_text) updateData.repost_text = repost_text;
        if (proof_screenshot_url) updateData.proof_screenshot_url = proof_screenshot_url;

        const { data: updatedClaim, error: updateError } = await supabase
            .from('task_claims')
            .update(updateData)
            .eq('id', claim_id)
            .select()
            .single();

        if (updateError) {
            return errorResponse(req, 'Failed to complete claim: ' + updateError.message, 500);
        }

        return successResponse(req, { claim: updatedClaim }, 200, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
