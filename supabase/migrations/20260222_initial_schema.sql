-- Main projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL CHECK (country IN ('TR', 'OTHER')),
    image_url TEXT,
    project_url TEXT,
    motto TEXT,
    description TEXT,
    linkedin_url TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    ui_score INTEGER CHECK (ui_score >= 1 AND ui_score <= 10),
    ux_score INTEGER CHECK (ux_score >= 1 AND ux_score <= 10),
    stability_score INTEGER CHECK (stability_score >= 1 AND stability_score <= 10),
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
    doc_score INTEGER CHECK (doc_score >= 1 AND doc_score <= 10),
    user_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, user_ip)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    user_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    user_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete projects" ON projects FOR DELETE USING (true);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update votes" ON votes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete votes" ON votes FOR DELETE USING (true);

-- Feedback policies
CREATE POLICY "Anyone can view feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete feedback" ON feedback FOR DELETE USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete comments" ON comments FOR DELETE USING (true);

-- Create project stats view for leaderboard
CREATE OR REPLACE VIEW project_stats AS
SELECT
    p.id as project_id,
    p.name,
    p.country,
    p.image_url,
    p.motto,
    COUNT(v.id) as vote_count,
    AVG(v.ui_score) as avg_ui,
    AVG(v.ux_score) as avg_ux,
    AVG(v.stability_score) as avg_stability,
    AVG(v.innovation_score) as avg_innovation,
    AVG(v.doc_score) as avg_doc,
    (
        COALESCE(AVG(v.ui_score), 0) +
        COALESCE(AVG(v.ux_score), 0) +
        COALESCE(AVG(v.stability_score), 0) +
        COALESCE(AVG(v.innovation_score), 0) +
        COALESCE(AVG(v.doc_score), 0)
    ) as total_score
FROM projects p
LEFT JOIN votes v ON p.id = v.project_id
GROUP BY p.id, p.name, p.country, p.image_url, p.motto;

-- Create storage bucket for project images
-- Note: This needs to be done in Supabase dashboard or via storage API
-- Bucket name: project-images
-- Public access: true
