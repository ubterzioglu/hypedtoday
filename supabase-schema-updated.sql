-- Updated schema to match CSV data
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table with all CSV columns
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  country TEXT DEFAULT 'OTHER',
  image_url TEXT,
  project_url TEXT,
  motto TEXT,
  description TEXT,
  linkedin_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  contact_email TEXT,
  votes INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read projects
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert projects (for now - you can restrict later)
CREATE POLICY "Anyone can insert projects" ON projects
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to update projects (for voting)
CREATE POLICY "Anyone can update projects" ON projects
  FOR UPDATE USING (true);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);

-- Create index on votes for leaderboard
CREATE INDEX IF NOT EXISTS projects_votes_idx ON projects(votes DESC);

-- Create index on country for filtering
CREATE INDEX IF NOT EXISTS projects_country_idx ON projects(country);

-- Create votes table (optional - if you want separate vote tracking)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, voter_email) -- Prevent duplicate votes
);

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read votes
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert votes
CREATE POLICY "Anyone can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS votes_project_id_idx ON votes(project_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read comments
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS comments_project_id_idx ON comments(project_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
