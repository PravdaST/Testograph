import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAuditLog } from '@/lib/admin/audit-log';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,          // string or string[] for bulk email
      subject,
      message,
      isBulk,      // boolean - true for bulk emails
      adminId,
      adminEmail
    } = body;

    // Validation
    if (!to || !subject || !message || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare recipients
    const recipients = Array.isArray(to) ? to : [to];

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided' },
        { status: 400 }
      );
    }

    // Send emails
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Testograph Admin <admin@shop.testograph.eu>',
          to: recipient,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Testograph</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                ${message.split('\n').map(line => `<p style="color: #374151; line-height: 1.6;">${line}</p>`).join('')}
              </div>
              <div style="padding: 20px; text-align: center; background-color: #e5e7eb; font-size: 12px; color: #6b7280;">
                <p>Това съобщение е изпратено от Testograph Admin Panel</p>
                <p>За въпроси: <a href="mailto:support@testograph.eu" style="color: #7c3aed;">support@testograph.eu</a></p>
              </div>
            </div>
          `,
        });

        if (error) {
          errors.push({ recipient, error: error.message });
        } else {
          results.push({ recipient, id: data?.id, success: true });
        }
      } catch (err: any) {
        errors.push({ recipient, error: err.message });
      }
    }

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: isBulk ? 'bulk_email' : 'send_email',
      targetUserId: null,
      targetUserEmail: isBulk ? `${recipients.length} users` : recipients[0],
      changesBefore: null,
      changesAfter: {
        subject,
        recipients: recipients.length,
        successCount: results.length,
        errorCount: errors.length
      },
      description: isBulk
        ? `Изпратени ${results.length} bulk emails (${errors.length} грешки)`
        : `Изпратен email до ${recipients[0]}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    // Return response
    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json(
        {
          error: 'All emails failed to send',
          details: errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isBulk
        ? `Изпратени ${results.length} от ${recipients.length} emails`
        : 'Email изпратен успешно',
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
