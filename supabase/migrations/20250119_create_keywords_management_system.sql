-- Create target_keywords table for manual keyword management
CREATE TABLE IF NOT EXISTS target_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT, -- testosterone, potency, fitness, nutrition, supplements, lifestyle
  focus_score INTEGER DEFAULT 0, -- How much we want to focus on this (0-100)
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_target_keywords_priority ON target_keywords(priority);
CREATE INDEX IF NOT EXISTS idx_target_keywords_category ON target_keywords(category);
CREATE INDEX IF NOT EXISTS idx_target_keywords_focus_score ON target_keywords(focus_score DESC);

-- Table for tracking keyword usage in articles
CREATE TABLE IF NOT EXISTS keyword_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES target_keywords(id) ON DELETE CASCADE,
  article_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  frequency INTEGER DEFAULT 0,
  density DECIMAL(5,2) DEFAULT 0, -- keyword density percentage
  in_title BOOLEAN DEFAULT FALSE,
  in_meta_description BOOLEAN DEFAULT FALSE,
  in_h2 BOOLEAN DEFAULT FALSE,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_keyword_usage_keyword ON keyword_usage(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_usage_article ON keyword_usage(article_id);

-- Table for storing GSC data (cached for performance)
CREATE TABLE IF NOT EXISTS gsc_keyword_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  clicks_previous_period INTEGER DEFAULT 0,
  impressions_previous_period INTEGER DEFAULT 0,
  date DATE NOT NULL,
  page_url TEXT,
  country TEXT DEFAULT 'bgr',
  device TEXT DEFAULT 'DESKTOP',
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, date, page_url, country, device)
);

CREATE INDEX IF NOT EXISTS idx_gsc_keyword ON gsc_keyword_performance(keyword);
CREATE INDEX IF NOT EXISTS idx_gsc_date ON gsc_keyword_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_page_url ON gsc_keyword_performance(page_url);
CREATE INDEX IF NOT EXISTS idx_gsc_clicks ON gsc_keyword_performance(clicks DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_impressions ON gsc_keyword_performance(impressions DESC);

-- Table for GSC authentication tokens
CREATE TABLE IF NOT EXISTS gsc_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  property_url TEXT NOT NULL, -- e.g., 'https://testograph.eu'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_target_keywords_updated_at ON target_keywords;
CREATE TRIGGER update_target_keywords_updated_at
    BEFORE UPDATE ON target_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gsc_auth_tokens_updated_at ON gsc_auth_tokens;
CREATE TRIGGER update_gsc_auth_tokens_updated_at
    BEFORE UPDATE ON gsc_auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE target_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_keyword_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything
CREATE POLICY "Admin full access to target_keywords" ON target_keywords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to keyword_usage" ON keyword_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to gsc_keyword_performance" ON gsc_keyword_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to gsc_auth_tokens" ON gsc_auth_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
