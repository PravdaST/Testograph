import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter active only
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    // Get creator emails
    const { data: authData } = await supabase.auth.admin.listUsers();
    const emailMap = new Map(
      authData.users.map(user => [user.id, user.email || 'Unknown'])
    );

    // Add creator email to each template
    const templatesWithCreators = templates?.map(template => ({
      ...template,
      creator_email: emailMap.get(template.created_by) || 'Unknown'
    })) || [];

    return NextResponse.json({
      success: true,
      templates: templatesWithCreators,
      total: templatesWithCreators.length
    });

  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
