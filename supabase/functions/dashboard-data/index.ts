import { requireAuth } from '../_shared/auth.ts';
import { handleCors, originCheck } from '../_shared/cors.ts';
import { errorResponse, successResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';

interface ApprovedMember {
    user_id: string;
    first_name: string;
    last_name: string;
    linkedin_url: string;
}

function displayName(member: ApprovedMember): string {
    return `${member.first_name} ${member.last_name}`.trim();
}

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);
        if (req.method !== 'GET') return errorResponse(req, 'Method not allowed', 405);

        const auth = await requireAuth(req);
        const supabase = getSupabaseServiceClient();

        const { data: approvedProfiles, error: approvedError } = await supabase
            .from('linkedin_profiles')
            .select('submitted_by, first_name, last_name, linkedin_url')
            .eq('approval_status', 'approved')
            .not('submitted_by', 'is', null)
            .order('created_at', { ascending: true });

        if (approvedError) {
            return errorResponse(req, approvedError.message, 500);
        }

        const approvedMembers: ApprovedMember[] = (approvedProfiles ?? []).map((row) => ({
            user_id: String(row.submitted_by),
            first_name: String(row.first_name ?? ''),
            last_name: String(row.last_name ?? ''),
            linkedin_url: String(row.linkedin_url ?? ''),
        }));

        const approvedMemberMap = new Map(approvedMembers.map((member) => [member.user_id, member]));

        const { data: myPosts, error: myPostsError } = await supabase
            .from('linkedin_posts')
            .select('id, owner_user_id, linkedin_url, published_at, note, status, created_at')
            .eq('owner_user_id', auth.userId)
            .not('published_at', 'is', null)
            .in('status', ['open', 'closed', 'archived'])
            .order('published_at', { ascending: false });

        if (myPostsError) {
            return errorResponse(req, myPostsError.message, 500);
        }

        const myPostIds = (myPosts ?? []).map((post) => String(post.id));

        const { data: myTrackingRows, error: myTrackingError } = myPostIds.length === 0
            ? { data: [], error: null }
            : await supabase
                .from('post_like_tracking')
                .select('id, post_id, member_user_id, status, marked_at, note, created_at')
                .in('post_id', myPostIds)
                .order('created_at', { ascending: true });

        if (myTrackingError) {
            return errorResponse(req, myTrackingError.message, 500);
        }

        const { data: myAssignments, error: myAssignmentsError } = await supabase
            .from('post_like_tracking')
            .select('id, post_id, member_user_id, status, marked_at, note, created_at')
            .eq('member_user_id', auth.userId)
            .order('created_at', { ascending: false });

        if (myAssignmentsError) {
            return errorResponse(req, myAssignmentsError.message, 500);
        }

        const assignedPostIds = [...new Set((myAssignments ?? []).map((row) => String(row.post_id)))];

        const { data: assignedPosts, error: assignedPostsError } = assignedPostIds.length === 0
            ? { data: [], error: null }
            : await supabase
                .from('linkedin_posts')
                .select('id, owner_user_id, linkedin_url, published_at, note, status, created_at')
                .in('id', assignedPostIds);

        if (assignedPostsError) {
            return errorResponse(req, assignedPostsError.message, 500);
        }

        const assignedPostMap = new Map((assignedPosts ?? []).map((post) => [String(post.id), post]));
        const ownerIds = [...new Set((assignedPosts ?? []).map((post) => String(post.owner_user_id)))];
        const missingOwnerIds = ownerIds.filter((id) => !approvedMemberMap.has(id));

        if (missingOwnerIds.length > 0) {
            const { data: ownerProfiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, linkedin_url, display_name')
                .in('id', missingOwnerIds);

            for (const profile of ownerProfiles ?? []) {
                approvedMemberMap.set(String(profile.id), {
                    user_id: String(profile.id),
                    first_name: String(profile.first_name ?? profile.display_name ?? ''),
                    last_name: String(profile.last_name ?? ''),
                    linkedin_url: String(profile.linkedin_url ?? ''),
                });
            }
        }

        const trackingByPostId = new Map<string, Array<Record<string, unknown>>>();
        for (const row of myTrackingRows ?? []) {
            const key = String(row.post_id);
            const current = trackingByPostId.get(key) ?? [];
            current.push(row);
            trackingByPostId.set(key, current);
        }

        const normalizedMyPosts = (myPosts ?? []).map((post) => {
            const trackings = (trackingByPostId.get(String(post.id)) ?? []).map((row) => {
                const member = approvedMemberMap.get(String(row.member_user_id));
                return {
                    tracking_id: String(row.id),
                    member_user_id: String(row.member_user_id),
                    member_name: member ? displayName(member) : 'Unknown member',
                    member_linkedin_url: member?.linkedin_url ?? null,
                    status: String(row.status),
                    marked_at: row.marked_at as string | null,
                    note: row.note as string | null,
                };
            });

            return {
                id: String(post.id),
                owner_user_id: String(post.owner_user_id),
                linkedin_url: String(post.linkedin_url),
                published_at: String(post.published_at),
                note: (post.note as string | null) ?? null,
                status: String(post.status),
                created_at: String(post.created_at),
                tracking: trackings,
                counts: {
                    pending: trackings.filter((row) => row.status === 'pending').length,
                    liked: trackings.filter((row) => row.status === 'liked').length,
                    not_yet: trackings.filter((row) => row.status === 'not_yet').length,
                    skipped: trackings.filter((row) => row.status === 'skipped').length,
                },
            };
        });

        const myTasks = (myAssignments ?? [])
            .map((row) => {
                const post = assignedPostMap.get(String(row.post_id));
                if (!post || String(post.owner_user_id) === auth.userId || String(post.status) !== 'open') {
                    return null;
                }

                const owner = approvedMemberMap.get(String(post.owner_user_id));
                return {
                    tracking_id: String(row.id),
                    post_id: String(row.post_id),
                    status: String(row.status),
                    marked_at: row.marked_at as string | null,
                    note: row.note as string | null,
                    linkedin_url: String(post.linkedin_url),
                    published_at: String(post.published_at),
                    post_note: (post.note as string | null) ?? null,
                    owner_user_id: String(post.owner_user_id),
                    owner_name: owner ? displayName(owner) : 'Unknown owner',
                    owner_linkedin_url: owner?.linkedin_url ?? null,
                    created_at: String(post.created_at),
                };
            })
            .filter((row) => row !== null);

        const payload = {
            summary: {
                open_posts: normalizedMyPosts.filter((post) => post.status === 'open').length,
                my_pending_actions: myTasks.filter((task) => task.status === 'pending' || task.status === 'not_yet').length,
                my_posts_liked: normalizedMyPosts.reduce((sum, post) => sum + post.counts.liked, 0),
                approved_members: approvedMembers.length,
            },
            my_posts: normalizedMyPosts,
            my_tasks: myTasks,
        };

        return successResponse(req, payload);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const status = message === 'Unauthorized' ? 401 : message === 'Account suspended' ? 403 : 500;
        return errorResponse(req, message, status);
    }
});
