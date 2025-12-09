import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/users/[email]/notes
 * Add a new admin note for a user
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);
    const body = await request.json();
    const { note, adminEmail } = body;

    if (!note || !adminEmail) {
      return NextResponse.json(
        { error: 'Note and adminEmail are required' },
        { status: 400 }
      );
    }

    // Insert the note
    const { data, error } = await supabase
      .from('admin_user_notes')
      .insert({
        user_email: email,
        note: note,
        admin_email: adminEmail,
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return empty response
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Table admin_user_notes does not exist. Please create it first.',
        }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      note: {
        id: data.id,
        note: data.note,
        adminEmail: data.admin_email,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error adding admin note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add note' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/[email]/notes
 * Get all admin notes for a user
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);

    const { data, error } = await supabase
      .from('admin_user_notes')
      .select('id, note, admin_email, created_at')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ success: true, notes: [] });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      notes: (data || []).map((n: any) => ({
        id: n.id,
        note: n.note,
        adminEmail: n.admin_email,
        createdAt: n.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}
