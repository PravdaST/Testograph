import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,          // string or string[] for bulk email
      subject,
      message,
      html,        // optional - custom HTML content (bypasses auto-formatting)
      isBulk,      // boolean - true for bulk emails
      adminId,
      adminEmail,
      templateId   // optional - for tracking template usage
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

    // Get template details if templateId provided
    let templateName = null;
    if (templateId) {
      try {
        const { data: template } = await supabase
          .from('email_templates')
          .select('name')
          .eq('id', templateId)
          .single();

        if (template) {
          templateName = template.name;
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    }

    // Generate bulk campaign ID if bulk send
    const bulkCampaignId = isBulk ? crypto.randomUUID() : null;

    // Send emails
    const results = [];
    const errors = [];

    // Use custom HTML if provided, otherwise auto-format the message
    const emailHtml = html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Testograph</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          ${message.split('\n').map((line: string) => `<p style="color: #374151; line-height: 1.6;">${line}</p>`).join('')}
        </div>
        <div style="padding: 20px; text-align: center; background-color: #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>Това съобщение е изпратено от Testograph Admin Panel</p>
          <p>За въпроси: <a href="mailto:contact@testograph.eu" style="color: #7c3aed;">contact@testograph.eu</a></p>
        </div>
      </div>
    `;

    for (const recipient of recipients) {
      // Create email log entry (pending status)
      const { data: logEntry, error: logError } = await supabase
        .from('email_logs')
        .insert({
          recipient_email: recipient,
          subject: subject,
          body: emailHtml,
          template_id: templateId || null,
          template_name: templateName,
          status: 'pending',
          sent_by: adminId,
          sent_by_email: adminEmail,
          is_bulk: isBulk,
          bulk_campaign_id: bulkCampaignId,
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating email log:', logError);
        // Continue anyway - don't block email sending
      }

      try {
        const { data, error } = await resend.emails.send({
          from: 'Testograph Admin <admin@shop.testograph.eu>',
          to: recipient,
          subject: subject,
          html: emailHtml,
        });

        if (error) {
          errors.push({ recipient, error: error.message });

          // Update log status to failed
          if (logEntry) {
            await supabase
              .from('email_logs')
              .update({
                status: 'failed',
                error_message: error.message,
                sent_at: new Date().toISOString()
              })
              .eq('id', logEntry.id);
          }
        } else {
          results.push({ recipient, id: data?.id, success: true });

          // Update log status to sent
          if (logEntry) {
            await supabase
              .from('email_logs')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', logEntry.id);
          }
        }
      } catch (err: any) {
        errors.push({ recipient, error: err.message });

        // Update log status to failed
        if (logEntry) {
          await supabase
            .from('email_logs')
            .update({
              status: 'failed',
              error_message: err.message,
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
        }
      }
    }

    // Update template usage if templateId provided
    if (templateId && results.length > 0) {
      try {
        const { data: template } = await supabase
          .from('email_templates')
          .select('usage_count')
          .eq('id', templateId)
          .single();

        if (template) {
          await supabase
            .from('email_templates')
            .update({
              usage_count: template.usage_count + 1,
              last_used_at: new Date().toISOString()
            })
            .eq('id', templateId);
        }
      } catch (error) {
        console.error('Error updating template usage:', error);
        // Don't fail the request if template update fails
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
