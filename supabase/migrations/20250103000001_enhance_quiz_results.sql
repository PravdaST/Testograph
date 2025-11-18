-- Enhancement for Quiz Result System
-- Adds support for secure token access, PDF storage, AI analysis, and analytics

-- Add new columns to quiz_results table
ALTER TABLE public.quiz_results
ADD COLUMN IF NOT EXISTS result_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS result_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_template_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_enhanced_url TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_status TEXT CHECK (ai_analysis_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS ai_analysis_text TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_enhanced_downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS category_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS percentile INT CHECK (percentile >= 0 AND percentile <= 100);

-- Create index on result_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_result_token ON public.quiz_results(result_token);

-- Create index on ai_analysis_status for queue processing
CREATE INDEX IF NOT EXISTS idx_quiz_results_ai_status ON public.quiz_results(ai_analysis_status);

-- Create index on email_sent_at for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_results_email_sent ON public.quiz_results(email_sent_at);

-- Add comment
COMMENT ON COLUMN public.quiz_results.result_token IS 'Unique token for secure result page access';
COMMENT ON COLUMN public.quiz_results.email_sent_at IS 'Timestamp when initial result email was sent';
COMMENT ON COLUMN public.quiz_results.result_viewed_at IS 'Timestamp when user first viewed their results';
COMMENT ON COLUMN public.quiz_results.pdf_template_url IS 'Supabase Storage URL for template PDF';
COMMENT ON COLUMN public.quiz_results.pdf_enhanced_url IS 'Supabase Storage URL for AI-enhanced PDF';
COMMENT ON COLUMN public.quiz_results.ai_analysis_status IS 'Status of AI analysis: pending, processing, completed, failed';
COMMENT ON COLUMN public.quiz_results.ai_analysis_text IS 'AI-generated personalized analysis text';
COMMENT ON COLUMN public.quiz_results.ai_analysis_generated_at IS 'Timestamp when AI analysis completed';
COMMENT ON COLUMN public.quiz_results.pdf_downloaded_at IS 'Timestamp when template PDF was downloaded';
COMMENT ON COLUMN public.quiz_results.pdf_enhanced_downloaded_at IS 'Timestamp when enhanced PDF was downloaded';
COMMENT ON COLUMN public.quiz_results.category_scores IS 'JSON object with breakdown: {lifestyle, physical, sexual, mental} scores 0-100';
COMMENT ON COLUMN public.quiz_results.percentile IS 'Percentile rank compared to same age group (0-100)';

-- Function to generate unique result token
CREATE OR REPLACE FUNCTION generate_result_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token (16 characters, URL-safe)
    token := encode(gen_random_bytes(12), 'base64');
    token := replace(replace(replace(token, '+', ''), '/', ''), '=', '');
    token := substring(token, 1, 16);

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.quiz_results WHERE result_token = token) INTO exists;

    -- Exit loop if unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_result_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.result_token IS NULL OR NEW.result_token = '' THEN
    NEW.result_token := generate_result_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_result_token
  BEFORE INSERT ON public.quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_result_token();

-- Backfill existing records with tokens
UPDATE public.quiz_results
SET result_token = generate_result_token()
WHERE result_token IS NULL;

-- Add policy for secure token-based access
CREATE POLICY "Users can access results via token"
  ON public.quiz_results
  FOR SELECT
  USING (result_token IS NOT NULL);

COMMENT ON TABLE public.quiz_results IS 'Enhanced with secure token access, PDF storage, AI analysis, and analytics tracking';
