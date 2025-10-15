import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ImapClient } from '@/lib/email/imap-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch email from cache by message_id
    const { data: email, error } = await supabase
      .from('received_emails_cache')
      .select('*')
      .eq('message_id', id)
      .single();

    if (error || !email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error: any) {
    console.error('Error fetching email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { is_read, is_starred } = body;

    const updateData: any = {};
    if (typeof is_read === 'boolean') updateData.is_read = is_read;
    if (typeof is_starred === 'boolean') updateData.is_starred = is_starred;

    const { data, error } = await supabase
      .from('received_emails_cache')
      .update(updateData)
      .eq('message_id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      email: data,
    });
  } catch (error: any) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update email' },
      { status: 500 }
    );
  }
}
