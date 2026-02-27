-- Allow public to update projects (needed for Admin Panel)
CREATE POLICY "Anyone can update projects" 
ON projects FOR UPDATE 
USING (true);

-- Allow public to delete projects (needed for Admin Panel)
CREATE POLICY "Anyone can delete projects" 
ON projects FOR DELETE 
USING (true);
