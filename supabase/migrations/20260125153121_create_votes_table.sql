CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ui_score INTEGER CHECK (ui_score >= 1 AND ui_score <= 10),
    ux_score INTEGER CHECK (ux_score >= 1 AND ux_score <= 10),
    stability_score INTEGER CHECK (stability_score >= 1 AND stability_score <= 10),
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
    doc_score INTEGER CHECK (doc_score >= 1 AND doc_score <= 10),
    user_ip TEXT, -- Basic fingerprinting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for querying votes by project
CREATE INDEX IF NOT EXISTS votes_project_id_idx ON votes(project_id);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert votes (anyone can vote)
CREATE POLICY "Anyone can vote" 
ON votes FOR INSERT 
WITH CHECK (true);

-- Allow public to view votes (for calculating stats)
CREATE POLICY "Anyone can view votes" 
ON votes FOR SELECT 
USING (true);
