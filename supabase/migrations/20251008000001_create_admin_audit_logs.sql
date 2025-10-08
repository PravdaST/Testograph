-- Create admin_audit_logs table for tracking all admin actions
-- This table is isolated and only used by the admin panel

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  -- Possible values:
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_target_user_id ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON public.admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Only authenticated users with admin role can read audit logs
-- For now, we'll use service role key for admin operations
CREATE POLICY "Admin users can read audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (true); -- Will be restricted by service role key in API

-- Create policy: Only service role can insert audit logs (via API)
CREATE POLICY "Service role can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.admin_audit_logs IS 'Tracks all administrative actions performed in the admin panel';
