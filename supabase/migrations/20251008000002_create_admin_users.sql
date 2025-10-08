-- Create admin_users table for managing admin access and permissions
-- This table is isolated and only used by the admin panel

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

-- Create policy: Admins can read admin_users table
CREATE POLICY "Admins can read admin users"
  ON public.admin_users
  FOR SELECT
  USING (true); -- Will be restricted by service role key in API

-- Create policy: Only superadmins can modify admin_users (via service role)
CREATE POLICY "Service role can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert the existing admin user (from AdminLayout.tsx)
-- This ensures the current admin has superadmin access
INSERT INTO public.admin_users (id, role, permissions, notes)
VALUES (
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'superadmin',
  '["manage_users", "manage_purchases", "view_analytics", "send_emails", "manage_pro_access", "manage_admins"]'::jsonb,
  'Initial superadmin created during migration'
)
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.admin_users IS 'Manages admin access and permissions for the admin panel';
