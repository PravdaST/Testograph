-- Add views column to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0 NOT NULL;

-- Create index on views for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_views ON public.blog_posts(views DESC);

-- Add word_count column for content analysis
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 0;

-- Function to calculate word count from content
CREATE OR REPLACE FUNCTION calculate_word_count(content_text text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN array_length(regexp_split_to_array(trim(content_text), '\s+'), 1);
END;
$$;

-- Update existing posts with word counts
UPDATE public.blog_posts
SET word_count = calculate_word_count(content)
WHERE word_count = 0 OR word_count IS NULL;
