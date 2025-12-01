-- =====================================================
-- CLEANUP LEGACY TABLES - Run in Supabase SQL Editor
-- =====================================================
-- These tables are from old versions and are no longer used
-- Current app uses: quiz_results_v2, meal_completions, workout_sessions, etc.

-- =====================================================
-- STEP 1: Check what exists (run this first)
-- =====================================================
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND (
  table_name LIKE '%_pro'
  OR table_name LIKE '%_app'
  OR table_name IN ('user_settings', 'profiles')
)
ORDER BY table_name;

-- =====================================================
-- STEP 2: Drop _pro tables (OLD PRO version)
-- =====================================================
DROP TABLE IF EXISTS daily_entries_pro CASCADE;
DROP TABLE IF EXISTS weekly_measurements_pro CASCADE;
DROP TABLE IF EXISTS chat_sessions_pro CASCADE;
DROP TABLE IF EXISTS chat_messages_pro CASCADE;

-- =====================================================
-- STEP 3: Drop _app tables (OLD mobile app version)
-- =====================================================
DROP TABLE IF EXISTS meal_plans_app CASCADE;
DROP TABLE IF EXISTS sleep_logs_app CASCADE;
DROP TABLE IF EXISTS exercise_logs_app CASCADE;
DROP TABLE IF EXISTS lab_results_app CASCADE;
DROP TABLE IF EXISTS analytics_events_app CASCADE;

-- =====================================================
-- STEP 4: Drop other legacy tables
-- =====================================================
DROP TABLE IF EXISTS user_settings CASCADE;

-- NOTE: DO NOT drop 'profiles' - it's managed by Supabase Auth
-- NOTE: DO NOT drop 'quiz_results' yet - still has fallback code

-- =====================================================
-- STEP 5: Verify cleanup
-- =====================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
