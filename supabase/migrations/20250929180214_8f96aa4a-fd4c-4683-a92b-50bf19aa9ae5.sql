-- Remove overly permissive RLS policies that expose sensitive medical data
DROP POLICY IF EXISTS "Allow all operations on chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON public.chat_messages;

-- These tables should have NO public access policies
-- All access must go through Edge Functions using the service role key
-- This protects sensitive email addresses and medical PDF content from unauthorized access

-- Ensure RLS is enabled (it should already be, but let's be explicit)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;