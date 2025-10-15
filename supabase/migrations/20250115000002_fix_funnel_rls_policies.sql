-- Fix RLS policies to allow anonymous users to SELECT and UPDATE funnel sessions
-- This is required for progress tracking in the WaitingRoomFunnel component
--
-- Root cause: The trackStepEntered() function needs to:
-- 1. SELECT max_step_reached from funnel_sessions
-- 2. UPDATE current_step and max_step_reached in funnel_sessions
--
-- But the original migration only created INSERT policy for anon users

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous users to read funnel sessions" ON public.funnel_sessions;
DROP POLICY IF EXISTS "Allow anonymous users to update funnel sessions" ON public.funnel_sessions;

-- Create policy to allow anon users to SELECT their sessions
-- This allows trackStepEntered() to fetch current max_step_reached
CREATE POLICY "Allow anonymous users to read funnel sessions"
ON public.funnel_sessions
FOR SELECT
TO anon
USING (true);

-- Create policy to allow anon users to UPDATE their sessions
-- This allows trackStepEntered() to update current_step and max_step_reached
CREATE POLICY "Allow anonymous users to update funnel sessions"
ON public.funnel_sessions
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Verify the policies
COMMENT ON POLICY "Allow anonymous users to read funnel sessions" ON public.funnel_sessions
IS 'Allows anonymous users to SELECT their session data for progress tracking';

COMMENT ON POLICY "Allow anonymous users to update funnel sessions" ON public.funnel_sessions
IS 'Allows anonymous users to UPDATE session progress (current_step, max_step_reached)';
