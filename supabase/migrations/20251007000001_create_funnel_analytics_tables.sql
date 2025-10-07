-- Funnel Analytics Tables
-- Track user behavior and conversion through the sales funnel

-- Sessions table: Track each user's funnel journey
CREATE TABLE IF NOT EXISTS public.funnel_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_email TEXT,
    user_data JSONB DEFAULT '{}'::jsonb,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_step INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    offer_tier TEXT, -- 'premium', 'regular', 'digital', or null
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table: Track every interaction in the funnel
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES public.funnel_sessions(session_id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'step_entered', 'step_exited', 'button_clicked', 'skip_used', 'offer_viewed', 'exit_intent'
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_session_id ON public.funnel_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_entry_time ON public.funnel_sessions(entry_time);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_completed ON public.funnel_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_offer_tier ON public.funnel_sessions(offer_tier);

CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON public.funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON public.funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_events_step_number ON public.funnel_events(step_number);
CREATE INDEX IF NOT EXISTS idx_funnel_events_timestamp ON public.funnel_events(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE public.funnel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts on funnel_sessions"
    ON public.funnel_sessions
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on funnel_events"
    ON public.funnel_events
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all data (for analytics)
CREATE POLICY "Allow authenticated reads on funnel_sessions"
    ON public.funnel_sessions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads on funnel_events"
    ON public.funnel_events
    FOR SELECT
    TO authenticated
    USING (true);

-- Function to automatically update last_activity timestamp
CREATE OR REPLACE FUNCTION update_funnel_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.funnel_sessions
    SET last_activity = NOW()
    WHERE session_id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity on new events
CREATE TRIGGER trigger_update_funnel_session_last_activity
    AFTER INSERT ON public.funnel_events
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_session_last_activity();

-- Comments for documentation
COMMENT ON TABLE public.funnel_sessions IS 'Tracks each user''s journey through the sales funnel';
COMMENT ON TABLE public.funnel_events IS 'Tracks every interaction and event within the funnel';
COMMENT ON COLUMN public.funnel_sessions.session_id IS 'Unique session identifier generated on client';
COMMENT ON COLUMN public.funnel_sessions.user_data IS 'JSON object containing user information from form (firstName, age, etc.)';
COMMENT ON COLUMN public.funnel_sessions.exit_step IS 'Step number where user exited (null if still active or completed)';
COMMENT ON COLUMN public.funnel_sessions.completed IS 'True if user reached final step or made purchase';
COMMENT ON COLUMN public.funnel_sessions.offer_tier IS 'Which offer tier user engaged with (premium/regular/digital)';
COMMENT ON COLUMN public.funnel_events.event_type IS 'Type of event: step_entered, step_exited, button_clicked, skip_used, offer_viewed, exit_intent';
COMMENT ON COLUMN public.funnel_events.metadata IS 'Additional event data (button text, choice made, time spent, etc.)';
