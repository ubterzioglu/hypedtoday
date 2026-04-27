CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_linkedin_url
    ON linkedin_profiles(linkedin_url);

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_submitted_by
    ON linkedin_profiles(submitted_by) WHERE submitted_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_reviewed_by
    ON linkedin_profiles(reviewed_by) WHERE reviewed_by IS NOT NULL;
