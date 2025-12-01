import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.5-flash-lite'; // Ultra-fast with massive context

async function callOpenRouter(messages: any[], temperature = 0.4, maxTokens = 32000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Data-Driven Cluster Suggestions'
    },
    body: JSON.stringify({
      model: MODEL,
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

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check auth & admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
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
    const { keywords, count = 10 } = await request.json();

    console.log('[Suggestions] 🔍 Fetching real data for data-driven analysis...');

    // ===== FETCH REAL DATA FROM DATABASE =====

    // 1. Keywords without content (Content Gaps - HIGHEST PRIORITY)
    const { data: contentGaps } = await supabase
      .from('target_keywords')
      .select('keyword, priority, category, focus_score, notes')
      .is('assigned_content_id', null)
      .gte('focus_score', 60) // High-value keywords only
      .order('focus_score', { ascending: false })
      .limit(50);

    // 2. All target keywords (for semantic analysis)
    const { data: allKeywords } = await supabase
      .from('target_keywords')
      .select('keyword, priority, category, focus_score, content_status')
      .order('focus_score', { ascending: false });

    // 3. Existing clusters (to avoid duplicates)
    const { data: existingClusters } = await supabase
      .from('blog_posts')
      .select('title, guide_category, main_topic, keywords')
      .eq('category', 'learn-guide')
      .eq('guide_type', 'cluster')
      .in('status', ['published', 'draft']);

    // 4. Existing pillars (for context)
    const { data: existingPillars } = await supabase
      .from('blog_posts')
      .select('title, guide_category, parent_cluster_title, keywords')
      .eq('category', 'learn-guide')
      .eq('guide_type', 'pillar')
      .in('status', ['published', 'draft']);

    // 5. GSC top performing keywords (if available)
    const { data: gscTopKeywords } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword, clicks, impressions, ctr, position')
      .gte('clicks', 3) // Keywords with real traffic
      .order('clicks', { ascending: false })
      .limit(30);

    // 6. Keyword clusters (related keywords grouping)
    const { data: keywordClusters } = await supabase
      .from('keyword_clusters')
      .select(`
        id,
        cluster_name,
        main_keyword,
        keyword_cluster_members!inner (
          keyword_id
        )
      `)
      .limit(15);

    console.log('[Suggestions] 📊 Data fetched:', {
      contentGaps: contentGaps?.length || 0,
      allKeywords: allKeywords?.length || 0,
      existingClusters: existingClusters?.length || 0,
      existingPillars: existingPillars?.length || 0,
      gscTopKeywords: gscTopKeywords?.length || 0,
      keywordClusters: keywordClusters?.length || 0
    });

    // ===== STRUCTURE DATA FOR AI =====

    const aiContext = {
      contentGaps: (contentGaps || []).slice(0, 20).map(k => ({
        keyword: k.keyword,
        priority: k.priority,
        focusScore: k.focus_score
      })),

      existingClusterTitles: (existingClusters || []).map(c => c.title),

      topPerformingKeywords: (gscTopKeywords || []).slice(0, 15).map(k => ({
        keyword: k.keyword,
        clicks: k.clicks,
        position: Math.round(k.position || 0)
      })),

      keywordsByCategory: (allKeywords || []).reduce((acc: any, k) => {
        const cat = k.category || 'uncategorized';
        if (!acc[cat]) acc[cat] = [];
        if (acc[cat].length < 10) { // Limit per category
          acc[cat].push({
            keyword: k.keyword,
            focusScore: k.focus_score,
            hasContent: k.content_status === 'published'
          });
        }
        return acc;
      }, {})
    };

    // ===== BUILD DATA-DRIVEN AI PROMPT =====

    const systemPrompt = `Ти си ЕКСПЕРТ SEO стратег и content architect за мъжко здраве, тестостерон и фитнес.

🎯 ТВОЯТА ЗАДАЧА: Анализирай РЕАЛНИ ДАННИ от системата и предложи ТОЧНО ${count} data-driven cluster теми (НЕ ПОВЕЧЕ, НЕ ПО-МАЛКО!) базирани на:
- Actual keyword demand (от Google Search Console)
- Content gaps (keywords без съдържание)
- Semantic keyword grouping
- Business priorities (focus scores)

⚠️ КРИТИЧНО ВАЖНО: Върни ТОЧНО ${count} clusters в JSON array! НЕ генерирай повече!

═══════════════════════════════════════════════════════════════
📊 РЕАЛНИ ДАННИ ОТ СИСТЕМАТА
═══════════════════════════════════════════════════════════════

1️⃣  KEYWORDS БЕЗ СЪДЪРЖАНИЕ (Content Gaps - Top Priority!)
${JSON.stringify(aiContext.contentGaps, null, 2)}

2️⃣  СЪЩЕСТВУВАЩИ CLUSTERS (НЕ ги повтаряй!):
${aiContext.existingClusterTitles.join('\n- ') || 'Няма clusters още'}

3️⃣  TOP PERFORMING KEYWORDS (от GSC - real traffic!):
${JSON.stringify(aiContext.topPerformingKeywords, null, 2)}

4️⃣  KEYWORDS ПО КАТЕГОРИЯ (за semantic grouping):
${JSON.stringify(aiContext.keywordsByCategory, null, 2)}

═══════════════════════════════════════════════════════════════
📋 ИНСТРУКЦИИ ЗА DATA-DRIVEN ANALYSIS
═══════════════════════════════════════════════════════════════

За всеки cluster suggestion ТРЯБВА ДА:

✅ БАЗИРАЙ СЕ НА РЕАЛНИ ДАННИ:
   - Приоритизирай keywords от "Content Gaps" с висок focus_score
   - Групирай семантично свързани keywords
   - Използвай GSC data за validation на demand
   - Покажи кои конкретни keywords ще cover-не този cluster

✅ ИЗБЯГВАЙ ДУБЛИКАТИ:
   - НЕ повтаряй съществуващи cluster titles
   - НЕ предлагай теми, които вече са покрити от pillars
   - Провери existing content преди да предложиш

✅ SEO ОПТИМИЗАЦИЯ:
   - Предпочитай high focus_score keywords (>75)
   - Включвай keywords с реален GSC traffic
   - Балансирай high-volume и long-tail keywords

✅ ЕСТЕСТВЕН БЪЛГАРСКИ:
   - Разговорен, естествен език (НЕ буквални преводи!)
   - Термини, които българите реално използват
   - Избягвай академични/формални заглавия

✅ CONCRETE PILLAR SUGGESTIONS:
   - За всеки cluster предложи 8-10 concrete pillar заглавия
   - Всеки pillar трябва да таргетира конкретен keyword от данните
   - Покажи target keyword за всеки pillar
   - Pillar заглавията трябва да са на правилен, естествен български език

═══════════════════════════════════════════════════════════════
📤 OUTPUT FORMAT (САМО валиден JSON!)
═══════════════════════════════════════════════════════════════

[
  {
    "title": "Cluster заглавие на правилен български",
    "category": "testosterone|potency|fitness|nutrition|supplements|lifestyle",
    "description": "Кратко описание на естествен български (2-3 изречения)",
    "targetKeywords": ["keyword1", "keyword2", "keyword3"],
    "estimatedSearchDemand": "high|medium|low",
    "totalFocusScore": 250,
    "suggestedPillars": [
      {"title": "Pillar заглавие на правилен български", "targetKeyword": "keyword", "focusScore": 85}
    ],
    "dataReasoning": "Защо този cluster е важен базирано на данните (2-3 изречения)"
  }
]

⚠️ КРИТИЧНО ВАЖНО ЗА БЪЛГАРСКИ ЕЗИК:
- Използвай ПРАВИЛЕН български език, НЕ буквален превод от английски!
- Използвай правилни времена и спрежения
- Примери за ПРАВИЛЕН български:
  ✅ "Как да повишиш тестостерона си естествено" (НЕ "Как да повишите...")
  ✅ "Храни, които вдигат тестостерона" (НЕ "Храни които...")
  ✅ "Симптоми на нисък тестостерон - какво трябва да знаеш" (НЕ "какво трябва да знаете")
- Използвай разговорен, естествен стил като пишеш на приятел
- Избягвай официален/формален език

═══════════════════════════════════════════════════════════════
🎯 КАТЕГОРИИ ЗА REFERENCE
═══════════════════════════════════════════════════════════════

- testosterone: хормони, нива, симптоми, тестване, естествено повишаване
- potency: еректилна функция, либидо, сексуално здраве, потентност
- fitness: тренировки, мускулна маса, телосложение, сила
- nutrition: хранене, макронутриенти, храни за тестостерон, диета
- supplements: добавки, TestoUP, витамини, минерали
- lifestyle: сън, стрес, възстановяване, навици

ВАЖНО: Върни САМО JSON array, без markdown код блокове!`;

    const userPrompt = `Анализирай данните и предложи ${count} data-driven clusters.

${keywords ? `\n📌 Допълнителни user keywords за приоритет: ${keywords}` : ''}

🎯 ФОКУС:
1. Keywords с highest focus_score от content gaps
2. Semantic grouping на related keywords
3. GSC data validation за real demand
4. Избягване на дубликати със съществуващо съдържание

⚠️ ВАЖНО ЗА ФОРМАТ:
- JSON array с ${count} clusters
- Всеки cluster с 8-10 pillars
- Включи description и dataReasoning полета
- Върни САМО валиден JSON array (без markdown блокове!)
- Използвай ПРАВИЛЕН български език (не буквален превод!)

🗣️ ПРАВИЛЕН БЪЛГАРСКИ:
- "Как да повишиш" (НЕ "Как да повишите")
- Разговорен стил, като пишеш на приятел
- Естествени времена и спрежения

START JSON:`;

    // ===== CALL AI WITH REAL DATA (IN BATCHES FOR RELIABILITY) =====

    console.log('[Suggestions] 🤖 Calling AI with data-driven context...');
    console.log(`[Suggestions] 📦 Generating ${count} clusters in batches for reliability...`);

    // Generate in batches to avoid response size limits
    const BATCH_SIZE = 3; // Generate 3 clusters at a time
    const batches = Math.ceil(count / BATCH_SIZE);
    const allSuggestions = [];

    for (let i = 0; i < batches; i++) {
      const batchStart = i * BATCH_SIZE + 1;
      const batchEnd = Math.min((i + 1) * BATCH_SIZE, count);
      const batchCount = batchEnd - batchStart + 1;

      console.log(`[Suggestions] 🔄 Batch ${i + 1}/${batches}: Generating clusters ${batchStart}-${batchEnd}...`);

      const batchUserPrompt = `Анализирай данните и предложи ${batchCount} data-driven clusters (clusters ${batchStart}-${batchEnd} от общо ${count}).

${keywords ? `\n📌 Допълнителни user keywords за приоритет: ${keywords}` : ''}

🎯 ФОКУС:
1. Keywords с highest focus_score от content gaps
2. Semantic grouping на related keywords
3. GSC data validation за real demand
4. Избягване на дубликати със съществуващо съдържание

⚠️ ВАЖНО ЗА ФОРМАТ:
- JSON array с ТОЧНО ${batchCount} clusters
- Всеки cluster с 8-10 pillars
- Включи description и dataReasoning полета
- Върни САМО валиден JSON array (без markdown блокове!)
- Използвай ПРАВИЛЕН български език (не буквален превод!)

🗣️ ПРАВИЛЕН БЪЛГАРСКИ:
- "Как да повишиш" (НЕ "Как да повишите")
- Разговорен стил, като пишеш на приятел
- Естествени времена и спрежения

START JSON:`;

      const prompt = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: batchUserPrompt }
      ];

      let aiResponse = await callOpenRouter(prompt, 0.4, 16000); // 16k per batch is safer

      // Clean markdown if present
      aiResponse = aiResponse.trim();
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (aiResponse.startsWith('```')) {
        aiResponse = aiResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let batchSuggestions;
      try {
        batchSuggestions = JSON.parse(aiResponse);
        console.log(`[Suggestions] ✅ Batch ${i + 1}/${batches}: Generated ${batchSuggestions.length} clusters`);
        allSuggestions.push(...batchSuggestions);
      } catch (e) {
        console.error(`[Suggestions] ❌ Batch ${i + 1}/${batches} parse failed:`, e);
        console.error('[Suggestions] Response:', aiResponse.substring(0, 500));
        throw new Error(`Failed to parse AI suggestions for batch ${i + 1}`);
      }

      // Small delay between batches to avoid rate limiting
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const suggestions = allSuggestions;
    console.log('[Suggestions] 🎉 Total generated:', suggestions.length, 'data-driven clusters');

    // ===== RETURN WITH DATA INSIGHTS =====

    return NextResponse.json({
      success: true,
      suggestions,
      dataInsights: {
        analyzedKeywords: allKeywords?.length || 0,
        contentGaps: contentGaps?.length || 0,
        existingClusters: existingClusters?.length || 0,
        existingPillars: existingPillars?.length || 0,
        gscTopKeywords: gscTopKeywords?.length || 0,
        keywordClusters: keywordClusters?.length || 0,
        model: MODEL,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[Suggestions] ❌', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
