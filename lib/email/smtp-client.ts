import * as nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  inReplyTo?: string; // For threading
  references?: string[]; // For threading
  adminId?: string;
  adminEmail?: string;
}

export class SmtpClient {
  private transporter: any;

  constructor() {
    this.transporter = (nodemailer.default || nodemailer).createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: 'contact@testograph.eu',
        pass: 'ixzmgzpzshahhtln', // Gmail App Password (remove spaces)
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Send email via SMTP
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate SMTP connection first
      try {
        await this.transporter.verify();
      } catch (verifyError: any) {
        console.error('SMTP connection verification failed:', verifyError);
        throw new Error(`SMTP Authentication Failed: ${verifyError.message}. Please check email credentials or use App Password if 2FA is enabled.`);
      }

      const mailOptions: any = {
        from: 'Testograph <contact@testograph.eu>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
        replyTo: options.replyTo,
      };

      // Add threading headers if replying
      if (options.inReplyTo) {
        mailOptions.inReplyTo = options.inReplyTo;
      }
      if (options.references && options.references.length > 0) {
        mailOptions.references = options.references.join(' ');
      }

      const info = await this.transporter.sendMail(mailOptions);

      // Log to email_logs
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        body: options.html || options.text || '',
        messageId: info.messageId,
        status: 'sent',
        adminId: options.adminId,
        adminEmail: options.adminEmail,
      });

      // Mark as replied in received_emails_cache if replying
      if (options.inReplyTo) {
        await supabase
          .from('received_emails_cache')
          .update({ is_replied: true })
          .eq('message_id', options.inReplyTo);
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('SMTP send error:', error);

      // Log failed attempt
      await this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        body: options.html || options.text || '',
        messageId: null,
        status: 'failed',
        errorMessage: error.message,
        adminId: options.adminId,
        adminEmail: options.adminEmail,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Log email to email_logs table
   */
  private async logEmail(data: {
    to: string[];
    subject: string;
    body: string;
    messageId: string | null;
    status: 'sent' | 'failed';
    errorMessage?: string;
    adminId?: string;
    adminEmail?: string;
  }): Promise<void> {
    try {
      for (const recipient of data.to) {
        await supabase.from('email_logs').insert({
          recipient_email: recipient,
          subject: data.subject,
          body: data.body,
          status: data.status,
          error_message: data.errorMessage || null,
          sent_by: data.adminId || null,
          sent_by_email: data.adminEmail || 'contact@testograph.eu',
          sent_at: new Date().toISOString(),
          is_bulk: false,
        });
      }
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }
}
