/**
 * Track 18 Step 211: Unit tests for combo bonus detection logic.
 * Tests the frontend-side combo eligibility check (mirrors backend logic).
 */

type TaskType = 'like' | 'comment' | 'repost';

interface ApprovedClaim {
    post_id: string;
    supporter_user_id: string;
    task_type: TaskType;
}

/**
 * Checks if a supporter has completed all three task types for a given post
 * — the condition that qualifies for a combo bonus.
 */
function isComboEligible(
    claims: ApprovedClaim[],
    supporterUserId: string,
    postId: string
): boolean {
    const userPostClaims = claims.filter(
        c => c.supporter_user_id === supporterUserId && c.post_id === postId
    );
    const types = new Set(userPostClaims.map(c => c.task_type));
    return types.has('like') && types.has('comment') && types.has('repost');
}

function countCombosForUser(claims: ApprovedClaim[], userId: string): number {
    const postIds = [...new Set(claims.filter(c => c.supporter_user_id === userId).map(c => c.post_id))];
    return postIds.filter(postId => isComboEligible(claims, userId, postId)).length;
}

describe('Combo bonus detection', () => {
    const POST_A = 'post-a';
    const POST_B = 'post-b';
    const USER_1 = 'user-1';
    const USER_2 = 'user-2';

    it('detects combo when all three task types approved for same post', () => {
        const claims: ApprovedClaim[] = [
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'comment' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'repost' },
        ];
        expect(isComboEligible(claims, USER_1, POST_A)).toBe(true);
    });

    it('no combo when only two task types approved', () => {
        const claims: ApprovedClaim[] = [
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'comment' },
        ];
        expect(isComboEligible(claims, USER_1, POST_A)).toBe(false);
    });

    it('no combo when tasks belong to different posts', () => {
        const claims: ApprovedClaim[] = [
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'comment' },
            { post_id: POST_B, supporter_user_id: USER_1, task_type: 'repost' },
        ];
        expect(isComboEligible(claims, USER_1, POST_A)).toBe(false);
        expect(isComboEligible(claims, USER_1, POST_B)).toBe(false);
    });

    it('no combo for different user even if that post has all three', () => {
        const claims: ApprovedClaim[] = [
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'comment' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'repost' },
            { post_id: POST_A, supporter_user_id: USER_2, task_type: 'like' },
        ];
        expect(isComboEligible(claims, USER_2, POST_A)).toBe(false);
    });

    it('counts multiple combos for a user across posts', () => {
        const claims: ApprovedClaim[] = [
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'comment' },
            { post_id: POST_A, supporter_user_id: USER_1, task_type: 'repost' },
            { post_id: POST_B, supporter_user_id: USER_1, task_type: 'like' },
            { post_id: POST_B, supporter_user_id: USER_1, task_type: 'comment' },
            { post_id: POST_B, supporter_user_id: USER_1, task_type: 'repost' },
        ];
        expect(countCombosForUser(claims, USER_1)).toBe(2);
    });

    it('empty claims produce no combos', () => {
        expect(isComboEligible([], USER_1, POST_A)).toBe(false);
        expect(countCombosForUser([], USER_1)).toBe(0);
    });
});
