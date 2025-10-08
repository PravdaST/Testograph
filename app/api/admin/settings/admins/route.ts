import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminError) throw adminError;

    // Get all auth users for email mapping
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // Create email map
    const emailMap = new Map(
      authData.users.map(user => [user.id, user.email || 'Unknown'])
    );

    // Combine admin data with emails
    const adminsWithEmails = adminUsers?.map(admin => ({
      id: admin.id,
      email: emailMap.get(admin.id) || 'Unknown',
      role: admin.role,
      permissions: admin.permissions,
      created_at: admin.created_at,
      created_by: admin.created_by,
      last_active_at: admin.last_active_at,
      notes: admin.notes
    })) || [];

    return NextResponse.json({
      success: true,
      admins: adminsWithEmails,
      total: adminsWithEmails.length
    });

  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}
