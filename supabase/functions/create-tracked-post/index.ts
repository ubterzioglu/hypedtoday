import { requireAuth } from '../_shared/auth.ts';
import { handleCors, originCheck } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { collectErrors, validateMaxLength, validateRequired, validateUrl } from '../_shared/validation.ts';

const LINKEDIN_FEED_UPDATE_TYPES = new Set(['activity', 'share']);

function isLinkedInPostUrl(value: string): boolean {
    try {
        const url = new URL(value.trim());
        const hostname = url.hostname.toLowerCase();
        const pathname = url.pathname;

        if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
        if (hostname !== 'linkedin.com' && hostname !== 'www.linkedin.com') return false;

        if (pathname.startsWith('/posts/') && pathname.length > '/posts/'.length) {
            return true;
        }

        if (!pathname.startsWith('/feed/update/urn:li:')) {
            return false;
        }

        const urnParts = pathname.slice('/feed/update/urn:li:'.length).split(':');
        return LINKEDIN_FEED_UPDATE_TYPES.has(urnParts[0]) && Boolean(urnParts[1]);
    } catch {
        return false;
    }
}

function startOfUtcDay(date = new Date()): string {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    return start.toISOString();
}

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);
        if (req.method !== 'POST') return errorResponse(req, 'Method not allowed', 405);

        const auth = await requireAuth(req);
        const body = await req.json();
        const linkedinUrl = String(body.linkedin_url ?? '').trim();
        const publishedAt = String(body.published_at ?? '').trim();
        const note = typeof body.note === 'string' ? body.note.trim() : '';

        const validationError = collectErrors(
            validateRequired(linkedinUrl, 'linkedin_url'),
            validateRequired(publishedAt, 'published_at'),
            validateUrl(linkedinUrl, 'linkedin_url'),
            validateMaxLength(note, 'note', 1000),
        );
        if (validationError) return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        if (!isLinkedInPostUrl(linkedinUrl)) {
            return errorResponse(req, 'Invalid LinkedIn post URL. Use a LinkedIn post URL, not a profile URL.', 400, 'INVALID_URL');
        }

        const publishedDate = new Date(publishedAt);
        if (Number.isNaN(publishedDate.getTime())) {
            return errorResponse(req, 'published_at must be a valid datetime', 400, 'INVALID_PUBLISHED_AT');
        }

        const supabase = getSupabaseServiceClient();

        const { data: creatorProfile } = await supabase
            .from('linkedin_profiles')
            .select('id')
            .eq('submitted_by', auth.userId)
            .eq('approval_status', 'approved')
            .maybeSingle();

        if (!creatorProfile) {
            return errorResponse(req, 'Only approved LinkedIn members can create tracked posts.', 403, 'NOT_APPROVED');
        }

        const { count: createdTodayCount, error: countError } = await supabase
            .from('linkedin_posts')
            .select('id', { count: 'exact', head: true })
            .eq('owner_user_id', auth.userId)
            .not('published_at', 'is', null)
            .gte('created_at', startOfUtcDay());

        if (countError) {
            return errorResponse(req, countError.message, 500);
        }

        if ((createdTodayCount ?? 0) >= 1) {
            return errorResponse(req, 'You can only create one new tracked post per day.', 429, 'DAILY_LIMIT_REACHED');
        }

        const { data: post, error: postError } = await supabase
            .from('linkedin_posts')
            .insert({
                owner_user_id: auth.userId,
                linkedin_url: linkedinUrl,
                published_at: publishedDate.toISOString(),
                note: note || null,
                status: 'open',
            })
            .select('id, owner_user_id, linkedin_url, published_at, note, status, created_at')
            .single();

        if (postError || !post) {
            return errorResponse(req, 'Failed to create tracked post: ' + (postError?.message ?? 'Unknown error'), 500);
        }

        const { data: approvedMembers, error: membersError } = await supabase
            .from('linkedin_profiles')
            .select('submitted_by')
            .eq('approval_status', 'approved')
            .not('submitted_by', 'is', null);

        if (membersError) {
            return errorResponse(req, membersError.message, 500);
        }

        const trackingRows = (approvedMembers ?? [])
            .map((member) => String(member.submitted_by))
            .filter((memberUserId) => memberUserId !== auth.userId)
            .map((memberUserId) => ({
                post_id: String(post.id),
                member_user_id: memberUserId,
                status: 'pending',
            }));

        if (trackingRows.length > 0) {
            const { error: trackingError } = await supabase
                .from('post_like_tracking')
                .insert(trackingRows);

            if (trackingError) {
                await supabase.from('linkedin_posts').delete().eq('id', post.id);
                return errorResponse(req, 'Failed to create tracking rows: ' + trackingError.message, 500);
            }
        }

        return successResponse(req, { post }, 201);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
