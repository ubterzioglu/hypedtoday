-- LinkedIn dashboard tracking model for approved members.

ALTER TABLE linkedin_posts
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS note TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'linkedin_posts_status_check'
          AND conrelid = 'public.linkedin_posts'::regclass
    ) THEN
        ALTER TABLE linkedin_posts
            DROP CONSTRAINT linkedin_posts_status_check;
    END IF;

    ALTER TABLE linkedin_posts
        ADD CONSTRAINT linkedin_posts_status_check
        CHECK (status IN ('active', 'paused', 'archived', 'hidden_by_admin', 'deleted', 'open', 'closed')) NOT VALID;
END $$;

CREATE TABLE IF NOT EXISTS post_like_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES linkedin_posts(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'liked', 'not_yet', 'skipped')),
    marked_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, member_user_id)
);

ALTER TABLE post_like_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own tracking rows" ON post_like_tracking;
CREATE POLICY "Members can view own tracking rows" ON post_like_tracking
    FOR SELECT TO authenticated
    USING (member_user_id = auth.uid());

DROP POLICY IF EXISTS "Members can update own tracking rows" ON post_like_tracking;
CREATE POLICY "Members can update own tracking rows" ON post_like_tracking
    FOR UPDATE TO authenticated
    USING (member_user_id = auth.uid())
    WITH CHECK (member_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can view tracking rows on own posts" ON post_like_tracking;
CREATE POLICY "Owners can view tracking rows on own posts" ON post_like_tracking
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM linkedin_posts lp
            WHERE lp.id = post_like_tracking.post_id
              AND lp.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all tracking rows" ON post_like_tracking;
CREATE POLICY "Admins can view all tracking rows" ON post_like_tracking
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all tracking rows" ON post_like_tracking;
CREATE POLICY "Admins can update all tracking rows" ON post_like_tracking
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view open dashboard posts" ON linkedin_posts;
CREATE POLICY "Authenticated users can view open dashboard posts" ON linkedin_posts
    FOR SELECT TO authenticated
    USING (status = 'open');

DROP POLICY IF EXISTS "Owners can update own dashboard posts" ON linkedin_posts;
CREATE POLICY "Owners can update own dashboard posts" ON linkedin_posts
    FOR UPDATE TO authenticated
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_post_like_tracking_member_status_created
    ON post_like_tracking(member_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_like_tracking_post_status
    ON post_like_tracking(post_id, status);

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_owner_status_published_at
    ON linkedin_posts(owner_user_id, status, published_at DESC NULLS LAST);
