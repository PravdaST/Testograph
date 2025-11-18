-- =====================================================
-- Learn Content System UPGRADE - Complete Feature Set
-- Adds: Multiple images, analytics, scheduling, status
-- Date: 2025-01-18
-- =====================================================

-- Step 1: Add article_images array field for in-content images
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS article_images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.blog_posts.article_images IS 'Array of article image URLs (in-content images, not hero)';

-- Step 2: Add analytics fields
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS reading_time INTEGER;

COMMENT ON COLUMN public.blog_posts.view_count IS 'Total page views (analytics)';
COMMENT ON COLUMN public.blog_posts.word_count IS 'Article word count for quality tracking';
COMMENT ON COLUMN public.blog_posts.reading_time IS 'Estimated reading time in minutes (word_count / 200)';

-- Step 3: Add publishing workflow fields
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Add CHECK constraint for status
ALTER TABLE public.blog_posts
  ADD CONSTRAINT check_blog_posts_status
  CHECK (status IN ('draft', 'published', 'archived'));

COMMENT ON COLUMN public.blog_posts.status IS 'Publishing status: draft (not public), published (live), archived (hidden)';
COMMENT ON COLUMN public.blog_posts.scheduled_for IS 'Future publish date/time (for scheduled publishing)';

-- Step 4: Add tracking fields
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS main_topic TEXT DEFAULT 'mens-health',
  ADD COLUMN IF NOT EXISTS keywords TEXT[];

COMMENT ON COLUMN public.blog_posts.ai_generated IS 'Flag: was this content AI-generated or human-written';
COMMENT ON COLUMN public.blog_posts.main_topic IS 'Top-level topic for multi-topic support (mens-health, astrology, etc.)';
COMMENT ON COLUMN public.blog_posts.keywords IS 'SEO keywords array';

-- Step 5: Migrate existing is_published data to new status field
UPDATE public.blog_posts
SET status = CASE
  WHEN is_published = true THEN 'published'
  ELSE 'draft'
END
WHERE status = 'draft' OR status IS NULL;

-- Step 6: Create new indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status
  ON public.blog_posts(status);

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_for
  ON public.blog_posts(scheduled_for)
  WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count
  ON public.blog_posts(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_main_topic
  ON public.blog_posts(main_topic);

CREATE INDEX IF NOT EXISTS idx_blog_posts_word_count
  ON public.blog_posts(word_count DESC);

-- Step 7: Create function to auto-publish scheduled posts
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
  published_count INTEGER;
BEGIN
  UPDATE public.blog_posts
  SET
    status = 'published',
    published_at = NOW()
  WHERE
    status = 'draft'
    AND scheduled_for IS NOT NULL
    AND scheduled_for <= NOW();

  GET DIAGNOSTICS published_count = ROW_COUNT;

  RETURN published_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.auto_publish_scheduled_posts() IS 'Auto-publish posts with scheduled_for <= NOW()';

-- Step 8: Create view for published guides stats
CREATE OR REPLACE VIEW public.learn_guides_stats AS
SELECT
  guide_category,
  guide_type,
  COUNT(*) as total_guides,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  SUM(view_count) as total_views,
  AVG(word_count)::INTEGER as avg_word_count,
  AVG(reading_time)::INTEGER as avg_reading_time
FROM public.blog_posts
WHERE category = 'learn-guide'
GROUP BY guide_category, guide_type;

COMMENT ON VIEW public.learn_guides_stats IS 'Analytics overview for learn guides by category and type';

-- Step 9: Update RLS policies to use new status field
-- Drop old policies that reference is_published
DROP POLICY IF EXISTS "Public can read published guides" ON public.blog_posts;

-- Create new policy using status field
CREATE POLICY "Public can read published guides"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Step 10: Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_guide_views(guide_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = guide_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.increment_guide_views(TEXT) IS 'Increment view_count for a published guide by slug';

-- Step 11: Add helpful comments
COMMENT ON TABLE public.blog_posts IS 'Learn guides and blog posts with cluster-pillar SEO architecture. Supports multiple images, analytics, scheduled publishing.';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- ✅ Added: article_images (TEXT[]) - Array of in-content image URLs
-- ✅ Added: view_count (INTEGER) - Page view analytics
-- ✅ Added: word_count (INTEGER) - Content length tracking
-- ✅ Added: reading_time (INTEGER) - Estimated minutes to read
-- ✅ Added: status (TEXT) - draft/published/archived workflow
-- ✅ Added: scheduled_for (TIMESTAMPTZ) - Future publishing
-- ✅ Added: ai_generated (BOOLEAN) - Content source tracking
-- ✅ Added: main_topic (TEXT) - Multi-topic categorization
-- ✅ Added: keywords (TEXT[]) - SEO keywords array
-- ✅ Created: 5 new indexes for query performance
-- ✅ Created: auto_publish_scheduled_posts() function
-- ✅ Created: increment_guide_views() function
-- ✅ Created: learn_guides_stats view for analytics
-- ✅ Migrated: is_published → status field
-- ✅ Updated: RLS policies to use status
-- =====================================================

-- Post-migration validation query:
-- SELECT
--   column_name,
--   data_type,
--   column_default,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'blog_posts'
-- ORDER BY ordinal_position;
