import { NextResponse } from 'next/server';
import { ImapClient } from '@/lib/email/imap-client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const imapClient = new ImapClient();

    // If refresh is true, fetch fresh from IMAP
    // Otherwise, use cached data for speed
    let emails;

    if (refresh) {
      console.log('Fetching fresh emails from IMAP...');
      emails = await imapClient.fetchInbox(limit);
    } else {
      console.log('Fetching cached emails from Supabase...');
      emails = await imapClient.getCachedEmails(limit);
    }

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      source: refresh ? 'imap' : 'cache',
    });
  } catch (error: any) {
    console.error('Error fetching inbox:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch inbox',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
