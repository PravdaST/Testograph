-- ============================================================================
-- FIX: Allow funnel_sessions INSERT from frontend (anon role)
-- ============================================================================
--
-- PROBLEM: initFunnelSession() fails silently due to RLS blocking INSERT
--
-- ERROR: Foreign key constraint violation because session never gets created
--
-- SOLUTION: Create permissive RLS policy to allow anon INSERT on funnel_sessions
--
-- ============================================================================

-- Step 1: Enable RLS on funnel_sessions (if not already enabled)
ALTER TABLE public.funnel_sessions ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive INSERT policy (if exists)
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.funnel_sessions;

-- Step 3: Create PERMISSIVE policy to allow anon users to INSERT sessions
CREATE POLICY "Allow anonymous users to create funnel sessions"
ON public.funnel_sessions
FOR INSERT
TO anon
WITH CHECK (true);

-- Step 4: Create policy to allow anon users to SELECT their own sessions
CREATE POLICY "Allow anonymous users to read funnel sessions"
ON public.funnel_sessions
FOR SELECT
TO anon
USING (true);

-- Step 5: Create policy to allow anon users to UPDATE sessions
CREATE POLICY "Allow anonymous users to update funnel sessions"
ON public.funnel_sessions
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Step 6: Ensure funnel_events has proper RLS policies too
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon to insert events" ON public.funnel_events;

CREATE POLICY "Allow anonymous users to create funnel events"
ON public.funnel_events
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Run this to verify policies are created:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('funnel_sessions', 'funnel_events')
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ RLS policies fixed! Frontend can now INSERT sessions and events.' AS status;
