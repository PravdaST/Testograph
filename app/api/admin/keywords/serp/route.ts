import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/admin/keywords/serp - Analyze SERP for keyword
export async function POST(request: Request) {
  console.log('[SERP Analysis API] POST - Analyzing SERP');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { keyword_id } = body;

    if (!keyword_id) {
      return NextResponse.json(
        { error: 'keyword_id is required' },
        { status: 400 }
      );
    }

    // Get keyword
    const { data: keyword, error: keywordError } = await supabase
      .from('target_keywords')
      .select('id, keyword')
      .eq('id', keyword_id)
      .single();

    if (keywordError || !keyword) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    // Mock SERP data (в production тук ще се използва реален SERP API)
    const mockResults = [
      {
        position: 1,
        title: `${keyword.keyword} - Пълен гайд`,
        url: 'https://example.com/guide',
        domain: 'example.com',
        description: 'Всичко за ' + keyword.keyword + '...',
        type: 'article'
      },
      {
        position: 2,
        title: `Как да ${keyword.keyword}`,
        url: 'https://competitor1.com/how-to',
        domain: 'competitor1.com',
        description: 'Научи как да ' + keyword.keyword,
        type: 'guide'
      },
      {
        position: 3,
        title: `${keyword.keyword} за начинаещи`,
        url: 'https://competitor2.com/beginners',
        domain: 'competitor2.com',
        description: 'Стартов гайд за ' + keyword.keyword,
        type: 'tutorial'
      }
    ];

    // Determine competition level
    const competitionLevel = mockResults.length >= 3 ? 'high' : mockResults.length >= 2 ? 'medium' : 'low';

    // Store analysis
    const { data: analysis, error: insertError } = await supabase
      .from('serp_analysis')
      .insert({
        keyword_id: keyword.id,
        search_volume: 1000, // Mock data
        competition_level: competitionLevel,
        top_results: mockResults
      })
      .select()
      .single();

    if (insertError) {
      console.error('[SERP Analysis API] Insert error:', insertError);
      throw insertError;
    }

    console.log(`[SERP Analysis API] ✅ Analyzed SERP for "${keyword.keyword}"`);

    return NextResponse.json({
      success: true,
      analysis: analysis,
      note: 'Тази функция използва mock data. В production ще се интегрира с реален SERP API (SerpApi, DataForSEO, etc.)'
    });

  } catch (error: any) {
    console.error('[SERP Analysis API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze SERP' },
      { status: 500 }
    );
  }
}

// GET /api/admin/keywords/serp?keyword_id=xxx
export async function GET(request: Request) {
  const supabase = await createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('keyword_id');

    if (!keywordId) {
      return NextResponse.json(
        { error: 'keyword_id parameter is required' },
        { status: 400 }
      );
    }

    const { data: analysis, error } = await supabase
      .from('serp_analysis')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ analysis: analysis || null });

  } catch (error: any) {
    console.error('[SERP Analysis API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SERP analysis' },
      { status: 500 }
    );
  }
}
