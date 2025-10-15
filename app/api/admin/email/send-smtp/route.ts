import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/admin/audit-log';
import { createClient } from '@supabase/supabase-js';

const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const ADMIN_EMAIL = 'caspere63@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    // Create nodemailer transporter directly here
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'contact@testograph.eu',
        pass: 'iqbmhnkyvcbbukdr',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: 'Testograph <contact@testograph.eu>',
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</div>`,
    });

    // Log to email_logs
    await supabase.from('email_logs').insert({
      recipient_email: Array.isArray(to) ? to[0] : to,
      subject,
      body: message,
      status: 'sent',
      sent_by: ADMIN_ID,
      sent_by_email: ADMIN_EMAIL,
      sent_at: new Date().toISOString(),
      is_bulk: false,
    });

    // Create audit log
    await createAuditLog({
      adminId: ADMIN_ID,
      adminEmail: ADMIN_EMAIL,
      actionType: 'send_email',
      targetUserId: null,
      targetUserEmail: Array.isArray(to) ? to.join(', ') : to,
      changesBefore: null,
      changesAfter: {
        subject,
        messageId: info.messageId,
      },
      description: `Изпратен email до ${Array.isArray(to) ? to.join(', ') : to}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via SMTP',
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('Error sending email via SMTP:', error);

    // Log failed attempt
    try {
      await supabase.from('email_logs').insert({
        recipient_email: Array.isArray(request.body) ? 'multiple' : 'unknown',
        subject: 'Failed',
        body: error.message,
        status: 'failed',
        error_message: error.message,
        sent_by: ADMIN_ID,
        sent_by_email: ADMIN_EMAIL,
        sent_at: new Date().toISOString(),
        is_bulk: false,
      });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
