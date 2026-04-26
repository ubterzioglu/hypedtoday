-- Allow the /linkedin page to save profiles even when the Edge Function is not deployed.
-- Public reads remain unchanged; inserts require an authenticated user.

ALTER TABLE linkedin_profiles
    ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can submit linkedin profiles" ON linkedin_profiles;
CREATE POLICY "Authenticated users can submit linkedin profiles" ON linkedin_profiles
    FOR INSERT TO authenticated
    WITH CHECK (submitted_by = auth.uid());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linkedin_profiles_first_name_length'
          AND conrelid = 'public.linkedin_profiles'::regclass
    ) THEN
        ALTER TABLE linkedin_profiles
            ADD CONSTRAINT linkedin_profiles_first_name_length
            CHECK (char_length(first_name) BETWEEN 1 AND 80) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linkedin_profiles_last_name_length'
          AND conrelid = 'public.linkedin_profiles'::regclass
    ) THEN
        ALTER TABLE linkedin_profiles
            ADD CONSTRAINT linkedin_profiles_last_name_length
            CHECK (char_length(last_name) BETWEEN 1 AND 80) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linkedin_profiles_whatsapp_number_format'
          AND conrelid = 'public.linkedin_profiles'::regclass
    ) THEN
        ALTER TABLE linkedin_profiles
            ADD CONSTRAINT linkedin_profiles_whatsapp_number_format
            CHECK (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$') NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linkedin_profiles_linkedin_url_format'
          AND conrelid = 'public.linkedin_profiles'::regclass
    ) THEN
        ALTER TABLE linkedin_profiles
            ADD CONSTRAINT linkedin_profiles_linkedin_url_format
            CHECK (
                char_length(linkedin_url) <= 300
                AND linkedin_url ~* '^https?://([a-z]{2,3}\.)?(www\.)?linkedin\.com/in/[^/?#]+/?'
            ) NOT VALID;
    END IF;
END $$;
