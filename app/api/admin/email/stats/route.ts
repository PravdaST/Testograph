import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get unread email count
    const { data: emails, error: emailError } = await supabase
      .from('received_emails_cache')
      .select('id, body_text, attachments')
      .eq('is_read', false);

    if (emailError) throw emailError;

    const unreadCount = emails?.length || 0;

    // Calculate storage used (rough estimate based on email sizes)
    let totalSize = 0;
    if (emails) {
      for (const email of emails) {
        // Estimate email size
        const textSize = (email.body_text?.length || 0) * 2; // UTF-16 characters
        const attachmentsSize = Array.isArray(email.attachments)
          ? email.attachments.reduce((sum: number, att: any) => sum + (att.size || 0), 0)
          : 0;
        totalSize += textSize + attachmentsSize;
      }
    }

    // Get all emails for total storage
    const { data: allEmails, error: allError } = await supabase
      .from('received_emails_cache')
      .select('body_text, attachments');

    if (!allError && allEmails) {
      for (const email of allEmails) {
        const textSize = (email.body_text?.length || 0) * 2;
        const attachmentsSize = Array.isArray(email.attachments)
          ? email.attachments.reduce((sum: number, att: any) => sum + (att.size || 0), 0)
          : 0;
        totalSize += textSize + attachmentsSize;
      }
    }

    // Convert to GB
    const storageUsedGB = totalSize / (1024 * 1024 * 1024);

    return NextResponse.json({
      success: true,
      unreadCount,
      storageUsed: storageUsedGB,
      storageTotal: 15, // 15 GB for Google Workspace
    });
  } catch (error: any) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email stats' },
      { status: 500 }
    );
  }
}
