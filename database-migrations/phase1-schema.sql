-- Phase 1: Database Schema Updates
-- User Model, Enhanced Project Model, TesterRequest, ReputationLog

-- 1. Create/Update User Model
-- Note: Supabase Auth users table already exists, we extend it with metadata
-- We'll create a user_profiles table to store additional user data

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  reputation_score INTEGER DEFAULT 0,
  time_bank_hours FLOAT DEFAULT 0.0,
  social_links JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_reputation_score_idx ON user_profiles(reputation_score DESC);
CREATE INDEX IF NOT EXISTS user_profiles_time_bank_hours_idx ON user_profiles(time_bank_hours DESC);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User can read their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- User can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Anyone can read public profile data (reputation score for leaderboard)
CREATE POLICY "Anyone can view reputation scores"
ON user_profiles
FOR SELECT
USING (true);

-- 2. Enhanced Project Model Updates
-- Add new columns to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS social_media_posts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON projects(owner_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_completeness_score_idx ON projects(completeness_score DESC);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects(updated_at DESC);

-- Update RLS policies for projects
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON projects;

-- Only approved projects are visible to public
CREATE POLICY "Public can view approved projects"
ON projects
FOR SELECT
USING (status = 'Approved');

-- Users can view their own projects regardless of status
CREATE POLICY "Users can view own projects"
ON projects
FOR SELECT
USING (auth.uid() = owner_id);

-- Anyone can insert projects (will be in Pending status)
CREATE POLICY "Anyone can insert projects"
ON projects
FOR INSERT
WITH CHECK (true);

-- Project owners can update their projects
CREATE POLICY "Owners can update own projects"
ON projects
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 3. TesterRequest Model
CREATE TABLE IF NOT EXISTS tester_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  estimated_time_needed FLOAT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for tester_requests
CREATE INDEX IF NOT EXISTS tester_requests_project_id_idx ON tester_requests(project_id);
CREATE INDEX IF NOT EXISTS tester_requests_status_idx ON tester_requests(status);
CREATE INDEX IF NOT EXISTS tester_requests_created_at_idx ON tester_requests(created_at DESC);

-- Enable RLS on tester_requests
ALTER TABLE tester_requests ENABLE ROW LEVEL SECURITY;

-- Public can view tester requests for approved projects
CREATE POLICY "Public can view tester requests"
ON tester_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tester_requests.project_id
    AND projects.status = 'Approved'
  )
);

-- Project owners can create tester requests
CREATE POLICY "Owners can create tester requests"
ON tester_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tester_requests.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Project owners can update their tester requests
CREATE POLICY "Owners can update own tester requests"
ON tester_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tester_requests.project_id
    AND projects.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tester_requests.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- 4. ReputationLog Model
CREATE TABLE IF NOT EXISTS reputation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  points_changed INTEGER NOT NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for reputation_logs
CREATE INDEX IF NOT EXISTS reputation_logs_user_id_idx ON reputation_logs(user_id);
CREATE INDEX IF NOT EXISTS reputation_logs_action_type_idx ON reputation_logs(action_type);
CREATE INDEX IF NOT EXISTS reputation_logs_created_at_idx ON reputation_logs(created_at DESC);

-- Enable RLS on reputation_logs
ALTER TABLE reputation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own reputation logs
CREATE POLICY "Users can view own reputation logs"
ON reputation_logs
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Update Comments table RLS if needed
-- Drop and recreate with better policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;

-- Public can view comments on approved projects
CREATE POLICY "Public can view project comments"
ON comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = comments.project_id
    AND projects.status = 'Approved'
  )
);

-- Anyone can insert comments on approved projects
CREATE POLICY "Anyone can insert project comments"
ON comments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = comments.project_id
    AND projects.status = 'Approved'
  )
);

-- 6. Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tester_requests_updated_at ON tester_requests;
CREATE TRIGGER update_tester_requests_updated_at
BEFORE UPDATE ON tester_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
