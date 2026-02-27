-- Policy to allow public uploads to project-images bucket
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'project-images' );

-- Policy to allow public viewing is usually handled by "Public Bucket" setting
-- but we can add explicit policy too if needed.
-- For now, INSERT is the critical missing piece for the form to work.
