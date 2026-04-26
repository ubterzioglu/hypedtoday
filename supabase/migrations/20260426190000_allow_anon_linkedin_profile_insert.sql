-- Allow anonymous submissions on /linkedin so the page no longer requires login.
-- Authenticated users may continue submitting, and submitted_by remains linked when available.

DROP POLICY IF EXISTS "Authenticated users can submit linkedin profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Anyone can submit linkedin profiles" ON linkedin_profiles;

CREATE POLICY "Anyone can submit linkedin profiles" ON linkedin_profiles
    FOR INSERT TO anon, authenticated
    WITH CHECK (submitted_by IS NULL OR submitted_by = auth.uid());
