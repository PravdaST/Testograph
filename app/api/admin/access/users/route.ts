import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Fetch all profiles with PRO status
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, protocol_start_date_pro')
      .order('protocol_start_date_pro', { ascending: false, nullsFirst: false });

    if (profilesError) throw profilesError;

    // Fetch all auth users to get emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // Create email map
    const emailMap = new Map(
      authData.users.map(user => [user.id, user.email || 'Unknown'])
    );

    // Enrich profiles with emails
    const usersWithEmails = profiles?.map(profile => ({
      id: profile.id,
      email: emailMap.get(profile.id) || 'Unknown',
      name: profile.name,
      protocol_start_date_pro: profile.protocol_start_date_pro
    })) || [];

    return NextResponse.json({
      success: true,
      users: usersWithEmails,
      total: usersWithEmails.length
    });

  } catch (error: any) {
    console.error('Error fetching access control users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
