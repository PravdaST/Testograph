-- OAuth State Tokens Table
-- Used to maintain user context during OAuth redirects (Google OAuth, etc.)
-- Tokens expire after 10 minutes for security

CREATE TABLE IF NOT EXISTS oauth_state_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google_search_console', etc.
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure token expires
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for fast lookup by state_token
CREATE INDEX idx_oauth_state_tokens_state_token ON oauth_state_tokens(state_token);

-- Index for cleanup of expired tokens
CREATE INDEX idx_oauth_state_tokens_expires_at ON oauth_state_tokens(expires_at);

-- Enable RLS
ALTER TABLE oauth_state_tokens ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - this table is only accessed server-side
-- Users should never directly query this table

-- Auto-delete expired tokens (cleanup job)
-- This function will be called periodically to remove old tokens
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_state_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM oauth_state_tokens
  WHERE expires_at < NOW();
END;
$$;

-- Comment
COMMENT ON TABLE oauth_state_tokens IS 'Temporary tokens for OAuth state management to maintain user context during OAuth redirects';
COMMENT ON COLUMN oauth_state_tokens.state_token IS 'Random secure token passed as OAuth state parameter';
COMMENT ON COLUMN oauth_state_tokens.user_id IS 'User ID to restore after OAuth redirect';
COMMENT ON COLUMN oauth_state_tokens.provider IS 'OAuth provider identifier (google_search_console, etc.)';
COMMENT ON COLUMN oauth_state_tokens.expires_at IS 'Token expiration (typically 10 minutes from creation)';
