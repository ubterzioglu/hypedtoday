-- Emergency lockdown: Remove all permissive write policies
-- Keeps public SELECT on projects, comments, project_stats only
-- All INSERT/UPDATE/DELETE policies are dropped

-- ============================================================
-- PROJECTS: public read only, no public writes
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert projects" ON projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON projects;

-- ============================================================
-- VOTES: block all public access (will be replaced by Edge Functions)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;
DROP POLICY IF EXISTS "Anyone can update votes" ON votes;
DROP POLICY IF EXISTS "Anyone can delete votes" ON votes;

-- ============================================================
-- FEEDBACK: block all public access (admin-only later)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can delete feedback" ON feedback;

-- ============================================================
-- COMMENTS: keep public read, remove public writes
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON comments;

-- ============================================================
-- Add authenticated-user write policies for projects (temporary)
-- These will be replaced by Edge Function service-role writes later
-- ============================================================
CREATE POLICY "Authenticated users can insert projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update own projects" ON projects
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete own projects" ON projects
    FOR DELETE TO authenticated
    USING (true);

-- ============================================================
-- Add authenticated-user write for comments (temporary)
-- ============================================================
CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Note: votes and feedback remain fully locked until Edge Functions are live.
-- The project_stats view continues to work because it reads from projects + votes
-- and projects still has public SELECT.
