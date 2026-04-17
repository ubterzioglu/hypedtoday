-- ============================================================
-- Track 3: Core Domain Remodel
-- Creates the LinkedIn support workflow domain model
-- ============================================================

-- Custom enum-like types via CHECK constraints

-- ============================================================
-- 8.2 linkedin_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS linkedin_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    linkedin_url TEXT NOT NULL,
    linkedin_post_urn TEXT,
    title TEXT,
    description TEXT,
    requested_like BOOLEAN NOT NULL DEFAULT false,
    requested_comment BOOLEAN NOT NULL DEFAULT false,
    requested_repost BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'hidden_by_admin', 'deleted')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active posts" ON linkedin_posts
    FOR SELECT TO authenticated
    USING (status IN ('active', 'paused'));

CREATE POLICY "Admins can view all posts" ON linkedin_posts
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Owners can view own posts" ON linkedin_posts
    FOR SELECT TO authenticated
    USING (owner_user_id = auth.uid());

-- ============================================================
-- 8.3 post_tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS post_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES linkedin_posts(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('like', 'comment', 'repost')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    base_points INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, task_type)
);

ALTER TABLE post_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks for visible posts" ON post_tasks
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM linkedin_posts
            WHERE id = post_id
            AND (status IN ('active', 'paused') OR owner_user_id = auth.uid()
                 OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- ============================================================
-- 8.4 task_claims
-- ============================================================
CREATE TABLE IF NOT EXISTS task_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES linkedin_posts(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('like', 'comment', 'repost')),
    supporter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'completed', 'pending_review', 'approved', 'rejected', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    owner_decision_by UUID REFERENCES profiles(id),
    owner_decision_note TEXT,
    supporter_note TEXT,
    comment_text TEXT,
    repost_text TEXT,
    proof_screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE task_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can view own claims" ON task_claims
    FOR SELECT TO authenticated
    USING (supporter_user_id = auth.uid());

CREATE POLICY "Owners can view claims on own posts" ON task_claims
    FOR SELECT TO authenticated
    USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can view all claims" ON task_claims
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Prevent duplicate active claims: one user, one post, one task type, not in terminal state
CREATE UNIQUE INDEX idx_task_claims_active_unique
    ON task_claims (post_id, task_type, supporter_user_id)
    WHERE status NOT IN ('cancelled', 'expired');

-- ============================================================
-- 8.5 score_events
-- ============================================================
CREATE TABLE IF NOT EXISTS score_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('like_approved', 'comment_approved', 'repost_approved', 'combo_bonus', 'admin_adjustment_plus', 'admin_adjustment_minus', 'combo_reversal')),
    points INTEGER NOT NULL,
    post_id UUID REFERENCES linkedin_posts(id) ON DELETE SET NULL,
    task_claim_id UUID REFERENCES task_claims(id) ON DELETE SET NULL,
    metadata_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own score events" ON score_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all score events" ON score_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 8.6 post_owner_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS post_owner_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_claim_id UUID NOT NULL REFERENCES task_claims(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE post_owner_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own reviews" ON post_owner_reviews
    FOR SELECT TO authenticated
    USING (owner_user_id = auth.uid());

CREATE POLICY "Supporters can view reviews on own claims" ON post_owner_reviews
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM task_claims WHERE id = task_claim_id AND supporter_user_id = auth.uid())
    );

CREATE POLICY "Admins can view all reviews" ON post_owner_reviews
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 8.7 admin_actions
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'user_suspended', 'user_unsuspended',
        'post_hidden', 'post_archived', 'post_paused', 'post_deleted',
        'claim_override_approved', 'claim_override_rejected', 'claim_cancelled', 'claim_expired',
        'score_adjusted_plus', 'score_adjusted_minus',
        'request_limit_changed', 'request_ban_set', 'request_ban_removed',
        'global_setting_changed'
    )),
    target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_post_id UUID REFERENCES linkedin_posts(id) ON DELETE SET NULL,
    target_claim_id UUID REFERENCES task_claims(id) ON DELETE SET NULL,
    payload_json JSONB DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin actions" ON admin_actions
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- 8.8 system_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings" ON system_settings
    FOR SELECT USING (true);

-- Seed default settings
INSERT INTO system_settings (key, value) VALUES
    ('points_like', '10'),
    ('points_comment', '15'),
    ('points_repost', '10'),
    ('points_combo_all_three', '50'),
    ('daily_post_limit', '2'),
    ('weekly_post_limit', '7'),
    ('active_post_limit', '3'),
    ('pending_review_limit_per_owner', '10'),
    ('request_cooldown_minutes', '120'),
    ('max_active_claims_per_user', '5'),
    ('fast_complete_seconds', '30'),
    ('min_comment_length', '10')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 8.9 request_limit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS request_limit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reason_code TEXT NOT NULL CHECK (reason_code IN (
        'daily_limit_reached', 'weekly_limit_reached',
        'active_post_limit_reached', 'pending_review_over_limit',
        'cooldown_active', 'request_banned'
    )),
    reason_text TEXT NOT NULL,
    snapshot_json JSONB DEFAULT '{}'
);

ALTER TABLE request_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view request limit logs" ON request_limit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can view own request limit logs" ON request_limit_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- 8.10 admin_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_type TEXT NOT NULL CHECK (flag_type IN (
        'fast_complete', 'high_rejection', 'mutual_support',
        'owner_mass_approval', 'request_limit_abuse', 'suspicious_pattern'
    )),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    post_id UUID REFERENCES linkedin_posts(id) ON DELETE SET NULL,
    task_claim_id UUID REFERENCES task_claims(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'ignored', 'actioned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE admin_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all flags" ON admin_flags
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- Indexes for performance
-- ============================================================

-- Owner active post lookups
CREATE INDEX idx_linkedin_posts_owner_active ON linkedin_posts(owner_user_id, status)
    WHERE status = 'active';

-- Owner active post count
CREATE INDEX idx_linkedin_posts_owner_created ON linkedin_posts(owner_user_id, created_at DESC);

-- Daily request count per owner (non-partial, covers date range queries)
CREATE INDEX idx_linkedin_posts_owner_daily ON linkedin_posts(owner_user_id, created_at);

-- Weekly request count per owner (covered by same index above)


-- Pending review claims by owner
CREATE INDEX idx_task_claims_owner_pending ON task_claims(owner_user_id, status)
    WHERE status IN ('pending_review');

-- Active claims per supporter
CREATE INDEX idx_task_claims_supporter_active ON task_claims(supporter_user_id, status)
    WHERE status IN ('claimed', 'completed', 'pending_review');

-- Score events per user
CREATE INDEX idx_score_events_user ON score_events(user_id, created_at DESC);

-- Score events per post
CREATE INDEX idx_score_events_post ON score_events(post_id);

-- Admin actions by admin
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_user_id, created_at DESC);

-- Admin actions by target user
CREATE INDEX idx_admin_actions_target_user ON admin_actions(target_user_id, created_at DESC)
    WHERE target_user_id IS NOT NULL;

-- Request limit logs per user
CREATE INDEX idx_request_limit_logs_user ON request_limit_logs(user_id, attempted_at DESC);

-- Flags by status
CREATE INDEX idx_admin_flags_status ON admin_flags(status)
    WHERE status = 'open';
