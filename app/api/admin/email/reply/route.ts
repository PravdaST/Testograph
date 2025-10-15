import { NextResponse } from 'next/server';
import { SmtpClient } from '@/lib/email/smtp-client';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const ADMIN_EMAIL = 'caspere63@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messageId, // Original email message ID we're replying to
      to,
      subject,
      message,
    } = body;

    if (!messageId || !to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get original email for threading
    const { data: originalEmail } = await supabase
      .from('received_emails_cache')
      .select('*')
      .eq('message_id', messageId)
      .single();

    const smtpClient = new SmtpClient();

    // Prepare threading headers
    const references = originalEmail?.references || [];
    if (originalEmail?.message_id && !references.includes(originalEmail.message_id)) {
      references.push(originalEmail.message_id);
    }

    const result = await smtpClient.sendEmail({
      to,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</div>`,
      inReplyTo: messageId,
      references,
      adminId: ADMIN_ID,
      adminEmail: ADMIN_EMAIL,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send reply' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      adminId: ADMIN_ID,
      adminEmail: ADMIN_EMAIL,
      actionType: 'send_email',
      targetUserId: null,
      targetUserEmail: to,
      changesBefore: null,
      changesAfter: {
        subject,
        messageId: result.messageId,
        inReplyTo: messageId,
      },
      description: `Отговорен email до ${to}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reply' },
      { status: 500 }
    );
  }
}
