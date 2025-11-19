-- =====================================================
-- Keywords-Content Integration (Part 1)
-- Adds keyword tracking fields to blog_posts (learn content)
-- Date: 2025-01-19
-- =====================================================

-- Step 1: Add target_keyword_id for primary keyword targeting
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS target_keyword_id UUID REFERENCES public.target_keywords(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.blog_posts.target_keyword_id IS 'Primary target keyword this content is optimized for (from keywords management system)';

-- Step 2: Add secondary_keyword_ids for additional keyword targeting
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS secondary_keyword_ids UUID[] DEFAULT '{}';

COMMENT ON COLUMN public.blog_posts.secondary_keyword_ids IS 'Array of secondary keyword IDs this content targets';

-- Step 3: Add SEO optimization score
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS seo_optimization_score INTEGER DEFAULT NULL CHECK (seo_optimization_score >= 0 AND seo_optimization_score <= 100);

COMMENT ON COLUMN public.blog_posts.seo_optimization_score IS 'SEO quality score (0-100) based on keyword usage, content structure, etc.';

-- Step 4: Add content optimization status
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS seo_optimized_for_keyword BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.blog_posts.seo_optimized_for_keyword IS 'Flag indicating if content is optimized for target keyword';

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_target_keyword
  ON public.blog_posts(target_keyword_id)
  WHERE target_keyword_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_score
  ON public.blog_posts(seo_optimization_score DESC)
  WHERE seo_optimization_score IS NOT NULL;

-- Step 6: Create view for content-keyword mapping overview
CREATE OR REPLACE VIEW public.content_keyword_mapping AS
SELECT
  bp.id as content_id,
  bp.title as content_title,
  bp.slug as content_slug,
  bp.status as content_status,
  bp.guide_category,
  bp.guide_type,
  bp.view_count,
  bp.word_count,
  bp.seo_optimization_score,
  bp.seo_optimized_for_keyword,
  tk.id as keyword_id,
  tk.keyword as target_keyword,
  tk.priority as keyword_priority,
  tk.category as keyword_category,
  tk.focus_score as keyword_focus_score,
  bp.published_at,
  bp.created_at
FROM public.blog_posts bp
LEFT JOIN public.target_keywords tk ON bp.target_keyword_id = tk.id
WHERE bp.category = 'learn-guide'
ORDER BY bp.created_at DESC;

COMMENT ON VIEW public.content_keyword_mapping IS 'Overview of learn content mapped to target keywords with SEO metrics';

-- Step 7: Create function to calculate SEO optimization score
CREATE OR REPLACE FUNCTION public.calculate_seo_score(content_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  target_kw_id UUID;
  target_kw_text TEXT;
  content_title TEXT;
  content_excerpt TEXT;
  content_word_count INTEGER;
BEGIN
  -- Get content and target keyword
  SELECT
    bp.target_keyword_id,
    bp.title,
    bp.excerpt,
    bp.word_count,
    tk.keyword
  INTO target_kw_id, content_title, content_excerpt, content_word_count, target_kw_text
  FROM public.blog_posts bp
  LEFT JOIN public.target_keywords tk ON bp.target_keyword_id = tk.id
  WHERE bp.id = content_id;

  -- No target keyword = 0 score
  IF target_kw_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Base score for having a target keyword
  score := 20;

  -- Check if keyword is in title (25 points)
  IF content_title IS NOT NULL AND target_kw_text IS NOT NULL AND
     LOWER(content_title) LIKE '%' || LOWER(target_kw_text) || '%' THEN
    score := score + 25;
  END IF;

  -- Check if keyword is in excerpt (15 points)
  IF content_excerpt IS NOT NULL AND target_kw_text IS NOT NULL AND
     LOWER(content_excerpt) LIKE '%' || LOWER(target_kw_text) || '%' THEN
    score := score + 15;
  END IF;

  -- Word count scoring (20 points for 1000+ words)
  IF content_word_count IS NOT NULL THEN
    IF content_word_count >= 1500 THEN
      score := score + 20;
    ELSIF content_word_count >= 1000 THEN
      score := score + 15;
    ELSIF content_word_count >= 500 THEN
      score := score + 10;
    END IF;
  END IF;

  -- Has secondary keywords (10 points)
  IF EXISTS (
    SELECT 1 FROM public.blog_posts
    WHERE id = content_id
    AND secondary_keyword_ids IS NOT NULL
    AND array_length(secondary_keyword_ids, 1) > 0
  ) THEN
    score := score + 10;
  END IF;

  -- Cap at 100
  score := LEAST(score, 100);

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_seo_score(UUID) IS 'Calculate SEO optimization score for a piece of content based on keyword usage';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- ✅ Added: target_keyword_id (UUID) - Primary target keyword
-- ✅ Added: secondary_keyword_ids (UUID[]) - Secondary keywords
-- ✅ Added: seo_optimization_score (INTEGER) - SEO quality score
-- ✅ Added: seo_optimized_for_keyword (BOOLEAN) - Optimization flag
-- ✅ Created: 2 new indexes for performance
-- ✅ Created: content_keyword_mapping view
-- ✅ Created: calculate_seo_score() function
-- =====================================================
