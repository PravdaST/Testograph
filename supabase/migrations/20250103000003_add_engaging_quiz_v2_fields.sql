-- Add Engaging Quiz V2 Fields (New 25-step quiz)
-- Adds support for new demographic, body composition, intimate, and solution fit questions
-- Also fixes data type mismatches (TEXT ranges instead of INTEGER)

-- First, change existing columns to TEXT to support ranges like "25-35", "160-170", etc.
ALTER TABLE public.quiz_results
  ALTER COLUMN age TYPE TEXT USING age::TEXT,
  ALTER COLUMN height TYPE TEXT USING height::TEXT,
  ALTER COLUMN weight TYPE TEXT USING weight::TEXT,
  ALTER COLUMN sleep TYPE TEXT USING sleep::TEXT;

-- Add new demographic fields
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS ed_problem TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS work_stress TEXT;

-- Add new body composition
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS body_fat TEXT;

-- Add intimate questions
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS sex_frequency TEXT,
  ADD COLUMN IF NOT EXISTS frustration TEXT,
  ADD COLUMN IF NOT EXISTS one_change TEXT;

-- Add solution fit questions
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS past_attempts TEXT,
  ADD COLUMN IF NOT EXISTS decision_criteria TEXT,
  ADD COLUMN IF NOT EXISTS vision TEXT;

-- Add Confidence Index results (if not added by previous migration)
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS confidence_index INTEGER CHECK (confidence_index >= 0 AND confidence_index <= 100),
  ADD COLUMN IF NOT EXISTS testosterone_estimate TEXT,
  ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('ниска', 'средна', 'висока'));

-- Add timeline predictions
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS timeline_day14 INTEGER,
  ADD COLUMN IF NOT EXISTS timeline_day30 INTEGER,
  ADD COLUMN IF NOT EXISTS timeline_day60 INTEGER,
  ADD COLUMN IF NOT EXISTS timeline_day90 INTEGER;

-- Add top issues
ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS top_issues JSONB DEFAULT '[]'::jsonb;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_confidence_index ON public.quiz_results(confidence_index);
CREATE INDEX IF NOT EXISTS idx_quiz_results_urgency_level ON public.quiz_results(urgency_level);
CREATE INDEX IF NOT EXISTS idx_quiz_results_ed_problem ON public.quiz_results(ed_problem);

-- Add comments for documentation
COMMENT ON COLUMN public.quiz_results.ed_problem IS 'ED problem type: performance, relationship, shame, confidence';
COMMENT ON COLUMN public.quiz_results.profession IS 'User profession/occupation';
COMMENT ON COLUMN public.quiz_results.work_stress IS 'Work stress level: low, medium, high';
COMMENT ON COLUMN public.quiz_results.body_fat IS 'Body fat percentage range';
COMMENT ON COLUMN public.quiz_results.sex_frequency IS 'Sexual activity frequency';
COMMENT ON COLUMN public.quiz_results.frustration IS 'Main frustration area';
COMMENT ON COLUMN public.quiz_results.one_change IS 'If could change one thing';
COMMENT ON COLUMN public.quiz_results.past_attempts IS 'Past attempts to improve';
COMMENT ON COLUMN public.quiz_results.decision_criteria IS 'Decision criteria for solution';
COMMENT ON COLUMN public.quiz_results.vision IS 'Vision of ideal outcome';
COMMENT ON COLUMN public.quiz_results.confidence_index IS 'Confidence Index score 0-100 (higher = better)';
COMMENT ON COLUMN public.quiz_results.testosterone_estimate IS 'Testosterone estimate: много нисък, нисък, среден, добър, отличен';
COMMENT ON COLUMN public.quiz_results.urgency_level IS 'Urgency level: ниска, средна, висока';
COMMENT ON COLUMN public.quiz_results.timeline_day14 IS 'Expected score improvement at day 14';
COMMENT ON COLUMN public.quiz_results.timeline_day30 IS 'Expected score improvement at day 30';
COMMENT ON COLUMN public.quiz_results.timeline_day60 IS 'Expected score improvement at day 60';
COMMENT ON COLUMN public.quiz_results.timeline_day90 IS 'Expected score improvement at day 90';
COMMENT ON COLUMN public.quiz_results.top_issues IS 'JSON array of top 3 priority issues';

COMMENT ON TABLE public.quiz_results IS 'Enhanced quiz results with V2 engaging quiz fields, Confidence Index, AI analysis, and PDF generation';
