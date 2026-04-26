-- Public LinkedIn profile directory for /linkedin

CREATE TABLE IF NOT EXISTS linkedin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view linkedin profiles" ON linkedin_profiles
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_created_at
    ON linkedin_profiles(created_at DESC);
