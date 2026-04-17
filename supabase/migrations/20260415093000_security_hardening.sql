-- ============================================================
-- Security Hardening Migration
-- 1. Replace plaintext user_ip with ip_hash on legacy tables
-- 2. Add text_hash for comment/feedback dedup
-- 3. Create rate_limits table for HTTP rate limiting
-- 4. Create user_reports table for user-submitted flags
-- 5. Add ownership columns to legacy tables
-- 6. Tighten RLS on legacy tables
-- ============================================================

-- ============================================================
-- 1. IP hashing on legacy tables
-- ============================================================
ALTER TABLE votes ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS ip_hash TEXT;

UPDATE votes SET ip_hash = encode(digest(COALESCE(user_ip, ''), 'sha256'), 'hex') WHERE ip_hash IS NULL AND user_ip IS NOT NULL;
UPDATE feedback SET ip_hash = encode(digest(COALESCE(user_ip, ''), 'sha256'), 'hex') WHERE ip_hash IS NULL AND user_ip IS NOT NULL;
UPDATE comments SET ip_hash = encode(digest(COALESCE(user_ip, ''), 'sha256'), 'hex') WHERE ip_hash IS NULL AND user_ip IS NOT NULL;

ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_project_id_user_ip_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_project_ip_hash ON votes(project_id, ip_hash) WHERE ip_hash IS NOT NULL;

ALTER TABLE votes DROP COLUMN IF EXISTS user_ip;
ALTER TABLE feedback DROP COLUMN IF EXISTS user_ip;
ALTER TABLE comments DROP COLUMN IF EXISTS user_ip;

-- ============================================================
-- 2. Text hash for spam/dedup detection
-- ============================================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS text_hash TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS text_hash TEXT;
ALTER TABLE task_claims ADD COLUMN IF NOT EXISTS comment_text_hash TEXT;

UPDATE comments SET text_hash = encode(digest(content, 'sha256'), 'hex') WHERE text_hash IS NULL AND content IS NOT NULL;
UPDATE feedback SET text_hash = encode(digest(message, 'sha256'), 'hex') WHERE text_hash IS NULL AND message IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_text_hash ON comments(text_hash) WHERE text_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_text_hash ON feedback(text_hash) WHERE text_hash IS NOT NULL;

-- ============================================================
-- 3. Rate limits table
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, endpoint, created_at DESC);

CREATE OR REPLACE FUNCTION clean_old_rate_limits() RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE created_at < timezone('utc'::text, now()) - INTERVAL '8 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. User reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'claim')),
    target_id UUID NOT NULL,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('spam', 'abuse', 'inappropriate', 'broken_link', 'other')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(reporter_user_id, target_type, target_id)
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON user_reports
    FOR SELECT TO authenticated
    USING (reporter_user_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON user_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE INDEX idx_user_reports_status ON user_reports(status) WHERE status = 'open';
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_user_id, created_at DESC);

-- ============================================================
-- 5. Add ownership columns to legacy tables (BEFORE policies)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'owner_user_id'
    ) THEN
        ALTER TABLE projects ADD COLUMN owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comments' AND column_name = 'owner_user_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================
-- 6. Tighten legacy RLS policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update own projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON projects;

CREATE POLICY "Owners can update own projects" ON projects
    FOR UPDATE TO authenticated
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can delete own projects" ON projects
    FOR DELETE TO authenticated
    USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can update all projects" ON projects
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete all projects" ON projects
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Owners can delete own comments" ON comments
    FOR DELETE TO authenticated
    USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can delete all comments" ON comments
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Feedback: admin-only read/delete, insert through Edge Function only
DROP POLICY IF EXISTS "Anyone can view feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can delete feedback" ON feedback;

CREATE POLICY "Admins can read feedback" ON feedback
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete feedback" ON feedback
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
