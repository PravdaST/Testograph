-- Create table for saved filters/segments
CREATE TABLE IF NOT EXISTS admin_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filter_config JSONB NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_default BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_saved_filters_name ON admin_saved_filters(name);
CREATE INDEX IF NOT EXISTS idx_admin_saved_filters_created_by ON admin_saved_filters(created_by);

-- Enable RLS
ALTER TABLE admin_saved_filters ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
DROP POLICY IF EXISTS "Service role can manage admin_saved_filters" ON admin_saved_filters;
CREATE POLICY "Service role can manage admin_saved_filters"
ON admin_saved_filters
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
