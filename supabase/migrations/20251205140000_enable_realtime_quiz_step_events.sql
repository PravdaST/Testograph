-- Enable realtime on quiz_step_events table for live session monitoring
-- This allows the Quiz Analytics page to show live quiz sessions in real-time

-- Add quiz_step_events to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_step_events;
