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
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Cluster Suggestions'
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

    console.log('[Suggestions] Generating', count, 'cluster ideas...');

    const prompt = [
      {
        role: 'system',
        content: `Ти си ЕКСПЕРТ по мъжко здраве, тестостерон, фитнес и хранене.

Предложи ${count} КОНКРЕТНИ cluster теми за образователно съдържание на сайта Testograph.eu.

КАТЕГОРИИ:
- testosterone: хормони, нива, симптоми, естествено повишаване
- potency: еректилна функция, либидо, сексуално здраве
- fitness: тренировки, мускулна маса, телосложение
- nutrition: хранене, макронутриенти, храни за тестостерон
- supplements: добавки, TestoUP съставки
- lifestyle: сън, стрес, възстановяване

ВАЖНО - ЕСТЕСТВЕН БЪЛГАРСКИ:
- Пиши на естествен разговорен български (НЕ директни преводи!)
- Използвай термини, които българите реално използват

ПРИМЕРИ ЗА ДОБРИ CLUSTER ТЕМИ:
✅ "Тестостерон - Пълно ръководство за мъже"
✅ "Как да повишиш тестостерона естествено"
✅ "Хранене за повишаване на тестостерона"
✅ "Силови тренировки за мъже над 40"
✅ "Потенция и мъжко либидо - Пълен гид"
✅ "Сън и тестостерон - Защо е важен"
✅ "Добавки за мъжко здраве"

❌ ИЗБЯГВАЙ:
- Буквални преводи от английски
- Твърде академични заглавия
- Generic теми

Върни САМО валиден JSON array:
[
  {
    "title": "Заглавие на естествен български",
    "category": "testosterone | potency | fitness | nutrition | supplements | lifestyle",
    "description": "Кратко описание (1-2 изречения)",
    "estimated_pillars": 6-10,
    "suggested_pillars": ["Pillar 1 заглавие", "Pillar 2 заглавие", ...]
  }
]

ВАЖНО: За всеки cluster, предложи 6-8 КОНКРЕТНИ pillar заглавия които да го допълват.`
      },
      {
        role: 'user',
        content: `Предложи ${count} cluster теми.${keywords ? `\nKeywords: ${keywords}` : ''}`
      }
    ];

    let aiResponse = await callOpenRouter(prompt, 0.8, 4000);

    // Clean markdown
    aiResponse = aiResponse.trim();
    if (aiResponse.startsWith('```json')) {
      aiResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (aiResponse.startsWith('```')) {
      aiResponse = aiResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
      console.log('[Suggestions] ✅', suggestions.length, 'clusters suggested');
    } catch (e) {
      console.error('[Suggestions] ❌ Parse failed:', e);
      throw new Error('Failed to parse AI suggestions');
    }

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error: any) {
    console.error('[Suggestions] ❌', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
