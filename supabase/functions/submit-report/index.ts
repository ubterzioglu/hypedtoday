import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateEnum, validateMaxLength, collectErrors } from '../_shared/validation.ts';

const VALID_FLAG_TYPES = ['spam', 'abuse', 'inappropriate', 'broken_link', 'other'];

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
        const rl = await checkRateLimit(identifier, 'submit_report');
        if (!rl.allowed) {
            return errorResponse(req, 'Too many reports. Please try again later.', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const { target_type, target_id, flag_type, reason } = body;

        const validationError = collectErrors(
            validateRequired(target_type, 'target_type'),
            validateRequired(target_id, 'target_id'),
            validateRequired(flag_type, 'flag_type'),
            validateRequired(reason, 'reason'),
            flag_type ? validateEnum(flag_type, 'flag_type', VALID_FLAG_TYPES) : null,
            validateMaxLength(reason, 'reason', 1000),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        if (!['post', 'claim'].includes(target_type)) {
            return errorResponse(req, 'target_type must be post or claim', 400);
        }

        const supabase = getSupabaseServiceClient();

        const { count: recentReports } = await supabase
            .from('user_reports')
            .select('*', { count: 'exact', head: true })
            .eq('reporter_user_id', auth.userId)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if ((recentReports ?? 0) >= 10) {
            return errorResponse(req, 'Daily report limit reached', 429, 'REPORT_LIMIT');
        }

        const { data: existing } = await supabase
            .from('user_reports')
            .select('id')
            .eq('reporter_user_id', auth.userId)
            .eq('target_type', target_type)
            .eq('target_id', target_id)
            .maybeSingle();

        if (existing) {
            return errorResponse(req, 'You have already reported this item', 409, 'DUPLICATE_REPORT');
        }

        const { error: insertError } = await supabase.from('user_reports').insert({
            reporter_user_id: auth.userId,
            target_type,
            target_id,
            flag_type,
            reason,
            status: 'open',
        });

        if (insertError) {
            return errorResponse(req, 'Failed to submit report: ' + insertError.message, 500);
        }

        return successResponse(req, { reported: true }, 201, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
