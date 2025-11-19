-- =====================================================
-- Keywords-Content Integration (Part 2)
-- Adds content assignment tracking to target_keywords
-- Date: 2025-01-19
-- =====================================================

-- Step 1: Add assigned_content_id to track which content piece targets this keyword
ALTER TABLE public.target_keywords
  ADD COLUMN IF NOT EXISTS assigned_content_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.target_keywords.assigned_content_id IS 'Learn content (blog_post) that primarily targets this keyword';

-- Step 2: Add content creation workflow status
ALTER TABLE public.target_keywords
  ADD COLUMN IF NOT EXISTS content_status TEXT DEFAULT 'not_started'
    CHECK (content_status IN ('not_started', 'planned', 'in_progress', 'published'));

COMMENT ON COLUMN public.target_keywords.content_status IS 'Status of content creation for this keyword: not_started, planned, in_progress, published';

-- Step 3: Add content planning fields
ALTER TABLE public.target_keywords
  ADD COLUMN IF NOT EXISTS content_brief TEXT,
  ADD COLUMN IF NOT EXISTS target_word_count INTEGER,
  ADD COLUMN IF NOT EXISTS content_angle TEXT;

COMMENT ON COLUMN public.target_keywords.content_brief IS 'AI-generated or manual content brief/outline for this keyword';
COMMENT ON COLUMN public.target_keywords.target_word_count IS 'Target word count for content targeting this keyword';
COMMENT ON COLUMN public.target_keywords.content_angle IS 'Unique angle or approach for content (e.g., "beginner guide", "advanced tips", "comparison")';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_target_keywords_assigned_content
  ON public.target_keywords(assigned_content_id)
  WHERE assigned_content_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_target_keywords_content_status
  ON public.target_keywords(content_status);

-- Step 5: Create view for keywords without content (content gaps)
CREATE OR REPLACE VIEW public.keyword_content_gaps AS
SELECT
  tk.id as keyword_id,
  tk.keyword,
  tk.priority,
  tk.category,
  tk.focus_score,
  tk.content_status,
  tk.content_brief,
  tk.target_word_count,
  tk.notes,
  tk.created_at,
  -- Count related keywords in same cluster
  (
    SELECT COUNT(*)
    FROM keyword_cluster_members kcm1
    JOIN keyword_cluster_members kcm2 ON kcm1.cluster_id = kcm2.cluster_id
    WHERE kcm1.keyword_id = tk.id
  ) as related_keywords_count
FROM public.target_keywords tk
WHERE tk.assigned_content_id IS NULL
  OR tk.content_status IN ('not_started', 'planned')
ORDER BY tk.focus_score DESC, tk.priority, tk.created_at;

COMMENT ON VIEW public.keyword_content_gaps IS 'High-priority keywords without published content (content gap analysis)';

-- Step 6: Create function to auto-update content_status based on assigned content
CREATE OR REPLACE FUNCTION public.sync_keyword_content_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When content is assigned to keyword, update status
  IF NEW.assigned_content_id IS NOT NULL AND OLD.assigned_content_id IS NULL THEN
    NEW.content_status := 'in_progress';
  END IF;

  -- When content is published, update keyword status
  IF NEW.assigned_content_id IS NOT NULL THEN
    DECLARE
      content_status_value TEXT;
    BEGIN
      SELECT status INTO content_status_value
      FROM blog_posts
      WHERE id = NEW.assigned_content_id;

      IF content_status_value = 'published' THEN
        NEW.content_status := 'published';
      ELSIF content_status_value = 'draft' THEN
        NEW.content_status := 'in_progress';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_keyword_content_status ON target_keywords;
CREATE TRIGGER trigger_sync_keyword_content_status
  BEFORE UPDATE ON target_keywords
  FOR EACH ROW
  EXECUTE FUNCTION sync_keyword_content_status();

COMMENT ON FUNCTION public.sync_keyword_content_status() IS 'Auto-sync keyword content_status when content is assigned or published';

-- Step 7: Create function to find keywords for content brief generation
CREATE OR REPLACE FUNCTION public.get_keywords_needing_content_brief()
RETURNS TABLE (
  keyword_id UUID,
  keyword TEXT,
  priority TEXT,
  category TEXT,
  focus_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tk.id,
    tk.keyword,
    tk.priority,
    tk.category,
    tk.focus_score
  FROM target_keywords tk
  WHERE tk.content_brief IS NULL
    AND tk.content_status IN ('not_started', 'planned')
    AND tk.focus_score >= 50  -- Only high-focus keywords
  ORDER BY tk.focus_score DESC, tk.priority
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_keywords_needing_content_brief() IS 'Get high-priority keywords that need content briefs generated';

-- Step 8: Create stats view for content-keyword integration
CREATE OR REPLACE VIEW public.keyword_content_integration_stats AS
SELECT
  COUNT(*) as total_keywords,
  COUNT(*) FILTER (WHERE assigned_content_id IS NOT NULL) as keywords_with_content,
  COUNT(*) FILTER (WHERE content_status = 'published') as keywords_with_published_content,
  COUNT(*) FILTER (WHERE content_status = 'in_progress') as keywords_in_progress,
  COUNT(*) FILTER (WHERE content_status = 'planned') as keywords_planned,
  COUNT(*) FILTER (WHERE content_status = 'not_started') as keywords_not_started,
  COUNT(*) FILTER (WHERE content_brief IS NOT NULL) as keywords_with_brief,
  ROUND(
    (COUNT(*) FILTER (WHERE assigned_content_id IS NOT NULL)::DECIMAL /
     NULLIF(COUNT(*), 0)) * 100,
    1
  ) as content_coverage_percentage
FROM target_keywords;

COMMENT ON VIEW public.keyword_content_integration_stats IS 'Overall statistics for keyword-content integration';

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- ✅ Added: assigned_content_id (UUID) - Link to content piece
-- ✅ Added: content_status (TEXT) - Workflow status
-- ✅ Added: content_brief (TEXT) - Content outline/brief
-- ✅ Added: target_word_count (INTEGER) - Target length
-- ✅ Added: content_angle (TEXT) - Content approach
-- ✅ Created: 2 new indexes for performance
-- ✅ Created: keyword_content_gaps view
-- ✅ Created: keyword_content_integration_stats view
-- ✅ Created: sync_keyword_content_status() trigger function
-- ✅ Created: get_keywords_needing_content_brief() function
-- =====================================================
