-- Add profile picture and goal fields to quiz_results_v2 table

ALTER TABLE quiz_results_v2
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS program_end_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to set end_date as 30 days after completed_at
UPDATE quiz_results_v2
SET program_end_date = completed_at + INTERVAL '30 days'
WHERE program_end_date IS NULL;

-- Add comment
COMMENT ON COLUMN quiz_results_v2.profile_picture_url IS 'URL to user profile picture';
COMMENT ON COLUMN quiz_results_v2.goal IS 'User goal for the 30-day program';
COMMENT ON COLUMN quiz_results_v2.program_end_date IS 'Expected end date of the 30-day program';
