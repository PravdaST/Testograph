-- Create table for caching received emails from IMAP
CREATE TABLE IF NOT EXISTS public.received_emails_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL, -- Email Message-ID header for deduplication
  subject TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  cc TEXT[],
  bcc TEXT[],
  reply_to TEXT,
  in_reply_to TEXT, -- For threading
  references TEXT[], -- For threading
  body_text TEXT,
  body_html TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of {filename, contentType, size, id}
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT ARRAY[]::TEXT[],
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_received_emails_message_id ON public.received_emails_cache(message_id);
CREATE INDEX IF NOT EXISTS idx_received_emails_from ON public.received_emails_cache(from_email);
CREATE INDEX IF NOT EXISTS idx_received_emails_to ON public.received_emails_cache(to_email);
CREATE INDEX IF NOT EXISTS idx_received_emails_received_at ON public.received_emails_cache(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_received_emails_is_read ON public.received_emails_cache(is_read);
CREATE INDEX IF NOT EXISTS idx_received_emails_in_reply_to ON public.received_emails_cache(in_reply_to);

-- Enable RLS
ALTER TABLE public.received_emails_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies - только админи могат да четат
CREATE POLICY "Admins can view received emails"
  ON public.received_emails_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can insert received emails"
  ON public.received_emails_cache
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update received emails"
  ON public.received_emails_cache
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_received_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_received_emails_updated_at_trigger
  BEFORE UPDATE ON public.received_emails_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_received_emails_updated_at();

-- Comment on table
COMMENT ON TABLE public.received_emails_cache IS 'Cache table for emails received via IMAP from contact@testograph.eu';
