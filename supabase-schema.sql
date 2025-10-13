-- Testograph Engaging Quiz Results Table
-- This table stores all quiz submissions from /test

CREATE TABLE IF NOT EXISTS quiz_results (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Source tracking
  source TEXT DEFAULT 'engaging_quiz' NOT NULL,

  -- Demographics
  age INTEGER,
  height INTEGER, -- in cm
  weight INTEGER, -- in kg

  -- Lifestyle
  sleep NUMERIC(3,1), -- can be decimal like 7.5 hours
  alcohol TEXT, -- never, rarely, weekly, often
  nicotine TEXT, -- none, cigarettes, iqos, vape
  diet TEXT, -- balanced, high-protein, junk, vegan, keto
  stress INTEGER, -- 1-10 scale

  -- Training
  training_frequency TEXT, -- none, 1-2, 3-4, 5-6, 6+
  training_type TEXT, -- none, strength, cardio, hiit, sports
  recovery TEXT, -- very-fast, fast, normal, slow, very-slow
  supplements TEXT, -- free text, can be null

  -- Symptoms Part 1
  libido INTEGER, -- 1-10 scale
  morning_erection TEXT, -- every-morning, often, sometimes, rarely, never
  morning_energy INTEGER, -- 1-10 scale

  -- Symptoms Part 2
  concentration INTEGER, -- 1-10 scale
  mood TEXT, -- positive, stable, variable, negative
  muscle_mass TEXT, -- increased, same, decreased

  -- Contact Information
  first_name TEXT,
  email TEXT,

  -- Calculated Results
  score INTEGER, -- risk index 0-100
  testosterone_level NUMERIC(4,1), -- estimated value in nmol/L
  testosterone_category TEXT, -- low, normal, high
  risk_level TEXT, -- good, moderate, critical
  recommended_tier TEXT, -- premium, regular, digital

  -- Additional metadata
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_quiz_results_source ON quiz_results(source);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score);
CREATE INDEX IF NOT EXISTS idx_quiz_results_risk_level ON quiz_results(risk_level);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quiz_results_updated_at
  BEFORE UPDATE ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- Allow service role to do everything
CREATE POLICY "Service role can do everything" ON quiz_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous inserts (for quiz submissions)
CREATE POLICY "Allow anonymous inserts" ON quiz_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Optional: Allow authenticated users to view their own results
CREATE POLICY "Users can view own results" ON quiz_results
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Create a view for analytics (aggregated data only, no PII)
CREATE OR REPLACE VIEW quiz_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  source,
  COUNT(*) as submissions,
  AVG(score) as avg_score,
  AVG(testosterone_level) as avg_testosterone,
  COUNT(*) FILTER (WHERE risk_level = 'good') as good_count,
  COUNT(*) FILTER (WHERE risk_level = 'moderate') as moderate_count,
  COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_count,
  AVG(age) as avg_age,
  COUNT(*) FILTER (WHERE alcohol = 'never') as no_alcohol_count
FROM quiz_results
GROUP BY DATE_TRUNC('day', created_at), source
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON quiz_analytics TO authenticated;

-- Add comment to table
COMMENT ON TABLE quiz_results IS 'Stores results from the Testograph engaging quiz (/test)';
