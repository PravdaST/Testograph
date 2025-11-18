import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.5-flash-lite';

async function callOpenRouter(messages: any[], temperature = 0.8, maxTokens = 4000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://www.vrachka.eu',
      'X-Title': 'Vrachka AI Cluster Suggestions'
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

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Fetch existing content to avoid duplicates
    const { data: existingClusters } = await supabase
      .from('blog_posts')
      .select('title, guide_category, guide_type')
      .eq('category', 'learn-guide')
      .eq('guide_type', 'cluster');

    const { data: existingPillars } = await supabase
      .from('blog_posts')
      .select('title, guide_category')
      .eq('category', 'learn-guide')
      .eq('guide_type', 'pillar');

    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('title, category')
      .neq('category', 'learn-guide')
      .limit(50);

    // Build context about existing content
    const existingClustersList = existingClusters?.map(c => `${c.title} (${c.guide_category})`).join(', ') || 'няма';
    const existingPillarsList = existingPillars?.map(p => `${p.title} (${p.guide_category})`).join(', ') || 'няма';
    const blogTopics = blogPosts?.map(b => b.title).slice(0, 20).join(', ') || 'няма';

    // AI analyzes site and suggests clusters
    const analysisPrompt = [
      {
        role: 'system',
        content: `Ти си експерт по астрология, SEO и content strategy за Vrachka - български астрологичен сайт.

МИСИЯ: Анализирай съществуващото съдържание и предложи 8-10 НОВИ cluster теми които:

✅ ЗАДЪЛЖИТЕЛНИ КРИТЕРИИ:
1. НЕ ДУБЛИРАТ съществуващото съдържание
2. Са ВИСОКО РЕЛЕВАНТНИ към астрология/хороскопи/таро
3. Имат СИЛЕН SEO потенциал (високо търсене в България)
4. Покриват различни категории (planets, signs, houses, aspects, guides)
5. Всяка cluster тема трябва да има минимум 5-12 конкретни pillars

❌ ЗАБРАНЕНО:
- Дублиране на съществуващи clusters
- Общи, размити теми
- Теми извън астрология/хороскопи/таро
- Clusters с по-малко от 5 pillars

📊 КАТЕГОРИИ:
- planets: Планети в астрологията
- signs: Зодиакални знаци
- houses: Астрологични къщи
- aspects: Астрологични аспекти
- guides: Практически ръководства

ФОРМАТ НА ОТГОВОР - Върни САМО валиден JSON масив:
[
  {
    "clusterTitle": "Заглавие на cluster на БЪЛГАРСКИ",
    "category": "planets|signs|houses|aspects|guides",
    "description": "Кратко описание защо е важна тази тема",
    "suggestedPillars": ["pillar 1 на БЪЛГАРСКИ", "pillar 2 на БЪЛГАРСКИ", ...],
    "keywords": "SEO keywords на български",
    "seoValue": "high|medium",
    "difficulty": "beginner|intermediate|advanced",
    "confidence": 0.0-1.0
  }
]

ВАЖНО:
- Всички текстове на БЪЛГАРСКИ
- Минимум 8, максимум 10 предложения
- Различни категории (не само planets)
- suggestedPillars: конкретни, уникални теми (5-12 на cluster)
- Високо качество и SEO потенциал`
      },
      {
        role: 'user',
        content: `АНАЛИЗ НА VRACHKA:

🔹 Съществуващи Clusters:
${existingClustersList}

🔹 Съществуващи Pillars:
${existingPillarsList}

🔹 Blog теми (за context):
${blogTopics}

🔹 Фокус на сайта:
- Астрология (натална карта, синастрия, транзити)
- Хороскопи (дневни, седмични, месечни, годишни)
- Таро четения
- Нумерология
- Лунен календар

ЗАДАЧА: Предложи 8-10 НОВИ cluster теми които:
- НЕ се дублират с горното съдържание
- Покриват различни категории
- Имат силен SEO потенциал в България
- Всяка с 5-12 конкретни pillars на БЪЛГАРСКИ

Върни JSON масив с предложенията.`
      }
    ];

    const aiResponse = await callOpenRouter(analysisPrompt, 0.8, 4000);

    console.log('=== AI CLUSTER SUGGESTIONS ===');
    console.log(aiResponse);
    console.log('===============================');

    // Clean AI response
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      console.error('AI Response was:', aiResponse);
      console.error('Cleaned response was:', cleanedResponse);

      // Fallback
      suggestions = [
        {
          clusterTitle: 'Астрологични аспекти - пълно ръководство',
          category: 'aspects',
          description: 'Разбиране на взаимодействията между планетите',
          suggestedPillars: [
            'Конюнкция в астрологията',
            'Опозиция - значение и влияние',
            'Тригон - хармоничен аспект',
            'Квадрат - предизвикателства',
            'Секстил - възможности'
          ],
          keywords: 'астрологични аспекти, конюнкция, опозиция',
          seoValue: 'high',
          difficulty: 'intermediate',
          confidence: 0.7
        }
      ];
    }

    // Validate suggestions is array
    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    return NextResponse.json({
      success: true,
      suggestions,
      existingClusters: existingClusters?.length || 0,
      existingPillars: existingPillars?.length || 0
    });

  } catch (error: any) {
    console.error('Cluster suggestions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suggest clusters' },
      { status: 500 }
    );
  }
}
