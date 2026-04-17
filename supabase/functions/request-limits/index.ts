import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAuth } from '../_shared/auth.ts';
import { getUserLimitsSummary } from '../_shared/request-limits.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        const auth = await requireAuth(req);

        if (req.method !== 'GET') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const identifier = await getRateLimitIdentifier(req, auth.userId);
        const rl = await checkRateLimit(identifier, 'default');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const summary = await getUserLimitsSummary(auth.userId);
        return successResponse(req, summary, 200, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : 500;
        return errorResponse(req, message, status);
    }
});
