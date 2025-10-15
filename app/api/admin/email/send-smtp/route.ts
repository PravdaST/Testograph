import { NextResponse } from 'next/server';
import { SmtpClient } from '@/lib/email/smtp-client';
import { createAuditLog } from '@/lib/admin/audit-log';

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

    const smtpClient = new SmtpClient();

    const result = await smtpClient.sendEmail({
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</div>`,
      adminId: ADMIN_ID,
      adminEmail: ADMIN_EMAIL,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

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
        messageId: result.messageId,
      },
      description: `Изпратен email до ${Array.isArray(to) ? to.join(', ') : to}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via SMTP',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Error sending email via SMTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
