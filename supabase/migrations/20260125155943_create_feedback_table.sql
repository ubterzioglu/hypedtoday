CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    user_ip TEXT, -- Basic fingerprinting (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public to insert feedback
CREATE POLICY "Anyone can submit feedback" 
ON feedback FOR INSERT 
WITH CHECK (true);

-- Only admin can view feedback (optional, assuming admin role or service role usage)
-- For now, maybe just allow read for simplicity if needed, but INSERT is key.
