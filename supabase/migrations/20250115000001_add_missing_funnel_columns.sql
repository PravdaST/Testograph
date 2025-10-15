-- Add missing columns to funnel_sessions table
-- These columns are required for proper progress tracking in admin analytics

-- Add columns
ALTER TABLE public.funnel_sessions
ADD COLUMN IF NOT EXISTS current_step INTEGER,
ADD COLUMN IF NOT EXISTS max_step_reached INTEGER,
ADD COLUMN IF NOT EXISTS utm_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_current_step ON public.funnel_sessions(current_step);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_max_step_reached ON public.funnel_sessions(max_step_reached);

-- Add comments for documentation
COMMENT ON COLUMN public.funnel_sessions.current_step IS 'Current step where user is now (1-12)';
COMMENT ON COLUMN public.funnel_sessions.max_step_reached IS 'Highest step user has reached - used for progress calculation in analytics';
COMMENT ON COLUMN public.funnel_sessions.utm_data IS 'UTM tracking parameters (source, medium, campaign, etc.) stored as JSON';
COMMENT ON COLUMN public.funnel_sessions.user_agent IS 'User agent string for device/browser tracking';
