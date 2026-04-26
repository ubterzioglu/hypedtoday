-- Approval workflow for /linkedin profile submissions.

ALTER TABLE linkedin_profiles
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linkedin_profiles_approval_status_check'
          AND conrelid = 'public.linkedin_profiles'::regclass
    ) THEN
        ALTER TABLE linkedin_profiles
            ADD CONSTRAINT linkedin_profiles_approval_status_check
            CHECK (approval_status IN ('pending', 'approved', 'rejected')) NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_approval_status_created_at
    ON linkedin_profiles(approval_status, created_at DESC);

DROP POLICY IF EXISTS "Admins can update linkedin profile approvals" ON linkedin_profiles;
CREATE POLICY "Admins can update linkedin profile approvals" ON linkedin_profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
