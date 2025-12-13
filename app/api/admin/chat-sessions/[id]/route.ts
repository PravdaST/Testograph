import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // The 'id' is now a URL-encoded email address
    const email = decodeURIComponent(id);

    // Get all coach messages for this email
    const { data: messages, error: messagesError } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found for this user' },
        { status: 404 }
      );
    }

    // Build session info from messages
    const session = {
      email,
      message_count: messages.length,
      user_messages: messages.filter(m => m.role === 'user').length,
      assistant_messages: messages.filter(m => m.role === 'assistant').length,
      first_message_at: messages[0].created_at,
      last_message_at: messages[messages.length - 1].created_at,
    };

    return NextResponse.json({
      session,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching coach session details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session details' },
      { status: 500 }
    );
  }
}
