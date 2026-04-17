import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateMaxLength, validateEnum, collectErrors } from '../_shared/validation.ts';

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
        const rl = await checkRateLimit(identifier, 'review_claim');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { claim_id, decision, note } = body;

        const validationError = collectErrors(
            validateRequired(claim_id, 'claim_id'),
            validateRequired(decision, 'decision'),
            decision ? validateEnum(decision, 'decision', ['approved', 'rejected']) : null,
            validateMaxLength(note, 'note', 1000),
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

        if (claim.owner_user_id !== auth.userId) {
            return errorResponse(req, 'Only the post owner can review claims', 403);
        }

        if (claim.status !== 'pending_review') {
            return errorResponse(req, 'Claim is not pending review', 400, 'INVALID_STATUS');
        }

        if (claim.supporter_user_id === auth.userId) {
            return errorResponse(req, 'You cannot review your own claim', 400, 'SELF_REVIEW');
        }

        const now = new Date().toISOString();

        const { data: updatedClaim, error: updateError } = await supabase
            .from('task_claims')
            .update({
                status: decision,
                owner_decision_by: auth.userId,
                owner_decision_note: note || null,
                approved_at: decision === 'approved' ? now : null,
                rejected_at: decision === 'rejected' ? now : null,
                updated_at: now,
            })
            .eq('id', claim_id)
            .select()
            .single();

        if (updateError) {
            return errorResponse(req, 'Failed to update claim: ' + updateError.message, 500);
        }

        await supabase.from('post_owner_reviews').insert({
            task_claim_id: claim_id,
            owner_user_id: auth.userId,
            decision,
            note: note || null,
        });

        if (decision === 'approved') {
            await createScoreEvent(supabase, claim, auth.userId);
        }

        return successResponse(req, { claim: updatedClaim }, 200, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});

async function createScoreEvent(
    supabase: ReturnType<typeof getSupabaseServiceClient>,
    claim: Record<string, unknown>,
    _ownerUserId: string,
) {
    const taskType = claim.task_type as string;
    const supporterUserId = claim.supporter_user_id as string;
    const postId = claim.post_id as string;
    const claimId = claim.id as string;

    const pointKey = `points_${taskType}` as string;
    const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', pointKey)
        .single();

    const points = parseInt(setting?.value ?? '10', 10);

    await supabase.from('score_events').insert({
        user_id: supporterUserId,
        event_type: `${taskType}_approved`,
        points,
        post_id: postId,
        task_claim_id: claimId,
    });

    await checkAndAwardCombo(supabase, supporterUserId, postId);
}

async function checkAndAwardCombo(
    supabase: ReturnType<typeof getSupabaseServiceClient>,
    supporterUserId: string,
    postId: string,
) {
    const { data: approvedClaims } = await supabase
        .from('task_claims')
        .select('task_type')
        .eq('post_id', postId)
        .eq('supporter_user_id', supporterUserId)
        .eq('status', 'approved');

    const taskTypes = new Set((approvedClaims ?? []).map((c: { task_type: string }) => c.task_type));
    if (!taskTypes.has('like') || !taskTypes.has('comment') || !taskTypes.has('repost')) {
        return;
    }

    const { data: existingCombo } = await supabase
        .from('score_events')
        .select('id')
        .eq('user_id', supporterUserId)
        .eq('post_id', postId)
        .eq('event_type', 'combo_bonus')
        .maybeSingle();

    if (existingCombo) return;

    const { data: comboSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'points_combo_all_three')
        .single();

    const comboPoints = parseInt(comboSetting?.value ?? '50', 10);

    await supabase.from('score_events').insert({
        user_id: supporterUserId,
        event_type: 'combo_bonus',
        points: comboPoints,
        post_id: postId,
        metadata_json: { reason: 'All three tasks approved for same post' },
    });
}
