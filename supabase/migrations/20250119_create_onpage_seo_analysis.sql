-- Create table for on-page SEO analysis results
CREATE TABLE IF NOT EXISTS onpage_seo_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES target_keywords(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,

  -- Analysis results
  has_h1 BOOLEAN DEFAULT FALSE,
  h1_matches JSONB DEFAULT '[]'::jsonb,  -- Array of matching H1 tags

  has_meta_title BOOLEAN DEFAULT FALSE,
  meta_title TEXT,
  meta_title_match BOOLEAN DEFAULT FALSE,

  has_meta_description BOOLEAN DEFAULT FALSE,
  meta_description TEXT,
  meta_description_match BOOLEAN DEFAULT FALSE,

  keyword_density NUMERIC(5,2) DEFAULT 0.0,  -- Percentage (e.g., 1.5 = 1.5%)
  word_count INTEGER DEFAULT 0,
  keyword_count INTEGER DEFAULT 0,

  -- Overall score (0-100)
  seo_score INTEGER DEFAULT 0,

  -- Recommendations
  recommendations JSONB DEFAULT '[]'::jsonb,  -- Array of recommendation objects

  -- Status
  status TEXT DEFAULT 'pending',  -- pending, analyzing, completed, failed
  error_message TEXT,

  -- Timestamps
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_onpage_seo_keyword_id ON onpage_seo_analysis(keyword_id);
CREATE INDEX IF NOT EXISTS idx_onpage_seo_target_url ON onpage_seo_analysis(target_url);
CREATE INDEX IF NOT EXISTS idx_onpage_seo_status ON onpage_seo_analysis(status);
CREATE INDEX IF NOT EXISTS idx_onpage_seo_score ON onpage_seo_analysis(seo_score);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_onpage_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onpage_seo_updated_at_trigger
  BEFORE UPDATE ON onpage_seo_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_onpage_seo_updated_at();

-- Add comments
COMMENT ON TABLE onpage_seo_analysis IS 'Stores on-page SEO analysis results for target keywords';
COMMENT ON COLUMN onpage_seo_analysis.keyword_density IS 'Keyword density as percentage (e.g., 1.5 = 1.5%)';
COMMENT ON COLUMN onpage_seo_analysis.seo_score IS 'Overall SEO score from 0-100';
COMMENT ON COLUMN onpage_seo_analysis.recommendations IS 'Array of actionable recommendations for improving on-page SEO';
