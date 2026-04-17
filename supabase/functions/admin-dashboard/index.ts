import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { requireAdmin } from '../_shared/auth.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        const auth = await requireAdmin(req);

        if (req.method !== 'GET') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const identifier = await getRateLimitIdentifier(req, auth.userId);
        const rl = await checkRateLimit(identifier, 'admin');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const supabase = getSupabaseServiceClient();

        const [users, posts, claims, scores, flags, limitLogs] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('linkedin_posts').select('id', { count: 'exact', head: true }),
            supabase.from('task_claims').select('id, status'),
            supabase.from('score_events').select('points'),
            supabase.from('admin_flags').select('id', { count: 'exact', head: true }).eq('status', 'open'),
            supabase.from('request_limit_logs').select('id').gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const [flagEntries, auditEntries] = await Promise.all([
            supabase
                .from('admin_flags')
                .select('id, flag_type, user_id, post_id, task_claim_id, reason, status, created_at')
                .order('created_at', { ascending: false })
                .limit(100),
            supabase
                .from('admin_actions')
                .select('id, admin_user_id, action_type, target_user_id, target_post_id, target_claim_id, note, created_at')
                .order('created_at', { ascending: false })
                .limit(100),
        ]);

        const allClaims = claims.data ?? [];
        const pendingCount = allClaims.filter(c => c.status === 'pending_review').length;
        const approvedCount = allClaims.filter(c => c.status === 'approved').length;
        const rejectedCount = allClaims.filter(c => c.status === 'rejected').length;
        const totalClaims = allClaims.length;
        const approvalRate = totalClaims > 0 ? Math.round((approvedCount / totalClaims) * 100) : 0;
        const rejectionRate = totalClaims > 0 ? Math.round((rejectedCount / totalClaims) * 100) : 0;
        const totalPoints = (scores.data ?? []).reduce((sum: number, s: { points: number }) => sum + s.points, 0);

        return successResponse(req, {
            total_users: users.count ?? 0,
            total_posts: posts.count ?? 0,
            total_claims: totalClaims,
            pending_approvals: pendingCount,
            approved_claims: approvedCount,
            rejected_claims: rejectedCount,
            approval_rate: approvalRate,
            rejection_rate: rejectionRate,
            total_points_distributed: totalPoints,
            open_flags: flags.count ?? 0,
            limit_rejections_today: limitLogs.data?.length ?? 0,
            flags: flagEntries.data ?? [],
            audit_log: auditEntries.data ?? [],
        }, 200, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' || message === 'Admin access required' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
