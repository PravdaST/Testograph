-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to PDFs
CREATE POLICY "Public PDF Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pdfs');

-- Policy: Allow authenticated uploads (service role)
CREATE POLICY "Service Role PDF Upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs');

-- Policy: Allow authenticated updates (service role)
CREATE POLICY "Service Role PDF Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pdfs')
WITH CHECK (bucket_id = 'pdfs');

-- Policy: Allow authenticated deletes (service role)
CREATE POLICY "Service Role PDF Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pdfs');

COMMENT ON TABLE storage.buckets IS 'Storage bucket for quiz result PDFs (template and AI-enhanced)';
