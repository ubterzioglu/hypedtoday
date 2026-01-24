-- Database schema for Vibecoding Community Project Submissions
-- This schema is designed for Supabase/PostgreSQL

CREATE TABLE project_submissions (
  id SERIAL PRIMARY KEY,
  project_link TEXT NOT NULL,
  linkedin_link TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT FALSE,
  project_slogan TEXT NOT NULL,
  project_content TEXT NOT NULL,
  posted_to_linkedin BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for security
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for public submissions)
CREATE POLICY "Allow public insert" ON project_submissions
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Create policy to allow select only for authenticated users
CREATE POLICY "Allow public select" ON project_submissions
  FOR SELECT TO authenticated, anon
  USING (true);

-- Index for faster queries on posted status
CREATE INDEX idx_project_submissions_posted ON project_submissions(posted_to_linkedin);

-- Index for ordering by creation date
CREATE INDEX idx_project_submissions_created ON project_submissions(created_at DESC);