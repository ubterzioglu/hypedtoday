-- Allow public to select feedback (needed because our Admin Panel uses anonymous client with client-side auth)
CREATE POLICY "Anyone can read feedback" 
ON feedback FOR SELECT 
USING (true);

-- Allow public to delete feedback (same reason)
CREATE POLICY "Anyone can delete feedback" 
ON feedback FOR DELETE 
USING (true);
