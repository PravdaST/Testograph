import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = 'google/gemini-2.5-pro';

async function callOpenRouter(messages: any[], temperature = 0.7, maxTokens = 4000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Keyword Suggestions'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// POST /api/admin/keywords/suggest - AI keyword suggestions
export async function POST(request: Request) {
  console.log('[Keyword Suggestions] Starting AI analysis...');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keyword Suggestions] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keyword Suggestions] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { focus_area, count = 10 } = body;

    // 1. Get existing target keywords
    const { data: targetKeywords } = await supabase
      .from('target_keywords')
      .select('keyword, category, priority')
      .order('focus_score', { ascending: false });

    // 2. Get existing blog content
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('title, excerpt, content_preview, category, keywords')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50);

    // 3. Get GSC performance data (top performing keywords)
    const { data: gscData } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword, clicks, impressions, position')
      .order('clicks', { ascending: false })
      .limit(100);

    // 4. Get trending queries if available
    const { data: trendingData } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword, clicks, impressions')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('clicks', { ascending: false })
      .limit(50);

    // Build context for AI
    const context = {
      existing_keywords: targetKeywords?.map(k => k.keyword) || [],
      categories: Array.from(new Set(targetKeywords?.map(k => k.category).filter(Boolean))) || [],
      blog_titles: blogPosts?.map(p => p.title) || [],
      blog_categories: Array.from(new Set(blogPosts?.map(p => p.category).filter(Boolean))) || [],
      top_gsc_keywords: gscData?.slice(0, 20).map(k => ({
        keyword: k.keyword,
        clicks: k.clicks,
        position: k.position
      })) || [],
      trending_keywords: trendingData?.slice(0, 10).map(k => k.keyword) || [],
    };

    console.log('[Keyword Suggestions] Context prepared:', {
      existing_keywords: context.existing_keywords.length,
      blog_posts: blogPosts?.length || 0,
      gsc_keywords: context.top_gsc_keywords.length,
      trending: context.trending_keywords.length,
    });

    // AI Prompt
    const systemPrompt = `Ти си SEO експерт специализиран в keyword research и content strategy за мъжко здраве (testosterone, potency, fitness, nutrition).

Твоята задача е да анализираш съществуващото съдържание и данни от Google Search Console, и да препоръчаш нови high-value keywords за таргетиране.

ВАЖНО: Фокусирай се на:
1. Content gaps - теми които липсват в съществуващото съдържание
2. Long-tail keywords - конкретни, специфични фрази с висок потенциал
3. User intent - какво търсят реалните потребители
4. Competition level - keywords които са възможни за rank
5. Commercial intent - keywords които водят до conversions

ФОРМАТ НА ОТГОВОРА (само JSON, без markdown):
{
  "suggestions": [
    {
      "keyword": "конкретна ключова дума",
      "category": "testosterone|potency|fitness|nutrition|supplements|lifestyle",
      "priority": "high|medium|low",
      "estimated_volume": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "reason": "защо този keyword е valuable (2-3 изречения)",
      "content_gap": "каква липса запълва този keyword",
      "related_to": ["списък с налични keywords/теми които се допълват"]
    }
  ],
  "insights": {
    "main_gaps": ["списък с основни content gaps"],
    "opportunities": ["списък с възможности за растеж"],
    "recommendations": ["стратегически препоръки"]
  }
}`;

    const userPrompt = `Анализирай това SEO състояние и препоръчай ${count} нови keywords:

## Съществуващи Target Keywords (${context.existing_keywords.length}):
${context.existing_keywords.slice(0, 30).join(', ')}

## Категории в съдържанието:
${context.blog_categories.join(', ')}

## Sample Blog Titles (${context.blog_titles.length}):
${context.blog_titles.slice(0, 20).join('\n')}

## Top GSC Keywords (реални search queries):
${context.top_gsc_keywords.map(k => `"${k.keyword}" (${k.clicks} clicks, pos ${k.position.toFixed(1)})`).join('\n')}

## Trending Keywords (последни 7 дни):
${context.trending_keywords.join(', ')}

${focus_area ? `\n## FOCUS AREA: ${focus_area}\nФокусирай препоръките около тази тема.` : ''}

Генерирай ${count} нови keyword suggestions които:
1. НЕ СА в списъка със съществуващи keywords
2. Допълват съществуващото съдържание
3. Имат commercial intent и conversion potential
4. Са специфични за българския пазар и аудитория
5. Са long-tail и имат по-малка конкуренция

ВЪРНИ САМО ВАЛИДЕН JSON - без markdown code blocks!`;

    // Call OpenRouter API with Gemini
    const aiContent = await callOpenRouter([
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ], 0.7, 4000);

    console.log('[Keyword Suggestions] AI response length:', aiContent.length);

    // Clean up response (remove markdown code blocks if present)
    let cleanedContent = aiContent.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const aiData = JSON.parse(cleanedContent);

    console.log('[Keyword Suggestions] ✅ Generated', aiData.suggestions?.length || 0, 'suggestions');

    return NextResponse.json({
      suggestions: aiData.suggestions || [],
      insights: aiData.insights || {},
      context: {
        analyzed_keywords: context.existing_keywords.length,
        analyzed_posts: blogPosts?.length || 0,
        gsc_data_available: context.top_gsc_keywords.length > 0,
      },
    });

  } catch (err: any) {
    console.error('[Keyword Suggestions] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
