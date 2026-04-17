import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAdmin } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateMaxLength, collectErrors } from '../_shared/validation.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        const auth = await requireAdmin(req);

        if (req.method !== 'POST') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const identifier = await getRateLimitIdentifier(req, auth.userId);
        const rl = await checkRateLimit(identifier, 'admin');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { action_type, target_user_id, target_post_id, target_claim_id, payload, note } = body;

        const validationError = collectErrors(
            validateRequired(action_type, 'action_type'),
            validateMaxLength(note, 'note', 2000),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        const validActionTypes = [
            'user_suspended', 'user_unsuspended',
            'post_hidden', 'post_archived', 'post_paused', 'post_deleted',
            'claim_override_approved', 'claim_override_rejected', 'claim_cancelled', 'claim_expired',
            'score_adjusted_plus', 'score_adjusted_minus',
            'request_limit_changed', 'request_ban_set', 'request_ban_removed',
            'global_setting_changed',
        ];

        if (!validActionTypes.includes(action_type)) {
            return errorResponse(req, 'Invalid action_type', 400);
        }

        const criticalActions = [
            'score_adjusted_plus', 'score_adjusted_minus',
            'user_suspended', 'post_deleted',
            'claim_override_approved', 'claim_override_rejected',
            'global_setting_changed',
        ];

        if (criticalActions.includes(action_type) && !note) {
            return errorResponse(req, 'A note is required for this action', 400, 'NOTE_REQUIRED');
        }

        const supabase = getSupabaseServiceClient();

        if (action_type === 'user_suspended' && target_user_id) {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'user', updated_at: new Date().toISOString() })
                .eq('id', target_user_id);
            if (error) return errorResponse(req, 'Failed to suspend user: ' + error.message, 500);
        }

        if (action_type === 'request_ban_set' && target_user_id) {
            const { error } = await supabase
                .from('profiles')
                .update({ request_banned: true, updated_at: new Date().toISOString() })
                .eq('id', target_user_id);
            if (error) return errorResponse(req, 'Failed to ban user: ' + error.message, 500);
        }

        if (action_type === 'request_ban_removed' && target_user_id) {
            const { error } = await supabase
                .from('profiles')
                .update({ request_banned: false, updated_at: new Date().toISOString() })
                .eq('id', target_user_id);
            if (error) return errorResponse(req, 'Failed to unban user: ' + error.message, 500);
        }

        if (['post_hidden', 'post_archived', 'post_paused', 'post_deleted'].includes(action_type) && target_post_id) {
            const statusMap: Record<string, string> = {
                post_hidden: 'hidden_by_admin',
                post_archived: 'archived',
                post_paused: 'paused',
                post_deleted: 'deleted',
            };
            const { error } = await supabase
                .from('linkedin_posts')
                .update({ status: statusMap[action_type], updated_at: new Date().toISOString() })
                .eq('id', target_post_id);
            if (error) return errorResponse(req, 'Failed to update post: ' + error.message, 500);
        }

        if (['claim_override_approved', 'claim_override_rejected'].includes(action_type) && target_claim_id) {
            const newStatus = action_type === 'claim_override_approved' ? 'approved' : 'rejected';
            const now = new Date().toISOString();
            const updateData: Record<string, unknown> = {
                status: newStatus,
                owner_decision_by: auth.userId,
                updated_at: now,
            };
            if (newStatus === 'approved') updateData.approved_at = now;
            if (newStatus === 'rejected') updateData.rejected_at = now;

            const { error } = await supabase
                .from('task_claims')
                .update(updateData)
                .eq('id', target_claim_id);
            if (error) return errorResponse(req, 'Failed to override claim: ' + error.message, 500);
        }

        if (['score_adjusted_plus', 'score_adjusted_minus'].includes(action_type) && target_user_id) {
            const points = payload?.points ?? 0;
            if (points <= 0) return errorResponse(req, 'Points must be positive', 400);

            await supabase.from('score_events').insert({
                user_id: target_user_id,
                event_type: action_type,
                points: action_type === 'score_adjusted_plus' ? points : -points,
                metadata_json: { admin_note: note, adjusted_by: auth.userId },
            });
        }

        if (action_type === 'global_setting_changed' && payload?.key && payload?.value) {
            await supabase.from('system_settings').upsert({
                key: payload.key,
                value: String(payload.value),
                updated_by: auth.userId,
                updated_at: new Date().toISOString(),
            });
        }

        if (action_type === 'request_limit_changed' && target_user_id && payload) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    request_limit_overrides: payload,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', target_user_id);
            if (error) return errorResponse(req, 'Failed to update limits: ' + error.message, 500);
        }

        await supabase.from('admin_actions').insert({
            admin_user_id: auth.userId,
            action_type,
            target_user_id: target_user_id || null,
            target_post_id: target_post_id || null,
            target_claim_id: target_claim_id || null,
            payload_json: payload || {},
            note: note || null,
        });

        return successResponse(req, { success: true }, 200, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' || message === 'Admin access required' ? 401 : 500;
        return errorResponse(req, message, status);
    }
});
