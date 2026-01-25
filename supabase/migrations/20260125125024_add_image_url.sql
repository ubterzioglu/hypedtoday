-- Add image_url column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;

-- NOTE: Storage buckets are usually managed via Dashboard or separate API calls 
-- but we can try to insert if the buckets table exists in the extension schema.
-- However, for Supabase migrations, it's safer to stick to public schema changes usually.
-- We will assume the user creates the 'project-images' bucket manually in Dashboard as "Public".

-- But just in case, let's allow storage access in policies if needed
-- (Supabase Storage policies are separate, handled in the storage.objects table)

-- We can add a comment explaining manual step
COMMENT ON COLUMN projects.image_url IS 'URL of the project image from Supabase Storage';
