import { getSupabaseServiceClient } from './supabase.ts';

export interface LimitCheckResult {
    allowed: boolean;
    reason?: string;
    message?: string;
    remaining: {
        daily: number;
        weekly: number;
        active_posts: number;
        pending_reviews: number;
    };
}

interface SystemLimits {
    daily_post_limit: number;
    weekly_post_limit: number;
    active_post_limit: number;
    pending_review_limit_per_owner: number;
    request_cooldown_minutes: number;
}

interface UserOverrides {
    daily_post_limit?: number;
    weekly_post_limit?: number;
    active_post_limit?: number;
    pending_review_limit_per_owner?: number;
    request_cooldown_minutes?: number;
}

async function getSystemLimits(): Promise<SystemLimits> {
    const supabase = getSupabaseServiceClient();
    const { data } = await supabase.from('system_settings').select('key, value');

    const settings: Record<string, number> = {};
    for (const row of data ?? []) {
        settings[row.key] = parseInt(row.value, 10);
    }

    return {
        daily_post_limit: settings.daily_post_limit ?? 2,
        weekly_post_limit: settings.weekly_post_limit ?? 7,
        active_post_limit: settings.active_post_limit ?? 3,
        pending_review_limit_per_owner: settings.pending_review_limit_per_owner ?? 10,
        request_cooldown_minutes: settings.request_cooldown_minutes ?? 120,
    };
}

async function getUserOverrides(userId: string): Promise<UserOverrides> {
    const supabase = getSupabaseServiceClient();
    const { data } = await supabase
        .from('profiles')
        .select('request_limit_overrides, request_banned')
        .eq('id', userId)
        .single();

    if (!data) return {};
    if (data.request_banned) {
        return { _banned: true } as unknown as UserOverrides;
    }

    return (data.request_limit_overrides as UserOverrides) ?? {};
}

function getEffectiveLimit<T extends keyof SystemLimits>(
    system: SystemLimits,
    overrides: UserOverrides,
    key: T
): number {
    return (overrides[key] as number) ?? system[key];
}

export async function checkRequestLimits(userId: string): Promise<LimitCheckResult> {
    const supabase = getSupabaseServiceClient();
    const system = await getSystemLimits();
    const overrides = await getUserOverrides(userId);

    if ((overrides as Record<string, unknown>)._banned) {
        await logRejection(supabase, userId, 'request_banned', 'User is request-banned');
        return {
            allowed: false,
            reason: 'request_banned',
            message: 'Your account has been restricted from creating new requests.',
            remaining: { daily: 0, weekly: 0, active_posts: 0, pending_reviews: 0 },
        };
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    weekStart.setUTCHours(0, 0, 0, 0);

    const dailyLimit = getEffectiveLimit(system, overrides, 'daily_post_limit');
    const weeklyLimit = getEffectiveLimit(system, overrides, 'weekly_post_limit');
    const activeLimit = getEffectiveLimit(system, overrides, 'active_post_limit');
    const pendingLimit = getEffectiveLimit(system, overrides, 'pending_review_limit_per_owner');
    const cooldownMinutes = getEffectiveLimit(system, overrides, 'request_cooldown_minutes');

    const { count: dailyCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
        .gte('created_at', todayStart.toISOString());

    const { count: weeklyCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
        .gte('created_at', weekStart.toISOString());

    const { count: activeCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
        .eq('status', 'active');

    const { count: pendingReviewCount } = await supabase
        .from('task_claims')
        .select('*', { count: 'exact', head: true })
        .eq('owner_user_id', userId)
        .eq('status', 'pending_review');

    const { data: lastPost } = await supabase
        .from('linkedin_posts')
        .select('created_at')
        .eq('owner_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const remaining = {
        daily: Math.max(0, dailyLimit - (dailyCount ?? 0)),
        weekly: Math.max(0, weeklyLimit - (weeklyCount ?? 0)),
        active_posts: activeCount ?? 0,
        pending_reviews: pendingReviewCount ?? 0,
    };

    if ((dailyCount ?? 0) >= dailyLimit) {
        await logRejection(supabase, userId, 'daily_limit_reached', `Daily limit of ${dailyLimit} reached`);
        return { allowed: false, reason: 'daily_limit_reached', message: `You have reached your daily post limit (${dailyLimit}).`, remaining };
    }

    if ((weeklyCount ?? 0) >= weeklyLimit) {
        await logRejection(supabase, userId, 'weekly_limit_reached', `Weekly limit of ${weeklyLimit} reached`);
        return { allowed: false, reason: 'weekly_limit_reached', message: `You have reached your weekly post limit (${weeklyLimit}).`, remaining };
    }

    if ((activeCount ?? 0) >= activeLimit) {
        await logRejection(supabase, userId, 'active_post_limit_reached', `Active post limit of ${activeLimit} reached`);
        return { allowed: false, reason: 'active_post_limit_reached', message: `You have too many active posts (${activeLimit}). Archive some to create new ones.`, remaining };
    }

    if ((pendingReviewCount ?? 0) >= pendingLimit) {
        await logRejection(supabase, userId, 'pending_review_over_limit', `Pending review limit of ${pendingLimit} reached`);
        return { allowed: false, reason: 'pending_review_over_limit', message: `You have too many pending reviews (${pendingLimit}). Approve or reject existing claims first.`, remaining };
    }

    if (lastPost && cooldownMinutes > 0) {
        const lastPostTime = new Date(lastPost.created_at);
        const cooldownEnd = new Date(lastPostTime.getTime() + cooldownMinutes * 60 * 1000);
        if (now < cooldownEnd) {
            await logRejection(supabase, userId, 'cooldown_active', `Cooldown active until ${cooldownEnd.toISOString()}`);
            return { allowed: false, reason: 'cooldown_active', message: `Please wait before creating another post. Cooldown ends at ${cooldownEnd.toLocaleString()}.`, remaining };
        }
    }

    return { allowed: true, remaining };
}

export async function getUserLimitsSummary(userId: string) {
    const system = await getSystemLimits();
    const overrides = await getUserOverrides(userId);
    const check = await checkRequestLimits(userId);
    return {
        system,
        overrides,
        effective: {
            daily_post_limit: getEffectiveLimit(system, overrides, 'daily_post_limit'),
            weekly_post_limit: getEffectiveLimit(system, overrides, 'weekly_post_limit'),
            active_post_limit: getEffectiveLimit(system, overrides, 'active_post_limit'),
            pending_review_limit_per_owner: getEffectiveLimit(system, overrides, 'pending_review_limit_per_owner'),
            request_cooldown_minutes: getEffectiveLimit(system, overrides, 'request_cooldown_minutes'),
        },
        remaining: check.remaining,
        allowed: check.allowed,
    };
}

async function logRejection(
    supabase: ReturnType<typeof getSupabaseServiceClient>,
    userId: string,
    reasonCode: string,
    reasonText: string,
) {
    await supabase.from('request_limit_logs').insert({
        user_id: userId,
        reason_code: reasonCode,
        reason_text: reasonText,
    });
}
