-- Restore RLS policies for email-based chat system
-- The chat system uses email-based identification (not Supabase Auth)
-- So we need to allow public access through RLS, with security handled at application level

-- Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_sessions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.chat_sessions;
DROP POLICY IF EXISTS "Enable update for all users" ON public.chat_sessions;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.chat_sessions;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable update for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.chat_messages;

-- Ensure RLS is enabled
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
-- Since this is email-based (not auth-based), we allow public access
-- Security is handled by the application logic (users only query their own email)
CREATE POLICY "Enable read access for all users"
  ON public.chat_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON public.chat_sessions
  FOR UPDATE
  USING (true);

-- Create policies for chat_messages
CREATE POLICY "Enable read access for all users"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Note: Security considerations
-- This email-based chat system relies on:
-- 1. Users only querying their own email in the application code
-- 2. Sensitive medical data (PDFs) stored in secure storage buckets with separate RLS
-- 3. Edge Functions using service role key for sensitive operations
-- 4. Application-level validation preventing cross-email data access
