-- Create table for admin alerts/notifications
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL, -- 'completion_rate', 'daily_sessions', 'conversion_rate', 'abandoned_rate'
  condition TEXT NOT NULL, -- 'below', 'above', 'change_percent'
  threshold NUMERIC NOT NULL,
  category TEXT DEFAULT 'all', -- 'all', 'libido', 'muscle', 'energy'
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for alert history (when alerts were triggered)
CREATE TABLE IF NOT EXISTS admin_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES admin_alerts(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_alerts_active ON admin_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_alert_history_alert ON admin_alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_admin_alert_history_unread ON admin_alert_history(is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alert_history ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
DROP POLICY IF EXISTS "Service role can manage admin_alerts" ON admin_alerts;
CREATE POLICY "Service role can manage admin_alerts"
ON admin_alerts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage admin_alert_history" ON admin_alert_history;
CREATE POLICY "Service role can manage admin_alert_history"
ON admin_alert_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
