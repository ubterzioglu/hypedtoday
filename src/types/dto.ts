import type { TaskType, ClaimStatus, PostStatus, OwnerReviewDecision, AdminActionType, LimitReasonCode, FlagType, FlagStatus, ScoreEventType } from '@/types';

export interface PublicPostDTO {
    id: string;
    linkedin_url: string;
    title: string | null;
    description: string | null;
    requested_like: boolean;
    requested_comment: boolean;
    requested_repost: boolean;
    status: PostStatus;
    expires_at: string | null;
    created_at: string;
    owner_display_name: string | null;
    owner_avatar_url: string | null;
    approved_count: number;
    pending_count: number;
}

export interface PublicPostTaskDTO {
    id: string;
    post_id: string;
    task_type: TaskType;
    is_enabled: boolean;
    active_claims: number;
    approved_claims: number;
}

export interface PublicLeaderboardDTO {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number;
    event_count: number;
    combo_count: number;
}

export interface OwnerPendingReviewDTO {
    claim_id: string;
    post_id: string;
    task_type: TaskType;
    supporter_user_id: string;
    supporter_display_name: string | null;
    supporter_avatar_url: string | null;
    started_at: string;
    completed_at: string | null;
    supporter_note: string | null;
    comment_text: string | null;
    repost_text: string | null;
    linkedin_url: string;
    post_title: string | null;
}

export interface AdminClaimOverviewDTO {
    claim_id: string;
    post_id: string;
    task_type: TaskType;
    status: ClaimStatus;
    supporter_user_id: string;
    supporter_name: string | null;
    supporter_email: string;
    owner_user_id: string;
    owner_name: string | null;
    owner_email: string;
    linkedin_url: string;
    started_at: string;
    completed_at: string | null;
    approved_at: string | null;
    rejected_at: string | null;
    supporter_note: string | null;
    comment_text: string | null;
    repost_text: string | null;
    owner_decision_note: string | null;
}

export interface UserScoreSummaryDTO {
    user_id: string;
    total_points: number;
    likes_approved: number;
    comments_approved: number;
    reposts_approved: number;
    combo_bonuses: number;
    points_today: number;
    points_this_week: number;
}
