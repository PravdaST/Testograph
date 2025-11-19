import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/admin/keywords/auto-match-content - Auto-match keywords to existing content using AI
export async function POST(request: Request) {
  console.log('[Auto-Match Content API] POST - Auto-matching keywords to content');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Auto-Match Content API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Auto-Match Content API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { auto_apply = false } = body;

    // Get all keywords without assigned content
    const { data: unmatchedKeywords, error: keywordsError } = await supabase
      .from('target_keywords')
      .select('id, keyword, category, priority, focus_score, notes')
      .is('assigned_content_id', null)
      .order('focus_score', { ascending: false });

    if (keywordsError || !unmatchedKeywords || unmatchedKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unmatched keywords found',
        matches: []
      });
    }

    console.log(`[Auto-Match Content API] Found ${unmatchedKeywords.length} unmatched keywords`);

    // Get all published learn content (pillars and clusters)
    const { data: learnContent, error: contentError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, guide_type, guide_category, main_topic, keywords')
      .eq('category', 'learn-guide')
      .eq('status', 'published')
      .not('guide_type', 'is', null);

    if (contentError || !learnContent || learnContent.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No learn content found to match',
        matches: []
      });
    }

    console.log(`[Auto-Match Content API] Found ${learnContent.length} learn guides`);

    // Prepare data for AI
    const keywordsList = unmatchedKeywords.map(k => ({
      id: k.id,
      keyword: k.keyword,
      category: k.category,
      priority: k.priority,
      focus_score: k.focus_score,
      notes: k.notes
    }));

    const contentList = learnContent.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      excerpt: c.excerpt,
      type: c.guide_type,
      category: c.guide_category,
      topic: c.main_topic,
      keywords: c.keywords
    }));

    // Build AI prompt
    const prompt = `Анализирай следните keywords и learn content guides и направи семантичен matching.

KEYWORDS (без assigned content):
${JSON.stringify(keywordsList, null, 2)}

LEARN CONTENT GUIDES (pillars & clusters):
${JSON.stringify(contentList, null, 2)}

Задача:
1. Анализирай семантичното значение на всеки keyword
2. Намери кой learn guide най-добре съответства на този keyword
3. Match-вай само когато има ясна семантична връзка (не гадай!)
4. Ако keyword няма добър match - не го включвай в резултата

Върни резултат в JSON формат:
{
  "matches": [
    {
      "keyword_id": "uuid",
      "keyword_text": "текст на keyword",
      "content_id": "uuid",
      "content_title": "заглавие на guide",
      "confidence": 0.95,
      "reason": "защо този match е добър (кратко обяснение)"
    }
  ]
}

Правила:
- confidence между 0 и 1 (върни само matches с confidence >= 0.7)
- reason на български, кратко (1 изречение)
- Ако keyword е за специфична тема (напр. "тестостерон храни") - match-вай към pillar guide за тази тема
- Ако keyword е по-общ (напр. "мъжко здраве") - match-вай към cluster guide

Върни САМО JSON, без допълнителен текст.`;

    // Call OpenRouter Gemini 2.5 Pro
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://testograph.eu',
        'X-Title': 'Testograph Keyword-Content Auto-Matching'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent matching
        max_tokens: 6000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auto-Match Content API] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const matchResult = JSON.parse(jsonMatch[0]);

    console.log(`[Auto-Match Content API] AI found ${matchResult.matches.length} matches`);

    // If auto_apply is true, update the database
    if (auto_apply) {
      let appliedCount = 0;

      for (const match of matchResult.matches) {
        // Update keyword with assigned_content_id
        const { error: updateError } = await supabase
          .from('target_keywords')
          .update({
            assigned_content_id: match.content_id,
            content_status: 'published' // Automatically mark as published since content already exists
          })
          .eq('id', match.keyword_id);

        if (!updateError) {
          appliedCount++;

          // Update blog_post with target_keyword_id (if it doesn't have one yet)
          await supabase
            .from('blog_posts')
            .update({
              target_keyword_id: match.keyword_id
            })
            .eq('id', match.content_id)
            .is('target_keyword_id', null); // Only update if no keyword assigned yet
        } else {
          console.error(`[Auto-Match Content API] Failed to update keyword ${match.keyword_id}:`, updateError);
        }
      }

      console.log(`[Auto-Match Content API] ✅ Applied ${appliedCount}/${matchResult.matches.length} matches`);

      return NextResponse.json({
        success: true,
        applied: true,
        matches: matchResult.matches,
        applied_count: appliedCount,
        total_matches: matchResult.matches.length
      });
    }

    // If not auto_apply, just return the suggestions
    return NextResponse.json({
      success: true,
      applied: false,
      matches: matchResult.matches,
      total_matches: matchResult.matches.length
    });

  } catch (error: any) {
    console.error('[Auto-Match Content API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-match content' },
      { status: 500 }
    );
  }
}
