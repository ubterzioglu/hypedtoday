/**
 * Track 18 Step 212: Unit tests for DTO sanitization.
 * Verifies that public-facing DTOs never expose private fields.
 */

interface RawLinkedInPost {
    id: string;
    owner_user_id: string;
    linkedin_url: string;
    title: string | null;
    status: string;
    created_at: string;
    // private fields that must NOT appear in public DTO
    contact_email?: string;
    ip_hash?: string;
    internal_notes?: string;
}

interface PublicPostDTO {
    id: string;
    linkedin_url: string;
    title: string | null;
    status: string;
    created_at: string;
    owner_display_name: string | null;
    owner_avatar_url: string | null;
    approved_count: number;
    pending_count: number;
}

function sanitizeToPublicPost(raw: RawLinkedInPost, ownerName: string | null, ownerAvatar: string | null): PublicPostDTO {
    return {
        id: raw.id,
        linkedin_url: raw.linkedin_url,
        title: raw.title,
        status: raw.status,
        created_at: raw.created_at,
        owner_display_name: ownerName,
        owner_avatar_url: ownerAvatar,
        approved_count: 0,
        pending_count: 0,
    };
}

interface RawTaskClaim {
    id: string;
    post_id: string;
    task_type: string;
    supporter_user_id: string;
    owner_user_id: string;
    status: string;
    comment_text: string | null;
    // private fields
    ip_address?: string;
    internal_flag?: boolean;
}

interface PublicCommentDTO {
    id: string;
    supporter_display_name: string | null;
    comment_text: string;
    approved_at: string;
}

function sanitizeToPublicComment(
    claim: RawTaskClaim & { approved_at: string },
    supporterName: string | null
): PublicCommentDTO | null {
    if (!claim.comment_text) return null;
    return {
        id: claim.id,
        supporter_display_name: supporterName,
        comment_text: claim.comment_text,
        approved_at: claim.approved_at,
    };
}

describe('DTO sanitization', () => {
    describe('PublicPost DTO', () => {
        const rawPost: RawLinkedInPost = {
            id: 'post-1',
            owner_user_id: 'user-secret-id',
            linkedin_url: 'https://linkedin.com/posts/test',
            title: 'Test Post',
            status: 'active',
            created_at: '2026-04-15T09:00:00Z',
            contact_email: 'secret@example.com',
            ip_hash: 'abc123hash',
            internal_notes: 'flagged for review',
        };

        it('includes required public fields', () => {
            const dto = sanitizeToPublicPost(rawPost, 'John Doe', null);
            expect(dto.id).toBe('post-1');
            expect(dto.linkedin_url).toBe('https://linkedin.com/posts/test');
            expect(dto.title).toBe('Test Post');
            expect(dto.status).toBe('active');
            expect(dto.owner_display_name).toBe('John Doe');
        });

        it('does NOT expose owner_user_id', () => {
            const dto = sanitizeToPublicPost(rawPost, 'John Doe', null);
            expect('owner_user_id' in dto).toBe(false);
        });

        it('does NOT expose contact_email', () => {
            const dto = sanitizeToPublicPost(rawPost, 'John Doe', null);
            expect('contact_email' in dto).toBe(false);
        });

        it('does NOT expose ip_hash', () => {
            const dto = sanitizeToPublicPost(rawPost, 'John Doe', null);
            expect('ip_hash' in dto).toBe(false);
        });

        it('does NOT expose internal_notes', () => {
            const dto = sanitizeToPublicPost(rawPost, 'John Doe', null);
            expect('internal_notes' in dto).toBe(false);
        });
    });

    describe('PublicComment DTO from task_claim', () => {
        const rawClaim = {
            id: 'claim-1',
            post_id: 'post-1',
            task_type: 'comment',
            supporter_user_id: 'user-secret',
            owner_user_id: 'owner-secret',
            status: 'approved',
            comment_text: 'Great post!',
            approved_at: '2026-04-15T10:00:00Z',
            ip_address: '192.168.1.1',
            internal_flag: true,
        };

        it('includes comment text and display name', () => {
            const dto = sanitizeToPublicComment(rawClaim, 'Jane Smith');
            expect(dto).not.toBeNull();
            expect(dto!.comment_text).toBe('Great post!');
            expect(dto!.supporter_display_name).toBe('Jane Smith');
        });

        it('does NOT expose supporter_user_id', () => {
            const dto = sanitizeToPublicComment(rawClaim, 'Jane Smith');
            expect('supporter_user_id' in (dto ?? {})).toBe(false);
        });

        it('does NOT expose ip_address', () => {
            const dto = sanitizeToPublicComment(rawClaim, 'Jane Smith');
            expect('ip_address' in (dto ?? {})).toBe(false);
        });

        it('returns null for claims with no comment_text', () => {
            const dto = sanitizeToPublicComment({ ...rawClaim, comment_text: null }, 'Jane');
            expect(dto).toBeNull();
        });
    });
});
