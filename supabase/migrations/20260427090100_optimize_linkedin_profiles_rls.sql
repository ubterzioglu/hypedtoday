DROP POLICY IF EXISTS "Admins can update linkedin profile approvals" ON linkedin_profiles;
CREATE POLICY "Admins can update linkedin profile approvals" ON linkedin_profiles
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
