-- Add country field to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'OTHER';

-- Add check constraint for valid values
ALTER TABLE projects ADD CONSTRAINT projects_country_check 
  CHECK (country IN ('TR', 'OTHER'));

-- Create index for filtering
CREATE INDEX IF NOT EXISTS projects_country_idx ON projects(country);
