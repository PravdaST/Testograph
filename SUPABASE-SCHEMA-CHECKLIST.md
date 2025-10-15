# 🗄️ SUPABASE DATABASE SCHEMA - Complete Checklist

**Last Updated:** 2025-01-15
**Project:** Testograph Ecosystem
**Purpose:** Reference document for all Supabase tables used across the project

---

## 📊 DATABASE TABLES

### 🎯 CORE - Lead Magnet & Quiz

#### 1. `quiz_results`
**Purpose:** Stores all quiz submissions from /test page
**Created by:** `supabase-schema.sql`
**Used by:** TForecastFormMultiStep, Free PDF generation

**Schema:**
- `id` (UUID, PK)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- `source` (TEXT) - Default: 'engaging_quiz'
- **Demographics:** `age`, `height`, `weight`
- **Lifestyle:** `sleep`, `alcohol`, `nicotine`, `diet`, `stress`
- **Training:** `training_frequency`, `training_type`, `recovery`, `supplements`
- **Symptoms:** `libido`, `morning_erection`, `morning_energy`, `concentration`, `mood`, `muscle_mass`
- **Contact:** `first_name`, `email`
- **Results:** `score`, `testosterone_level`, `testosterone_category`, `risk_level`, `recommended_tier`
- **Tracking:** `user_agent`, `ip_address`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`

**Indexes:**
- `idx_quiz_results_created_at`
- `idx_quiz_results_email`
- `idx_quiz_results_source`
- `idx_quiz_results_score`
- `idx_quiz_results_risk_level`

**RLS Policies:**
- Service role: Full access
- Anonymous: INSERT only
- Authenticated: SELECT own results (by email)

---

#### 2. `funnel_sessions`
**Purpose:** Tracks each user's journey through the waiting room funnel
**Created by:** `20251007000001_create_funnel_analytics_tables.sql`
**Updated by:** `20250115000001_add_missing_funnel_columns.sql` ⚠️ NEW

**Schema:**
- `id` (UUID, PK)
- `session_id` (TEXT, UNIQUE) - Generated client-side
- `user_email` (TEXT)
- `user_data` (JSONB) - firstName, age, etc.
- `entry_time`, `last_activity` (TIMESTAMPTZ)
- `exit_step` (INTEGER) - Where user left
- `completed` (BOOLEAN) - Reached final step
- `offer_tier` (TEXT) - 'premium', 'regular', 'digital', or null
- **NEW:** `current_step` (INTEGER) - Current step (1-12)
- **NEW:** `max_step_reached` (INTEGER) - Highest step reached
- **NEW:** `utm_data` (JSONB) - UTM parameters
- **NEW:** `user_agent` (TEXT) - Browser/device info
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_funnel_sessions_session_id`
- `idx_funnel_sessions_entry_time`
- `idx_funnel_sessions_completed`
- `idx_funnel_sessions_offer_tier`
- `idx_funnel_sessions_current_step` ⚠️ NEW
- `idx_funnel_sessions_max_step_reached` ⚠️ NEW

**RLS Policies:**
- Anonymous: INSERT
- Authenticated: SELECT all

**Trigger:**
- Auto-updates `last_activity` when funnel_events inserted

---

#### 3. `funnel_events`
**Purpose:** Tracks every interaction in the funnel
**Created by:** `20251007000001_create_funnel_analytics_tables.sql`

**Schema:**
- `id` (UUID, PK)
- `session_id` (TEXT, FK to funnel_sessions)
- `step_number` (INTEGER)
- `event_type` (TEXT) - 'step_entered', 'step_exited', 'button_clicked', 'skip_used', 'offer_viewed', 'exit_intent', 'choice_made'
- `metadata` (JSONB) - buttonText, choiceValue, timeSpentSeconds, etc.
- `timestamp` (TIMESTAMPTZ)

**Indexes:**
- `idx_funnel_events_session_id`
- `idx_funnel_events_event_type`
- `idx_funnel_events_step_number`
- `idx_funnel_events_timestamp`

**RLS Policies:**
- Anonymous: INSERT
- Authenticated: SELECT all

---

### 💬 CHAT SYSTEM

#### 4. `chat_sessions` (FREE)
**Purpose:** Chat sessions for free lead magnet users
**Created by:** `20241201000001_create_chat_tables.sql`

**Schema:**
- `id` (UUID, PK)
- `email` (TEXT, NOT NULL)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Additional Fields (from PDF processing):**
- `pdf_file_path` (TEXT)
- `pdf_file_url` (TEXT)
- `pdf_status` (TEXT) - 'pending', 'processing', 'ready', 'failed'
- `pdf_metadata` (JSONB)
- `quiz_result_id` (UUID, FK to quiz_results)

**Indexes:**
- `idx_chat_sessions_email`

**RLS:** Permissive (SELECT, INSERT, UPDATE for all)

---

#### 5. `chat_messages` (FREE)
**Purpose:** Messages for free chat
**Created by:** `20241201000001_create_chat_tables.sql`

**Schema:**
- `id` (UUID, PK)
- `session_id` (UUID, FK to chat_sessions)
- `role` (TEXT) - 'user' or 'assistant'
- `content` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_chat_messages_session_id`
- `idx_chat_messages_created_at`

**RLS:** Permissive (SELECT, INSERT, UPDATE for all)

---

#### 6. `chat_sessions_pro` (PRO)
**Purpose:** Chat sessions for PRO subscribers
**Used by:** `supabase/functions/chat-pro-assistant`

**Schema:** Similar to `chat_sessions` but for PRO users

---

#### 7. `chat_messages_pro` (PRO)
**Purpose:** Messages for PRO chat
**Used by:** `supabase/functions/chat-pro-assistant`

**Schema:** Similar to `chat_messages` but for PRO users

---

### 👤 ADMIN SYSTEM

#### 8. `admin_users`
**Purpose:** Manages admin access and permissions
**Created by:** `20251008000002_create_admin_users.sql`

**Schema:**
- `id` (UUID, PK, FK to auth.users)
- `role` (TEXT) - 'superadmin', 'admin', 'viewer'
- `permissions` (JSONB) - Array of permission strings
  - Permissions: `manage_users`, `manage_purchases`, `view_analytics`, `send_emails`, `manage_pro_access`, `manage_admins`
- `created_at` (TIMESTAMPTZ)
- `created_by` (UUID, FK to auth.users)
- `last_active_at` (TIMESTAMPTZ)
- `notes` (TEXT)

**Indexes:**
- `idx_admin_users_role`

**RLS:**
- Admins: SELECT
- Service role: Full access

**Initial Admin:**
- UUID: `e4ea078b-30b2-4347-801f-6d26a87318b6`
- Role: superadmin

---

#### 9. `email_logs`
**Purpose:** Audit trail for all sent emails
**Created by:** `20251014000001_create_email_logs.sql`

**Schema:**
- `id` (UUID, PK)
- `recipient_email`, `recipient_name` (TEXT)
- `subject`, `body` (TEXT)
- `template_id` (UUID, FK to email_templates)
- `template_name` (TEXT)
- `status` (TEXT) - 'pending', 'sent', 'failed', 'bounced'
- `error_message` (TEXT)
- `sent_by` (UUID), `sent_by_email` (TEXT)
- `created_at`, `sent_at`, `opened_at`, `clicked_at` (TIMESTAMPTZ)
- `is_bulk` (BOOLEAN)
- `bulk_campaign_id` (UUID)
- `metadata` (JSONB)

**Indexes:**
- `idx_email_logs_recipient_email`
- `idx_email_logs_status`
- `idx_email_logs_sent_by`
- `idx_email_logs_template_id`
- `idx_email_logs_created_at`
- `idx_email_logs_sent_at`
- `idx_email_logs_is_bulk`
- `idx_email_logs_bulk_campaign_id`

**Function:**
- `get_email_stats(start_date, end_date)` - Returns email statistics

---

#### 10. `received_emails_cache`
**Purpose:** Cache for emails received from contact@testograph.eu (IMAP)
**Created by:** `20251015000001_create_received_emails_cache.sql`

**Schema:**
- `id` (UUID, PK)
- `message_id` (TEXT, UNIQUE) - For deduplication
- `subject`, `from_email`, `from_name`, `to_email`, `to_name` (TEXT)
- `cc`, `bcc` (TEXT[])
- `reply_to`, `in_reply_to` (TEXT)
- `email_references` (TEXT[]) - For threading
- `body_text`, `body_html` (TEXT)
- `attachments` (JSONB)
- `is_read`, `is_starred`, `is_replied` (BOOLEAN)
- `labels` (TEXT[])
- `received_at`, `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_received_emails_message_id`
- `idx_received_emails_from`
- `idx_received_emails_to`
- `idx_received_emails_received_at`
- `idx_received_emails_is_read`
- `idx_received_emails_in_reply_to`

**RLS:** Admins only (SELECT, INSERT, UPDATE)

**Trigger:** Auto-updates `updated_at`

---

#### 11. `email_templates`
**Purpose:** Reusable email templates for admin communication
**Created by:** `20251008000003_create_email_templates.sql` (presumed)

**Schema:** (Not verified - check if table exists)
- `id` (UUID, PK)
- `name` (TEXT)
- `subject` (TEXT)
- `body` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

### 🛒 PURCHASES & PRO ACCESS (testograph-app)

#### 12. `purchases`
**Purpose:** Records of product purchases
**Used by:** testograph-app dashboard

**Schema:** (Verify in testograph-app schema)
- Purchase details
- User reference
- Product info
- Payment status

---

#### 13. `profiles`
**Purpose:** User profiles for PRO members
**Used by:** testograph-app, PRO chat assistant

**Schema:** (Verify in testograph-app schema)
- User personal info
- Subscription status
- Settings

---

#### 14. `daily_entries_pro`
**Purpose:** Daily tracking entries for PRO users
**Used by:** PRO chat assistant for personalized recommendations

**Schema:** (Verify in testograph-app schema)
- Daily metrics (sleep, training, etc.)
- Notes
- Timestamps

---

### 📱 TESTOGRAPH APP - Additional Tables

#### 15. `user_supplements_app`
**Purpose:** User's supplement regimen
**Used by:** Supplement Timing feature

---

#### 16. `supplement_logs_app`
**Purpose:** Log of supplement intake
**Used by:** Supplement tracking

---

#### 17. `supplement_settings_app`
**Purpose:** User preferences for supplement timing
**Used by:** Supplement Timing feature

---

#### 18. `sleep_logs_app`
**Purpose:** Sleep tracking data
**Used by:** Sleep Protocol feature

---

#### 19. `lab_locations_app`
**Purpose:** Laboratory locations database
**Used by:** Lab Finder feature

---

#### 20. `workout_programs_app`
**Purpose:** Workout programs/templates
**Used by:** Exercise Guide

---

#### 21. `exercise_logs_app`
**Purpose:** Exercise session logs
**Used by:** Exercise tracking

---

#### 22. `exercise_favorites_app`
**Purpose:** User's favorite exercises
**Used by:** Exercise Guide

---

#### 23. `meal_plans_app`
**Purpose:** User meal plans
**Used by:** Meal Planner feature

---

## ⚠️ CRITICAL MIGRATION NEEDED

**Before deploying the analytics fix, you MUST run this migration:**

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Copy and run:
D:\Automation\All Testograph Ecosystem\Testograph\supabase\migrations\20250115000001_add_missing_funnel_columns.sql
```

**Why:** The code expects `current_step` and `max_step_reached` columns, but they don't exist in the original schema. Without this migration, funnel analytics will show incorrect progress ("Step 1/12 8%" for everyone).

---

## 📝 MAINTENANCE CHECKLIST

### When adding a new table:
- [ ] Create migration file in `/supabase/migrations/`
- [ ] Add RLS policies
- [ ] Add indexes for common queries
- [ ] Add comments for documentation
- [ ] Update this checklist

### Regular checks:
- [ ] Review RLS policies for security
- [ ] Monitor table sizes
- [ ] Check index usage (Supabase Dashboard → Database → Index Usage)
- [ ] Verify backup schedule

---

## 🔗 RELATED FILES

- **Main Schema:** `supabase-schema.sql`
- **Migrations:** `supabase/migrations/`
- **Analytics Tracker:** `lib/analytics/funnel-tracker.ts`
- **Admin Permissions:** `lib/admin/permissions.ts`

---

**End of Schema Checklist**
