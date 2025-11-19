import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/admin/keywords/difficulty - Calculate keyword difficulty
export async function POST(request: Request) {
  console.log('[Keyword Difficulty API] POST - Calculating difficulty');

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

    // Simple internal difficulty calculation based on keyword characteristics
    const kwText = keyword.keyword.toLowerCase();
    const wordCount = kwText.split(/\s+/).length;

    // Base difficulty factors
    let difficulty = 50; // Start at medium

    // Word count factor (longer = more specific = easier)
    if (wordCount === 1) difficulty += 20; // Single word = harder
    else if (wordCount === 2) difficulty += 10;
    else if (wordCount >= 4) difficulty -= 10; // Long tail = easier

    // Common competitive terms (Bulgarian)
    const competitiveTerms = ['тестостерон', 'фитнес', 'отслабване', 'здраве', 'диета'];
    const hasCompetitiveTerm = competitiveTerms.some(term => kwText.includes(term));
    if (hasCompetitiveTerm) difficulty += 15;

    // Question keywords (usually easier)
    const questionWords = ['как', 'какво', 'кога', 'къде', 'защо', 'колко'];
    const isQuestion = questionWords.some(word => kwText.startsWith(word));
    if (isQuestion) difficulty -= 10;

    // Cap at 0-100
    difficulty = Math.max(0, Math.min(100, difficulty));

    // Estimate search volume based on word count and type
    let searchVolume = 1000;
    if (wordCount === 1) searchVolume = 5000;
    else if (wordCount === 2) searchVolume = 2000;
    else if (wordCount >= 4) searchVolume = 500;
    if (hasCompetitiveTerm) searchVolume *= 1.5;

    // Competition index (0-1)
    const competitionIndex = difficulty / 100;

    // Estimated CPC (higher for competitive terms)
    const cpc = hasCompetitiveTerm ? 0.50 : 0.20;

    // Store in database
    const { data: difficultyRecord, error: insertError } = await supabase
      .from('keyword_difficulty')
      .insert({
        keyword_id: keyword.id,
        difficulty_score: Math.round(difficulty),
        source: 'internal',
        search_volume: Math.round(searchVolume),
        cpc: cpc,
        competition_index: competitionIndex.toFixed(2),
        metadata: {
          word_count: wordCount,
          is_question: isQuestion,
          has_competitive_term: hasCompetitiveTerm
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Keyword Difficulty API] Insert error:', insertError);
      throw insertError;
    }

    console.log(`[Keyword Difficulty API] ✅ Calculated difficulty: ${difficulty} for "${keyword.keyword}"`);

    return NextResponse.json({
      success: true,
      difficulty: difficultyRecord
    });

  } catch (error: any) {
    console.error('[Keyword Difficulty API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate difficulty' },
      { status: 500 }
    );
  }
}

// GET /api/admin/keywords/difficulty?keyword_id=xxx
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

    const { data: difficulty, error } = await supabase
      .from('keyword_difficulty')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ difficulty: difficulty || null });

  } catch (error: any) {
    console.error('[Keyword Difficulty API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch difficulty' },
      { status: 500 }
    );
  }
}
