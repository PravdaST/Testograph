-- Add RLS policy for quiz_step_events to enable Realtime subscriptions
-- Realtime requires anon/authenticated roles to have SELECT access

-- Drop policy if exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow realtime select for quiz_step_events" ON quiz_step_events;

-- Create SELECT policy for Realtime
CREATE POLICY "Allow realtime select for quiz_step_events"
ON quiz_step_events
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure RLS is enabled (required for policies to work)
ALTER TABLE quiz_step_events ENABLE ROW LEVEL SECURITY;
