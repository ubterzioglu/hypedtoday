/**
 * Track 18 Steps 210, 218: Unit tests for request-limit evaluation logic
 * Tests the frontend display logic for request limits (pure functions).
 */

interface RequestLimits {
    allowed: boolean;
    remaining?: {
        daily: number;
        weekly: number;
        active_posts: number;
        pending_reviews: number;
    };
    reason?: string;
    message?: string;
}

function isRequestAllowed(limits: RequestLimits): boolean {
    return limits.allowed;
}

function getBlockingReason(limits: RequestLimits): string | undefined {
    if (limits.allowed) return undefined;
    return limits.reason;
}

function hasCapacityRemaining(limits: RequestLimits): boolean {
    if (!limits.remaining) return false;
    return (
        limits.remaining.daily > 0 &&
        limits.remaining.weekly > 0 &&
        limits.remaining.active_posts > 0
    );
}

function getLeastCapacity(limits: RequestLimits): number {
    if (!limits.remaining) return 0;
    const { daily, weekly, active_posts } = limits.remaining;
    return Math.min(daily, weekly, active_posts);
}

describe('Request limit evaluation', () => {
    it('allows request when all limits have remaining capacity', () => {
        const limits: RequestLimits = {
            allowed: true,
            remaining: { daily: 3, weekly: 10, active_posts: 2, pending_reviews: 0 },
        };
        expect(isRequestAllowed(limits)).toBe(true);
        expect(hasCapacityRemaining(limits)).toBe(true);
        expect(getBlockingReason(limits)).toBeUndefined();
    });

    it('blocks request when daily limit is reached', () => {
        const limits: RequestLimits = {
            allowed: false,
            reason: 'daily_limit_reached',
            message: 'You have reached your daily limit.',
            remaining: { daily: 0, weekly: 5, active_posts: 2, pending_reviews: 1 },
        };
        expect(isRequestAllowed(limits)).toBe(false);
        expect(getBlockingReason(limits)).toBe('daily_limit_reached');
    });

    it('blocks request when request_banned', () => {
        const limits: RequestLimits = {
            allowed: false,
            reason: 'request_banned',
            message: 'Your account has been banned from creating requests.',
        };
        expect(isRequestAllowed(limits)).toBe(false);
        expect(getBlockingReason(limits)).toBe('request_banned');
        expect(hasCapacityRemaining(limits)).toBe(false);
    });

    it('blocks request when cooldown is active', () => {
        const limits: RequestLimits = {
            allowed: false,
            reason: 'cooldown_active',
            message: 'Please wait before creating another request.',
        };
        expect(isRequestAllowed(limits)).toBe(false);
        expect(getBlockingReason(limits)).toBe('cooldown_active');
    });

    it('returns least capacity across all dimensions', () => {
        const limits: RequestLimits = {
            allowed: true,
            remaining: { daily: 2, weekly: 8, active_posts: 5, pending_reviews: 0 },
        };
        expect(getLeastCapacity(limits)).toBe(2);
    });

    it('blocks when active post limit reached even with daily capacity', () => {
        const limits: RequestLimits = {
            allowed: false,
            reason: 'active_post_limit_reached',
            remaining: { daily: 3, weekly: 10, active_posts: 0, pending_reviews: 2 },
        };
        expect(hasCapacityRemaining(limits)).toBe(false);
        expect(getLeastCapacity(limits)).toBe(0);
    });
});
