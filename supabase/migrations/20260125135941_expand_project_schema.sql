-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS motto TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Create index on is_anonymous for potential filtering
CREATE INDEX IF NOT EXISTS projects_is_anonymous_idx ON projects(is_anonymous);
