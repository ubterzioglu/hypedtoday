export type Country = 'TR' | 'OTHER';

export interface Project {
    id: string;
    name: string;
    country: Country;
    image_url?: string | null;
    project_url?: string | null;
    motto?: string | null;
    description?: string | null;
    linkedin_url?: string | null;
    is_anonymous: boolean;
    contact_email?: string | null;
    created_at: string;
}

export interface Comment {
    id: string;
    project_id: string;
    content: string;
    created_at: string;
}

export interface ProjectFormData {
    name: string;
    country: Country;
    image_url?: string | null;
    imageFile?: File;
    project_url?: string;
    motto?: string;
    description?: string;
    linkedin_url?: string;
    is_anonymous: boolean;
    contact_email: string;
}

export type PostStatus = 'active' | 'paused' | 'archived' | 'hidden_by_admin' | 'deleted';

export interface LinkedInPost {
    id: string;
    owner_user_id: string;
    linkedin_url: string;
    linkedin_post_urn: string | null;
    title: string | null;
    description: string | null;
    requested_like: boolean;
    requested_comment: boolean;
    requested_repost: boolean;
    status: PostStatus;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export type TaskType = 'like' | 'comment' | 'repost';

export interface PostTask {
    id: string;
    post_id: string;
    task_type: TaskType;
    is_enabled: boolean;
    base_points: number;
    created_at: string;
}

export type ClaimStatus = 'claimed' | 'completed' | 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface TaskClaim {
    id: string;
    post_id: string;
    task_type: TaskType;
    supporter_user_id: string;
    owner_user_id: string;
    status: ClaimStatus;
    started_at: string;
    completed_at: string | null;
    approved_at: string | null;
    rejected_at: string | null;
    owner_decision_by: string | null;
    owner_decision_note: string | null;
    supporter_note: string | null;
    comment_text: string | null;
    repost_text: string | null;
    proof_screenshot_url: string | null;
    created_at: string;
    updated_at: string;
}

export type ScoreEventType = 'like_approved' | 'comment_approved' | 'repost_approved' | 'combo_bonus' | 'admin_adjustment_plus' | 'admin_adjustment_minus' | 'combo_reversal';

export interface ScoreEvent {
    id: string;
    user_id: string;
    event_type: ScoreEventType;
    points: number;
    post_id: string | null;
    task_claim_id: string | null;
    metadata_json: Record<string, unknown>;
    created_at: string;
}

export type OwnerReviewDecision = 'approved' | 'rejected';

export interface PostOwnerReview {
    id: string;
    task_claim_id: string;
    owner_user_id: string;
    decision: OwnerReviewDecision;
    note: string | null;
    created_at: string;
}

export type AdminActionType =
    | 'user_suspended' | 'user_unsuspended'
    | 'post_hidden' | 'post_archived' | 'post_paused' | 'post_deleted'
    | 'claim_override_approved' | 'claim_override_rejected' | 'claim_cancelled' | 'claim_expired'
    | 'score_adjusted_plus' | 'score_adjusted_minus'
    | 'request_limit_changed' | 'request_ban_set' | 'request_ban_removed'
    | 'global_setting_changed';

export interface AdminAction {
    id: string;
    admin_user_id: string;
    action_type: AdminActionType;
    target_user_id: string | null;
    target_post_id: string | null;
    target_claim_id: string | null;
    payload_json: Record<string, unknown>;
    note: string | null;
    created_at: string;
}

export interface SystemSetting {
    key: string;
    value: string;
    updated_by: string | null;
    updated_at: string;
}

export type LimitReasonCode =
    | 'daily_limit_reached' | 'weekly_limit_reached'
    | 'active_post_limit_reached' | 'pending_review_over_limit'
    | 'cooldown_active' | 'request_banned';

export interface RequestLimitLog {
    id: string;
    user_id: string;
    attempted_at: string;
    reason_code: LimitReasonCode;
    reason_text: string;
    snapshot_json: Record<string, unknown>;
}

export type FlagType = 'fast_complete' | 'high_rejection' | 'mutual_support' | 'owner_mass_approval' | 'request_limit_abuse' | 'suspicious_pattern';
export type FlagStatus = 'open' | 'reviewed' | 'ignored' | 'actioned';

export interface AdminFlag {
    id: string;
    flag_type: FlagType;
    user_id: string | null;
    post_id: string | null;
    task_claim_id: string | null;
    reason: string;
    status: FlagStatus;
    created_at: string;
    updated_at: string;
}

export type UserRole = 'user' | 'admin';

export interface Profile {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    request_banned: boolean;
    request_limit_overrides: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface PublicPost {
    id: string;
    linkedin_url: string;
    title: string | null;
    description: string | null;
    requested_like: boolean;
    requested_comment: boolean;
    requested_repost: boolean;
    status: string;
    expires_at: string | null;
    created_at: string;
    owner_display_name: string | null;
    owner_avatar_url: string | null;
    approved_count: number;
    pending_count: number;
}

export interface PostComment {
    id: string;
    supporter_display_name: string | null;
    comment_text: string;
    approved_at: string;
}

export interface LinkedinProfile {
    id: string;
    first_name: string;
    last_name: string;
    whatsapp_number: string | null;
    linkedin_url: string;
    created_at: string;
}

export interface LinkedinProfileFormData {
    first_name: string;
    last_name: string;
    whatsapp_number: string;
    linkedin_url: string;
}

export interface LeaderboardEntry {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number;
    event_count: number;
    combo_count: number;
}

export interface CreatePostRequest {
    linkedin_url: string;
    title?: string;
    description?: string;
    requested_like: boolean;
    requested_comment: boolean;
    requested_repost: boolean;
}

export interface CreateClaimRequest {
    post_id: string;
    task_type: TaskType;
}

export interface CompleteClaimRequest {
    supporter_note?: string;
    comment_text?: string;
    repost_text?: string;
    proof_screenshot_url?: string;
}

export interface OwnerReviewRequest {
    decision: OwnerReviewDecision;
    note?: string;
}

export interface RequestLimitCheckResult {
    allowed: boolean;
    reason?: LimitReasonCode;
    message?: string;
    remaining?: {
        daily: number;
        weekly: number;
        active_posts: number;
        pending_reviews: number;
    };
}
