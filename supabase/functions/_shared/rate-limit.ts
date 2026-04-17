 import { getSupabaseServiceClient } from './supabase.ts';

interface RateLimitWindow {
    window_seconds: number;
    max_requests: number;
}

const DEFAULT_WINDOWS: Record<string, RateLimitWindow[]> = {
    default: [
        { window_seconds: 60, max_requests: 30 },
        { window_seconds: 3600, max_requests: 100 },
    ],
    create_post: [
        { window_seconds: 60, max_requests: 3 },
        { window_seconds: 3600, max_requests: 10 },
    ],
    claim_task: [
        { window_seconds: 60, max_requests: 10 },
        { window_seconds: 3600, max_requests: 30 },
    ],
    complete_claim: [
        { window_seconds: 60, max_requests: 10 },
        { window_seconds: 3600, max_requests: 30 },
    ],
    review_claim: [
        { window_seconds: 60, max_requests: 15 },
        { window_seconds: 3600, max_requests: 50 },
    ],
    admin: [
        { window_seconds: 60, max_requests: 60 },
        { window_seconds: 3600, max_requests: 200 },
    ],
    submit_report: [
        { window_seconds: 3600, max_requests: 5 },
        { window_seconds: 86400, max_requests: 15 },
    ],
};

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset_at: string;
    retry_after_seconds: number;
}

export async function checkRateLimit(
    identifier: string,
    endpoint: string,
): Promise<RateLimitResult> {
    const windows = DEFAULT_WINDOWS[endpoint] ?? DEFAULT_WINDOWS.default;
    const supabase = getSupabaseServiceClient();
    const now = new Date();

    for (const window of windows) {
        const windowStart = new Date(now.getTime() - window.window_seconds * 1000);

        const { count, error } = await supabase
            .from('rate_limits')
            .select('*', { count: 'exact', head: true })
            .eq('identifier', identifier)
            .eq('endpoint', endpoint)
            .gte('created_at', windowStart.toISOString());

        if (error) continue;

        if ((count ?? 0) >= window.max_requests) {
            return {
                allowed: false,
                remaining: 0,
                reset_at: new Date(now.getTime() + window.window_seconds * 1000).toISOString(),
                retry_after_seconds: window.window_seconds,
            };
        }
    }

    await supabase.from('rate_limits').insert({
        identifier,
        endpoint,
        created_at: now.toISOString(),
    });

    const tightestWindow = windows[windows.length - 1];
    const windowStart = new Date(now.getTime() - tightestWindow.window_seconds * 1000);
    const { count: currentCount } = await supabase
        .from('rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('created_at', windowStart.toISOString());

    return {
        allowed: true,
        remaining: Math.max(0, tightestWindow.max_requests - (currentCount ?? 0) - 1),
        reset_at: new Date(now.getTime() + tightestWindow.window_seconds * 1000).toISOString(),
        retry_after_seconds: 0,
    };
}

export async function getRateLimitIdentifier(req: Request, userId?: string): Promise<string> {
    if (userId) return `user:${userId}`;
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
    return `ip:${ip}`;
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': result.reset_at,
        ...(result.retry_after_seconds > 0 ? { 'Retry-After': String(result.retry_after_seconds) } : {}),
    };
}
