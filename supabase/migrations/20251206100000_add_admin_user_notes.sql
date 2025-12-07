-- Create table for admin notes on users
CREATE TABLE IF NOT EXISTS admin_user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_user_notes_email ON admin_user_notes(user_email);

-- Enable RLS
ALTER TABLE admin_user_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
DROP POLICY IF EXISTS "Service role can manage admin_user_notes" ON admin_user_notes;
CREATE POLICY "Service role can manage admin_user_notes"
ON admin_user_notes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create table for user tags
CREATE TABLE IF NOT EXISTS admin_user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  tag TEXT NOT NULL,
  color TEXT DEFAULT 'gray',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, tag)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_user_tags_email ON admin_user_tags(user_email);

-- Enable RLS
ALTER TABLE admin_user_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
DROP POLICY IF EXISTS "Service role can manage admin_user_tags" ON admin_user_tags;
CREATE POLICY "Service role can manage admin_user_tags"
ON admin_user_tags
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
