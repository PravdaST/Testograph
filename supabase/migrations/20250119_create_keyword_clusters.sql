-- Create keyword clusters table
CREATE TABLE IF NOT EXISTS keyword_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,  -- Main theme/topic of the cluster
  pillar_keyword_id UUID REFERENCES target_keywords(id) ON DELETE SET NULL,  -- Optional pillar keyword
  pillar_url TEXT,  -- URL for the pillar page
  color TEXT DEFAULT '#3b82f6',  -- Color for visualization
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for many-to-many relationship between keywords and clusters
CREATE TABLE IF NOT EXISTS keyword_cluster_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES target_keywords(id) ON DELETE CASCADE,
  cluster_id UUID NOT NULL REFERENCES keyword_clusters(id) ON DELETE CASCADE,
  relevance_score NUMERIC(3,2) DEFAULT 1.0,  -- How relevant is this keyword to the cluster (0-1)
  is_pillar BOOLEAN DEFAULT FALSE,  -- Is this the pillar keyword for the cluster?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a keyword can only be in a cluster once
  UNIQUE(keyword_id, cluster_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_created_by ON keyword_clusters(created_by);
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_pillar ON keyword_clusters(pillar_keyword_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_keyword ON keyword_cluster_members(keyword_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster ON keyword_cluster_members(cluster_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_keyword_cluster_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keyword_cluster_updated_at_trigger
  BEFORE UPDATE ON keyword_clusters
  FOR EACH ROW
  EXECUTE FUNCTION update_keyword_cluster_updated_at();

-- Add comments
COMMENT ON TABLE keyword_clusters IS 'Keyword clusters for organizing related keywords into topical groups';
COMMENT ON COLUMN keyword_clusters.pillar_keyword_id IS 'The main pillar keyword that this cluster targets';
COMMENT ON COLUMN keyword_clusters.pillar_url IS 'URL of the pillar page/content for this cluster';
COMMENT ON TABLE keyword_cluster_members IS 'Junction table linking keywords to their clusters';
COMMENT ON COLUMN keyword_cluster_members.relevance_score IS 'AI-calculated relevance of keyword to cluster (0-1)';
COMMENT ON COLUMN keyword_cluster_members.is_pillar IS 'Marks if this keyword is the pillar for the cluster';
