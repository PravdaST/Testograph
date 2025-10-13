-- Create email_logs table for tracking all sent emails
-- Used by admin panel communication system for audit trail and history

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient information
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,

  -- Email content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  -- HTML body of the email

  -- Template reference (optional)
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  -- Store template name for historical record even if template is deleted

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  -- 'pending' - Queued but not sent yet
  -- 'sent' - Successfully sent
  -- 'failed' - Failed to send
  -- 'bounced' - Email bounced back

  error_message TEXT,
  -- Error details if status = 'failed'

  -- Admin tracking
  sent_by UUID NOT NULL,
  sent_by_email TEXT NOT NULL,
  -- Store email for historical record

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  -- Actual time email was sent (may differ from created_at for queued emails)

  opened_at TIMESTAMPTZ,
  -- Email open tracking (future feature)

  clicked_at TIMESTAMPTZ,
  -- Link click tracking (future feature)

  -- Metadata
  is_bulk BOOLEAN NOT NULL DEFAULT false,
  -- Whether this was part of a bulk campaign

  bulk_campaign_id UUID,
  -- Group emails from same bulk send

  metadata JSONB DEFAULT '{}'::jsonb
  -- Additional data: user agent, IP, custom fields
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_by ON public.email_logs(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON public.email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_is_bulk ON public.email_logs(is_bulk);
CREATE INDEX IF NOT EXISTS idx_email_logs_bulk_campaign_id ON public.email_logs(bulk_campaign_id);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all operations (RLS enabled but permissive for service role)
CREATE POLICY "Allow all operations on email_logs"
  ON public.email_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.email_logs IS 'Audit trail for all emails sent through admin communication system';

-- Create function to get email stats
CREATE OR REPLACE FUNCTION get_email_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_sent BIGINT,
  total_failed BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent') as total_sent,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
      2
    ) as success_rate
  FROM public.email_logs
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;
