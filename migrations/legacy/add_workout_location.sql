ALTER TABLE quiz_results_v2 ADD COLUMN IF NOT EXISTS workout_location TEXT CHECK (workout_location IN ('home', 'gym'));
