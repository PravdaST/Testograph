import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/admin/keywords - List all target keywords
export async function GET(request: Request) {
  console.log('[Keywords API] GET - Fetching target keywords');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keywords API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keywords API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('target_keywords')
      .select('*')
      .order('focus_score', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: keywords, error } = await query;

    if (error) {
      console.error('[Keywords API] Database error:', error);
      throw error;
    }

    console.log('[Keywords API] ✅ Fetched', keywords?.length || 0, 'keywords');

    return NextResponse.json({
      keywords: keywords || [],
      total: keywords?.length || 0
    });

  } catch (err: any) {
    console.error('[Keywords API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

// POST /api/admin/keywords - Create new target keyword
export async function POST(request: Request) {
  console.log('[Keywords API] POST - Creating new keyword');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keywords API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keywords API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { keyword, priority, category, focus_score, notes, target_url } = body;

    // Validation
    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    if (!priority || !['high', 'medium', 'low'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be high, medium, or low' },
        { status: 400 }
      );
    }

    // Check if keyword already exists
    const { data: existing } = await supabase
      .from('target_keywords')
      .select('id')
      .eq('keyword', keyword.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Keyword already exists' },
        { status: 409 }
      );
    }

    // Insert keyword
    const { data: newKeyword, error: insertError } = await supabase
      .from('target_keywords')
      .insert({
        keyword: keyword.trim(),
        priority,
        category: category || null,
        focus_score: focus_score || 0,
        notes: notes || null,
        target_url: target_url || null,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Keywords API] Insert error:', insertError);
      throw insertError;
    }

    console.log('[Keywords API] ✅ Created keyword:', newKeyword.keyword);

    return NextResponse.json({
      keyword: newKeyword,
      message: 'Keyword created successfully'
    }, { status: 201 });

  } catch (err: any) {
    console.error('[Keywords API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create keyword' },
      { status: 500 }
    );
  }
}
