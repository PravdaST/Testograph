-- Add breakdown_context column to quiz_results table
ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS breakdown_context INTEGER DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN quiz_results.breakdown_context IS 'Context section score: commitment, vision, trust questions (0-10)';
