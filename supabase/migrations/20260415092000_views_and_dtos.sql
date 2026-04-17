-- ============================================================
-- Track 4: Public/Private Data Separation
-- Read-only views that expose only safe DTOs
-- ============================================================

-- ============================================================
-- 40-41: Public DTOs for posts (no owner identity leaked)
-- ============================================================
CREATE OR REPLACE VIEW public_posts AS
SELECT
    lp.id,
    lp.linkedin_url,
    lp.title,
    lp.description,
    lp.requested_like,
    lp.requested_comment,
    lp.requested_repost,
    lp.status,
    lp.expires_at,
    lp.created_at,
    p.display_name AS owner_display_name,
    p.avatar_url AS owner_avatar_url,
    (SELECT COUNT(*) FROM task_claims tc WHERE tc.post_id = lp.id AND tc.status = 'approved') AS approved_count,
    (SELECT COUNT(*) FROM task_claims tc WHERE tc.post_id = lp.id AND tc.status IN ('claimed', 'completed', 'pending_review')) AS pending_count
FROM linkedin_posts lp
JOIN profiles p ON p.id = lp.owner_user_id
WHERE lp.status = 'active';

-- ============================================================
-- 42: Public leaderboard from score_events (not votes)
-- ============================================================
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(se.points), 0) AS total_points,
    COUNT(se.id) AS event_count,
    COUNT(se.id) FILTER (WHERE se.event_type = 'combo_bonus') AS combo_count
FROM profiles p
LEFT JOIN score_events se ON se.user_id = p.id
GROUP BY p.id, p.display_name, p.avatar_url
ORDER BY total_points DESC;

-- ============================================================
-- 43: Owner-view DTO for pending reviews
-- Shows claims awaiting owner decision
-- ============================================================
CREATE OR REPLACE VIEW owner_pending_reviews AS
SELECT
    tc.id AS claim_id,
    tc.post_id,
    tc.task_type,
    tc.supporter_user_id,
    sp.display_name AS supporter_display_name,
    sp.avatar_url AS supporter_avatar_url,
    tc.started_at,
    tc.completed_at,
    tc.supporter_note,
    tc.comment_text,
    tc.repost_text,
    lp.linkedin_url,
    lp.title AS post_title
FROM task_claims tc
JOIN profiles sp ON sp.id = tc.supporter_user_id
JOIN linkedin_posts lp ON lp.id = tc.post_id
WHERE tc.status = 'pending_review'
  AND tc.owner_user_id = auth.uid();

-- ============================================================
-- 44: Admin-view DTO for moderation
-- Exposes full detail for admin screens
-- ============================================================
CREATE OR REPLACE VIEW admin_claims_overview AS
SELECT
    tc.id AS claim_id,
    tc.post_id,
    tc.task_type,
    tc.status,
    tc.supporter_user_id,
    sp.display_name AS supporter_name,
    sp.email AS supporter_email,
    tc.owner_user_id,
    op.display_name AS owner_name,
    op.email AS owner_email,
    lp.linkedin_url,
    tc.started_at,
    tc.completed_at,
    tc.approved_at,
    tc.rejected_at,
    tc.supporter_note,
    tc.comment_text,
    tc.repost_text,
    tc.owner_decision_note
FROM task_claims tc
JOIN profiles sp ON sp.id = tc.supporter_user_id
JOIN profiles op ON op.id = tc.owner_user_id
JOIN linkedin_posts lp ON lp.id = tc.post_id
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');

-- ============================================================
-- 46: Public post tasks view
-- ============================================================
CREATE OR REPLACE VIEW public_post_tasks AS
SELECT
    pt.id,
    pt.post_id,
    pt.task_type,
    pt.is_enabled,
    (SELECT COUNT(*) FROM task_claims tc WHERE tc.post_id = pt.post_id AND tc.task_type = pt.task_type AND tc.status IN ('claimed', 'completed', 'pending_review')) AS active_claims,
    (SELECT COUNT(*) FROM task_claims tc WHERE tc.post_id = pt.post_id AND tc.task_type = pt.task_type AND tc.status = 'approved') AS approved_claims
FROM post_tasks pt
WHERE pt.is_enabled = true
  AND EXISTS (
    SELECT 1 FROM linkedin_posts lp WHERE lp.id = pt.post_id AND lp.status = 'active'
  );

-- ============================================================
-- 47: User score summary view
-- ============================================================
CREATE OR REPLACE VIEW user_score_summary AS
SELECT
    se.user_id,
    COALESCE(SUM(se.points), 0) AS total_points,
    COUNT(se.id) FILTER (WHERE se.event_type = 'like_approved') AS likes_approved,
    COUNT(se.id) FILTER (WHERE se.event_type = 'comment_approved') AS comments_approved,
    COUNT(se.id) FILTER (WHERE se.event_type = 'repost_approved') AS reposts_approved,
    COUNT(se.id) FILTER (WHERE se.event_type = 'combo_bonus') AS combo_bonuses,
    SUM(se.points) FILTER (WHERE se.created_at >= date_trunc('day', timezone('utc'::text, now()))) AS points_today,
    SUM(se.points) FILTER (WHERE se.created_at >= date_trunc('week', timezone('utc'::text, now()))) AS points_this_week
FROM score_events se
GROUP BY se.user_id;
