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

-- Insert default email templates with beautiful HTML designs
INSERT INTO public.email_templates (name, subject, body, category, variables, created_by, notes)
VALUES
-- Welcome Template
(
  'Добре дошъл в Testograph',
  'Добре дошли в Testograph!',
  '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Добре дошли!</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin-top: 0;">Здравейте, {{name}}!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Радваме се да Ви приветстваме в <strong>Testograph</strong> - Вашата платформа за професионални тестове!</p>
        <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; color: #555;"><strong>📧 Имейл:</strong> {{email}}</p>
          <p style="margin: 10px 0 0 0; color: #555;"><strong>📅 Дата:</strong> {{date}}</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Започнете да използвате всички функции на платформата и открийте света на интерактивните тестове!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://testograph.eu" style="display: inline-block; background-color: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Към Testograph</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 14px;">
        <p style="margin: 0;">Ако имате въпроси, свържете се с нас на <a href="mailto:support@testograph.eu" style="color: #667eea;">support@testograph.eu</a></p>
      </div>
    </div>
  </div>',
  'welcome',
  '["name", "email", "date"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'Beautified welcome template for new users with gradient header'
),

-- Promo Template
(
  'Специална Промоция',
  '🎁 Специална Оферта - {{discount}}% Отстъпка!',
  '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff5e6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 36px;">🎁 СПЕЦИАЛНА ПРОМОЦИЯ</h1>
        <p style="color: white; font-size: 20px; margin: 10px 0 0 0;">Само за теб, {{name}}!</p>
      </div>
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #ff6b6b; color: white; padding: 20px 40px; border-radius: 50px; font-size: 32px; font-weight: bold;">
            {{discount}}% ОТСТЪПКА
          </div>
        </div>
        <p style="color: #555; font-size: 18px; line-height: 1.6; text-align: center;">Специално за нашите ценни клиенти!</p>
        <div style="background-color: #fff5f5; border: 2px dashed #ff6b6b; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">ПРОМО КОД:</p>
          <p style="margin: 0; color: #ff6b6b; font-size: 28px; font-weight: bold; letter-spacing: 2px;">{{code}}</p>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center;">⏰ Валидно до {{date}}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://testograph.eu" style="display: inline-block; background-color: #ff6b6b; color: white; padding: 15px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px;">ИЗПОЛЗВАЙ СЕГА</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 14px;">
        <p style="margin: 0;">Не пропускайте тази уникална възможност! 🚀</p>
      </div>
    </div>
  </div>',
  'promo',
  '["name", "discount", "code", "date"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'Promotional email template with discount code and expiry date'
),

-- Notification Template
(
  'Важна Нотификация',
  '🔔 Важно Съобщение - {{title}}',
  '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #e8f4f8;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #667eea 0%, #48c6ef 100%); padding: 30px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔔</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">Важна Нотификация</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin-top: 0; border-bottom: 3px solid #667eea; padding-bottom: 10px;">{{title}}</h2>
        <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; color: #555; font-size: 16px; line-height: 1.6;">Здравейте, {{name}}!</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.8;">{{message}}</p>
        <div style="background-color: #fffbea; border: 1px solid #ffd93d; padding: 15px; margin: 25px 0; border-radius: 5px;">
          <p style="margin: 0; color: #666; font-size: 14px;"><strong>⚠️ Забележка:</strong> Моля, запазете този имейл за бъдеща справка.</p>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 14px;">
        <p style="margin: 0;">Благодарим за вниманието! 💙</p>
      </div>
    </div>
  </div>',
  'notification',
  '["name", "title", "message"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'Important notification template with highlighted message'
),

-- Reminder Template
(
  'Напомняне',
  '⏰ Напомняне: {{subject}}',
  '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff4e6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
        <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Напомняне</h1>
      </div>
      <div style="padding: 40px 30px;">
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Здравейте, {{name}}!</p>
        <div style="background-color: #fff9e6; border: 2px solid #ffd93d; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
          <h2 style="color: #ff6b35; margin: 0 0 15px 0;">{{subject}}</h2>
          <p style="margin: 0; color: #555; font-size: 16px; line-height: 1.6;">{{message}}</p>
        </div>
        <div style="background-color: #f0f7ff; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">📅 Дата: {{date}}</p>
          <p style="margin: 0; color: #333; font-weight: bold;">⏰ Час: {{time}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://testograph.eu" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold;">Към Платформата</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 14px;">
        <p style="margin: 0;">Не пропускайте важни срокове! 📌</p>
      </div>
    </div>
  </div>',
  'reminder',
  '["name", "subject", "message", "date", "time"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'Reminder template for important dates and deadlines'
),

-- General Template
(
  'Общо Съобщение',
  '📬 {{subject}}',
  '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background-color: #7c3aed; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Testograph</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin-top: 0;">{{subject}}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Здравейте, {{name}}!</p>
        <div style="margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; color: #555; font-size: 16px; line-height: 1.8;">{{message}}</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Ако имате въпроси, моля свържете се с нас.</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 25px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">С уважение,</p>
        <p style="margin: 0; color: #7c3aed; font-weight: bold; font-size: 16px;">Екипът на Testograph</p>
        <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">support@testograph.eu | testograph.eu</p>
      </div>
    </div>
  </div>',
  'general',
  '["name", "subject", "message"]'::jsonb,
  'e4ea078b-30b2-4347-801f-6d26a87318b6'::uuid,
  'General purpose template for any communication'
)
ON CONFLICT (name) DO NOTHING;
