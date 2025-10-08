-- Create email_templates table for managing reusable email templates
-- Used by admin panel communication system

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  -- Body supports HTML and variables like {{name}}, {{email}}, {{date}}

  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Array of available variable names: ["name", "email", "date"]
  -- These will be automatically detected from the body

  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'welcome', 'promo', 'notification', 'reminder', 'other')),
  -- Categories:
  -- 'general' - General purpose emails
  -- 'welcome' - Welcome/onboarding emails
  -- 'promo' - Promotional emails
  -- 'notification' - System notifications
  -- 'reminder' - Reminders
  -- 'other' - Other custom types

  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Can be deactivated without deleting

  usage_count INTEGER NOT NULL DEFAULT 0,
  -- Track how many times this template has been used

  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  notes TEXT
  -- Optional notes about the template's purpose
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON public.email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by ON public.email_templates(created_by);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy: Service role can manage email templates
CREATE POLICY "Service role can manage email templates"
  ON public.email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policy: Admins can read email templates
CREATE POLICY "Admins can read email templates"
  ON public.email_templates
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Add comment
COMMENT ON TABLE public.email_templates IS 'Stores reusable email templates for admin communication system';

-- Insert default welcome template
INSERT INTO public.email_templates (name, subject, body, category, variables, created_by, notes)
VALUES (
  'Добре дошъл в Testograph',
  'Добре дошли в Testograph!',
  '<h2>Здравейте, {{name}}!</h2>
<p>Радваме се да Ви приветстваме в Testograph!</p>
<p>Вашият имейл адрес <strong>{{email}}</strong> беше успешно регистриран на {{date}}.</p>
<p>Ако имате въпроси, не се колебайте да се свържете с нас.</p>
<p>Поздрави,<br>Екипът на Testograph</p>',
  'welcome',
  '["name", "email", "date"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'Default welcome email template'
)
ON CONFLICT (name) DO NOTHING;
