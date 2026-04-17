import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateMaxLength, collectErrors } from '../_shared/validation.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        const identifier = await getRateLimitIdentifier(req);
        const rl = await checkRateLimit(identifier, 'default');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        if (req.method !== 'POST') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const body = await req.json();
        const { message } = body;

        const validationError = collectErrors(
            validateRequired(message, 'message'),
            validateMaxLength(message, 'message', 2000),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        const supabase = getSupabaseServiceClient();

        const encoder = new TextEncoder();
        const data = encoder.encode(message.trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const textHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const { count: recentFeedback } = await supabase
            .from('feedback')
            .select('*', { count: 'exact', head: true })
            .eq('text_hash', textHash)
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        if ((recentFeedback ?? 0) > 0) {
            return errorResponse(req, 'Similar feedback was already submitted recently', 429, 'DUPLICATE_FEEDBACK');
        }

        const { error: insertError } = await supabase.from('feedback').insert({
            message,
            text_hash: textHash,
        });

        if (insertError) {
            return errorResponse(req, 'Failed to submit feedback: ' + insertError.message, 500);
        }

        return successResponse(req, { success: true }, 201, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return errorResponse(req, message, 500);
    }
});
