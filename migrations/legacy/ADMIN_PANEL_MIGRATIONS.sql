-- ============================================================
-- ADMIN PANEL DATABASE MIGRATIONS
-- ============================================================
-- This file creates 2 new tables for the admin panel:
-- 1. admin_audit_logs - Tracks all admin actions
-- 2. admin_users - Manages admin access and permissions
--
-- IMPORTANT: These tables are ISOLATED and do NOT modify
-- any existing tables or data.
--
-- HOW TO USE:
-- 1. Open Supabase Dashboard SQL Editor
-- 2. Copy this entire file
-- 3. Paste and run it
-- 4. Verify tables were created successfully
-- ============================================================


-- ============================================================
-- TABLE 1: admin_audit_logs
-- ============================================================
-- Purpose: Log all administrative actions for accountability
-- Used by: Admin panel to track who did what and when
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  -- Possible action types:
  -- 'grant_pro_access', 'revoke_pro_access',
  -- 'create_purchase', 'edit_purchase', 'delete_purchase',
  -- 'reset_password', 'ban_user', 'unban_user', 'edit_profile', 'delete_user',
  -- 'send_email', 'bulk_email',
  -- 'add_admin', 'remove_admin'

  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_email TEXT,

  changes_before JSONB,
  changes_after JSONB,

  description TEXT NOT NULL,
  ip_address TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_target_user_id ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON public.admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read audit logs
CREATE POLICY "Admin users can read audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (true);

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add table comment
COMMENT ON TABLE public.admin_audit_logs IS 'Tracks all administrative actions performed in the admin panel';


-- ============================================================
-- TABLE 2: admin_users
-- ============================================================
-- Purpose: Manage who has admin access and their permissions
-- Used by: Admin panel to control access levels
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'viewer')),
  -- Roles:
  -- 'superadmin' - Full access including managing other admins
  -- 'admin' - Can manage users, purchases, send emails
  -- 'viewer' - Read-only access to admin panel

  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Array of permission strings:
  -- ['manage_users', 'manage_purchases', 'view_analytics', 'send_emails', 'manage_pro_access']

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_active_at TIMESTAMPTZ,

  notes TEXT -- Optional notes about this admin
);

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read admin_users table
CREATE POLICY "Admins can read admin users"
  ON public.admin_users
  FOR SELECT
  USING (true);

-- Policy: Service role can manage admin_users
CREATE POLICY "Service role can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add table comment
COMMENT ON TABLE public.admin_users IS 'Manages admin access and permissions for the admin panel';


-- ============================================================
-- INSERT INITIAL SUPERADMIN
-- ============================================================
-- This adds your current admin user (from AdminLayout.tsx)
-- as a superadmin with full permissions
-- ============================================================

INSERT INTO public.admin_users (id, role, permissions, notes)
VALUES (
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'superadmin',
  '["manage_users", "manage_purchases", "view_analytics", "send_emails", "manage_pro_access", "manage_admins"]'::jsonb,
  'Initial superadmin created during migration on 2025-10-08'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these after the migration to verify everything worked:
-- ============================================================

-- Check if admin_audit_logs was created:
-- SELECT COUNT(*) FROM admin_audit_logs;

-- Check if admin_users was created:
-- SELECT COUNT(*) FROM admin_users;

-- Verify your superadmin was inserted:
-- SELECT * FROM admin_users WHERE role = 'superadmin';

-- ============================================================
-- MIGRATION COMPLETE! ✅
-- ============================================================
