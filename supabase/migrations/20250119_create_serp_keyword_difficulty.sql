-- SERP Competition Analysis table
CREATE TABLE IF NOT EXISTS serp_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES target_keywords(id) ON DELETE CASCADE,
  search_volume INTEGER,
  competition_level TEXT,  -- low, medium, high
  top_results JSONB DEFAULT '[]'::jsonb,  -- Array of top 10 results with metadata
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keyword Difficulty scores table
CREATE TABLE IF NOT EXISTS keyword_difficulty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES target_keywords(id) ON DELETE CASCADE,
  difficulty_score INTEGER CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
  source TEXT DEFAULT 'internal',  -- internal, ahrefs, semrush, moz, etc.
  search_volume INTEGER,
  cpc NUMERIC(10,2),  -- Cost per click
  competition_index NUMERIC(3,2),  -- 0-1 scale
  metadata JSONB DEFAULT '{}'::jsonb,  -- Additional metrics
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_serp_keyword ON serp_analysis(keyword_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_keyword ON keyword_difficulty(keyword_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_score ON keyword_difficulty(difficulty_score);

-- Comments
COMMENT ON TABLE serp_analysis IS 'SERP (Search Engine Results Page) analysis for keywords';
COMMENT ON COLUMN serp_analysis.top_results IS 'Top 10 Google results with title, url, domain, description';
COMMENT ON TABLE keyword_difficulty IS 'Keyword difficulty scores from various sources';
COMMENT ON COLUMN keyword_difficulty.difficulty_score IS 'Difficulty score 0-100 (0=easy, 100=very hard)';
COMMENT ON COLUMN keyword_difficulty.competition_index IS 'Competition level on 0-1 scale';
