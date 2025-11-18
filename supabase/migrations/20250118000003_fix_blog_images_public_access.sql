-- =====================================================
-- Fix blog-images Storage Bucket Public Access
-- Allow public read access to blog-images bucket
-- Date: 2025-01-18
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access for blog images" ON storage.objects;

-- Create public read policy for blog-images bucket
CREATE POLICY "Public read access for blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Ensure bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'blog-images';

COMMENT ON POLICY "Public read access for blog images" ON storage.objects IS
'Allow anyone to view images in blog-images bucket (learn guides, featured images)';
