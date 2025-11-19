-- Add RLS policies for oauth_state_tokens
-- This table is accessed server-side but still needs RLS policies

-- Policy: Allow authenticated users to insert their own state tokens
CREATE POLICY "Users can insert their own state tokens"
ON oauth_state_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow reading state tokens (needed for callback verification)
-- This is safe because state tokens are random UUIDs and expire quickly
CREATE POLICY "Allow reading state tokens for verification"
ON oauth_state_tokens
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete their own state tokens
CREATE POLICY "Users can delete their own state tokens"
ON oauth_state_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Comment
COMMENT ON POLICY "Users can insert their own state tokens" ON oauth_state_tokens
IS 'Allows users to create state tokens for their own OAuth flows';

COMMENT ON POLICY "Allow reading state tokens for verification" ON oauth_state_tokens
IS 'Allows server-side callback to verify state tokens. Safe because tokens are random and short-lived';

COMMENT ON POLICY "Users can delete their own state tokens" ON oauth_state_tokens
IS 'Allows cleanup of used state tokens after OAuth completion';
