import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/utils/slugify';
import { generateImage } from '@/lib/ai/image-generation';
import { findExistingPillars } from '@/lib/utils/check-guide-exists';
import { checkClusterDuplicate } from '@/lib/utils/check-duplicate';
import { validateInternalLinks } from '@/lib/utils/validate-links';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.5-flash-lite';

// Intelligent pillar suggestions based on category
function getSuggestedPillars(category: string, clusterTitle: string): string[] {
  const suggestions: Record<string, string[]> = {
    planets: ['Слънцето', 'Луната', 'Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн'],
    signs: [
      'Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева',
      'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'
    ],
    houses: [
      '1-ви дом', '2-ри дом', '3-ти дом', '4-ти дом',
      '5-ти дом', '6-ти дом', '7-ми дом', '8-ми дом',
      '9-ти дом', '10-ти дом', '11-ти дом', '12-ти дом'
    ],
    aspects: ['Конюнкция', 'Опозиция', 'Тригон', 'Квадрат', 'Секстил'],
    guides: [], // Will be determined by AI
  };

  return suggestions[category] || [];
}

// Detect which category the pillar titles suggest
function detectCategoryFromPillars(pillars: string[]): string | null {
  if (pillars.length === 0) return null;

  // Known category keywords
  const planets = ['Слънце', 'Луна', 'Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн', 'Уран', 'Нептун', 'Плутон'];
  const signs = ['Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева', 'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'];
  const houses = ['дом', 'house'];
  const aspects = ['Конюнкция', 'Опозиция', 'Тригон', 'Квадрат', 'Секстил'];

  // Count matches for each category
  const matches = {
    planets: pillars.filter(p => planets.some(planet => p.includes(planet))).length,
    signs: pillars.filter(p => signs.some(sign => p.includes(sign))).length,
    houses: pillars.filter(p => houses.some(house => p.toLowerCase().includes(house))).length,
    aspects: pillars.filter(p => aspects.some(aspect => p.includes(aspect))).length
  };

  // Return category with most matches
  const maxMatches = Math.max(...Object.values(matches));
  if (maxMatches === 0) return null;

  const detectedCategory = Object.entries(matches).find(([_, count]) => count === maxMatches)?.[0];
  return detectedCategory || null;
}

async function callOpenRouter(messages: any[], temperature = 0.7, maxTokens = 20000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://www.vrachka.eu',
      'X-Title': 'Vrachka Cluster Generator'
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
    const { title, category, keywords, mainTopic = 'astrology' } = await request.json();

    // Step 0: Check for duplicate cluster
    console.log('[Cluster] Checking for duplicates...');
    const duplicateCheck = await checkClusterDuplicate(title, mainTopic, category);

    if (duplicateCheck.isDuplicate && duplicateCheck.existingPost) {
      console.warn('[Cluster] Duplicate found:', duplicateCheck.existingPost.title);
      return NextResponse.json(
        {
          error: `Cluster вече съществува: "${duplicateCheck.existingPost.title}"`,
          duplicate: true,
          existingPost: {
            title: duplicateCheck.existingPost.title,
            slug: duplicateCheck.existingPost.slug,
            url: `/learn/${duplicateCheck.existingPost.main_topic}/${duplicateCheck.existingPost.guide_category}/${duplicateCheck.existingPost.slug}`
          }
        },
        { status: 409 } // 409 Conflict
      );
    }

    console.log('[Cluster] No duplicates found ✅');

    // Step 1: Check which pillars already exist (for smart linking)
    const existingPillars = await findExistingPillars(category);
    const existingPillarTitles = existingPillars.map(p => p.title);
    const existingPillarSlugs = existingPillars.map(p => p.slug);

    // Step 2: Determine suggested pillars
    let suggestedPillars = getSuggestedPillars(category, title);

    // If category is "guides" or custom, ask AI to suggest pillars
    if (category === 'guides' || suggestedPillars.length === 0) {
      const aiSuggestionPrompt = [
        {
          role: 'system',
          content: `Ти си ЕКСПЕРТ по еsotерика, астрология, таро, нумерология, кристали и духовни практики. Анализирай темата на cluster статията и предложи 4-8 КОНКРЕТНИ И СПЕЦИФИЧНИ pillar теми.

ВАЖНО - СПЕЦИФИЧНИ ТЕМИ:
- НЕ използвай generic термини като "Beginner Guide", "Advanced Techniques", "Common Mistakes", "Tips and Tricks"
- ИЗПОЛЗВАЙ конкретни понятия специфични за темата
- Всяка pillar тема трябва да е САМОСТОЯТЕЛНА, КОНКРЕТНА и УНИКАЛНА

ПРИМЕРИ ПО ТЕМИ:

❌ ЛОШИ (generic за ВСИЧКИ теми):
["Beginner Guide", "Advanced Techniques", "Tips and Tricks", "Common Mistakes"]

✅ ДОБРИ - АСТРОЛОГИЯ:
Cluster: "Планети в астрологията"
→ ["Слънцето в астрологията", "Луната в астрологията", "Меркурий в астрологията", "Венера в астрологията", "Марс в астрологията"]

Cluster: "Натална карта за начинаещи"
→ ["Какво е натална карта?", "Как да четем наталната карта", "Планети в наталната карта", "Домове в наталната карта", "Аспекти в наталната карта"]

✅ ДОБРИ - ТАРО:
Cluster: "Таро карти - пълен гид"
→ ["Големите Аркани в Таро", "Малките Аркани: Пръчки", "Малките Аркани: Чаши", "Малките Аркани: Мечове", "Малките Аркани: Пентакли", "Как да четем Таро разклади"]

Cluster: "Таро за любов и връзки"
→ ["Любовни Таро разклади", "Какво казват Таро картите за вашата връзка", "Таро карти за привличане на любов", "Как да тълкуваме любовни Таро разклади"]

✅ ДОБРИ - НУМЕРОЛОГИЯ:
Cluster: "Нумерология за начинаещи"
→ ["Какво е нумерология?", "Число на живота: Как да го изчислим", "Число на съдбата и неговото значение", "Кармични числа в нумерологията", "Персонална година в нумерологията"]

Cluster: "Кармична нумерология"
→ ["Кармични числа 13, 14, 16, 19", "Как да разпознаем кармичните уроци", "Кармични дългове и техните значения", "Освобождаване от кармични блокажи"]

✅ ДОБРИ - КРИСТАЛИ:
Cluster: "Кристали за начинаещи"
→ ["Какво са кристалите и как работят", "Розов кварц: Кристал на любовта", "Аметист: Кристал на духовността", "Цитрин: Кристал на изобилието", "Черен турмалин: Защита и заземяване", "Как да почистваме и зареждаме кристали"]

Cluster: "Лечебни кристали"
→ ["Кристали за физическо здраве", "Кристали за емоционално благосъстояние", "Кристали за чакрите", "Кристални решетки за лечение"]

✅ ДОБРИ - РИТУАЛИ И МЕДИТАЦИИ:
Cluster: "Лунни ритуали през годината"
→ ["Новолуние: Ритуали за нови начала", "Пълнолуние: Ритуали за освобождаване", "Растяща луна: Привличане на изобилие", "Намаляваща луна: Пречистване и отпускане"]

Cluster: "Медитации за духовно развитие"
→ ["Медитация за заземяване", "Медитация за отваряне на третото око", "Чакра медитация", "Медитация за вътрешен мир"]

✅ ДОБРИ - БИЛКИ:
Cluster: "Магически билки и техните свойства"
→ ["Лавандула: Билка на спокойствието", "Розмарин: Билка на паметта", "Жълт кантарион: Билка на светлината", "Мента: Билка на изобилието"]

ПРАВИЛО: Анализирай ТЕМАТА и предложи pillars СПЕЦИФИЧНИ ЗА НЕЯ!

Върни САМО валиден JSON array с конкретни български теми:
["Конкретна тема 1", "Конкретна тема 2", ...]`
        },
        {
          role: 'user',
          content: `Cluster тема: "${title}"
Категория: ${category}
Keywords: ${keywords || 'няма'}

Анализирай темата внимателно и предложи 4-8 КОНКРЕТНИ pillar теми които я допълват.
НЕ използвай generic термини като "Beginner Guide"!
Предложи СПЕЦИФИЧНИ теми за тази конкретна област!`
        }
      ];

      let aiResponse = await callOpenRouter(aiSuggestionPrompt, 0.8, 1000);
      console.log('[AI Pillar Suggestions] Raw AI response:', aiResponse);

      // Clean up markdown code fences if present
      aiResponse = aiResponse.trim();
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (aiResponse.startsWith('```')) {
        aiResponse = aiResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        suggestedPillars = JSON.parse(aiResponse);
        console.log('[AI Pillar Suggestions] ✅ Parsed successfully:', suggestedPillars.length, 'pillars');
      } catch (e) {
        // Fallback if AI doesn't return valid JSON
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('[AI Pillar Suggestions] ❌ JSON parse failed:', errorMessage);
        console.error('[AI Pillar Suggestions] Invalid response:', aiResponse);
        suggestedPillars = [];
      }
    }

    // Step 2.5: Validate category selection
    if (category === 'guides' && suggestedPillars.length > 0) {
      const detectedCategory = detectCategoryFromPillars(suggestedPillars);

      if (detectedCategory && detectedCategory !== 'guides') {
        console.warn(`[Cluster] Category mismatch detected!`);
        console.warn(`  User selected: "${category}"`);
        console.warn(`  AI suggests: "${detectedCategory}" based on pillars:`, suggestedPillars);
        console.warn(`  ⚠️ Consider changing category to "${detectedCategory}" for better SEO`);

        // Return warning to UI (don't block, just inform)
        return NextResponse.json({
          warning: true,
          suggestedCategory: detectedCategory,
          message: `AI обнаружи че темата вероятно е "${detectedCategory}", но ти избра "guides". Сигурен ли си?`,
          suggestedPillars,
          userCategory: category
        });
      }
    }

    // Step 3: Generate cluster content
    const contentPrompt = [
      {
        role: 'system',
        content: `Ти си ЕКСПЕРТЕН астролог и писател на образователно съдържание на български език.

КРИТИЧНО ВАЖНО - БЪЛГАРСКИ ЕЗИК:
- Пиши на ЕСТЕСТВЕН български език (НЕ буквални преводи!)
- Граматически перфектен български
- Естествен разговорен тон

КРИТИЧНО ВАЖНО - БЪЛГАРСКА ТЕРМИНОЛОГИЯ:
- За houses: използвай "дом" НЕ "къща" (1-ви дом, 2-ри дом, 3-ти дом и т.н.)
- За planets: "планети" (Слънцето, Луната, Меркурий, Венера, Марс, Юпитер, Сатурн)
- За signs: "зодиакални знаци" (Овен, Телец, Близнаци, Рак, Лъв, Дева, Везни, Скорпион, Стрелец, Козирог, Водолей, Риби)
- За aspects: "аспекти" (конюнкция, опозиция, тригон, квадрат, секстил)
- НЕ използвай буквални преводи от английски - пиши на естествен български

КРИТИЧНО ВАЖНО - ПРОСТ HTML ФОРМАТ:

❌ ЗАБРАНЕНО:
- Емотикони в заглавия (НЕ 🌟 🌌 🪐)
- H1 тагове
- H2 със заглавието на статията в началото (template-ът вече го показва!)
- <article>, <header>, <footer> тагове
- Complex grids, cards, sections

✅ РАЗРЕШЕНО:
- <p> параграфи
- <h2> и <h3> заглавия (БЕЗ емотикони!)
- <ul>, <li> списъци
- <a href="/learn/${mainTopic}/${category}/SLUG"> internal links (САМО за съществуващи теми!)
- <strong> за emphasis
- <div class="tldr-section"> за резюмета

СТРУКТУРА НА CLUSTER СТАТИЯ (3,500 думи):

1. TLDR секция (2-3 изречения) - БЕЗ заглавие преди нея!
2. Въведение (300 думи) - Директно <p> параграфи БЕЗ H2 заглавие!
3. Общ преглед (500 думи) - Първият <h2> трябва да е "Общ преглед", НЕ заглавието на статията!
4. Основни концепции (800 думи) - Ключови понятия и терминология
5. Подтеми накратко (1000 думи) - Споменаване на всички ${suggestedPillars.length} pillar теми
6. Практическо приложение (500 думи) - Как се използва
7. Заключение (400 думи) - Резюме и следващи стъпки

CRITICAL - SMART INTERNAL LINKING:

${existingPillars.length > 0 ? `✅ СЪЩЕСТВУВАЩИ ТЕМИ (добави линкове):
${existingPillars.map((p, i) => `${i + 1}. "${p.title}" → <a href="/learn/${mainTopic}/${category}/${p.slug}">${p.title}</a>`).join('\n')}` : '⚠️ НЯМА създадени pillar теми още.'}

${existingPillars.length < suggestedPillars.length ? `⚠️ ПЛАНИРАНИ ТЕМИ (НЕ слагай линкове, само споменай):
${suggestedPillars.filter(sp => !existingPillarTitles.includes(sp)).map((p, i) => `${i + 1}. "${p}" → споменай БЕЗ линк`).join('\n')}` : ''}

ПРАВИЛО: САМО линкове към съществуващи теми! За планирани теми - само споменаване.

SEO ОПТИМИЗАЦИЯ:
- Използвай keywords естествено в текста
- Заглавия (H2, H3) с keywords
- Първи параграф с main keyword

ВАЖНО:
- 3,500 думи (НЕ по-малко!)
- Естествен, приятелски тон
- Без емотикони в заглавия
- Чист HTML код`
      },
      {
        role: 'user',
        content: `Създай CLUSTER guide за тема: "${title}"
Категория: ${category}
Keywords: ${keywords || 'няма'}

Pillar теми за споменаване: ${suggestedPillars.join(', ')}

Генерирай пълно HTML съдържание (3,500 думи).`
      }
    ];

    let content = await callOpenRouter(contentPrompt, 0.7, 20000);

    // Clean up markdown code fences if present
    content = content.trim();
    if (content.startsWith('```html')) {
      content = content.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Step 2.5: Validate and auto-fix internal links
    console.log('[Cluster] Validating internal links...');
    const linkValidation = await validateInternalLinks(content, mainTopic, category);

    // Use fixed content if auto-fixes were applied
    if (linkValidation.fixedContent) {
      content = linkValidation.fixedContent;
      console.log('[Cluster] ✅ Applied auto-fixes to content');
    }

    // Log any remaining issues (won't block generation)
    if (!linkValidation.isValid) {
      console.error('[Cluster] ❌ Broken links detected (not blocking generation):', linkValidation.brokenLinks);
    }

    // Step 3: Generate metadata
    const metaPrompt = [
      {
        role: 'system',
        content: `Генерирай SEO metadata за статия. Върни само валиден JSON:
{
  "meta_title": "SEO заглавие (50-60 символа)",
  "meta_description": "SEO описание (150-160 символа)",
  "slug": "url-friendly-slug-in-latin-only"
}

ВАЖНО: slug трябва да е САМО на латиница! Транслитерирай български текст към латиница.
Пример: "Планети в астрологията" → "planeti-v-astrologiyata"`
      },
      {
        role: 'user',
        content: `Заглавие: ${title}\nCategory: ${category}`
      }
    ];

    const metaResponse = await callOpenRouter(metaPrompt, 0.5, 500);
    let metadata;
    try {
      metadata = JSON.parse(metaResponse);
      // Ensure slug is Latin - if AI returns Cyrillic, use slugify as fallback
      if (/[\u0400-\u04FF]/.test(metadata.slug)) {
        metadata.slug = slugify(title);
      }
    } catch (e) {
      metadata = {
        meta_title: title,
        meta_description: title,
        slug: slugify(title)
      };
    }

    // Step 4: Extract excerpt from TLDR section
    let excerpt = '';
    try {
      const tldrMatch = content.match(/<div class="tldr-section">(.*?)<\/div>/s);
      if (tldrMatch) {
        // Strip HTML tags and clean up
        excerpt = tldrMatch[1]
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200); // First 200 chars
      }
    } catch (e) {
      console.error('[Cluster] Failed to extract excerpt:', e);
    }

    // Step 5: Generate featured image
    let featuredImageUrl: string | null = null;
    try {
      console.log('[Cluster] Generating featured image...');
      const imagePrompt = `Hero banner for educational guide titled: "${title}". Astrology theme, mystical atmosphere, professional quality. Category: ${category}. NO TEXT, NO LETTERS on the image. Pure visual symbolism.`;

      const generatedImage = await generateImage({
        prompt: imagePrompt,
        style: 'mystical, professional, astrological symbols, Bulgarian cultural elements',
        aspectRatio: '16:9'
      });

      featuredImageUrl = generatedImage.url;
      console.log('[Cluster] Featured image generated:', featuredImageUrl);
    } catch (imageError) {
      console.error('[Cluster] Failed to generate featured image:', imageError);
      // Continue without image - not critical
    }

    return NextResponse.json({
      success: true,
      cluster: {
        title,
        content,
        slug: metadata.slug,
        meta_title: metadata.meta_title,
        meta_description: metadata.meta_description,
        excerpt: excerpt || metadata.meta_description,
        guide_type: 'cluster',
        guide_category: category,
        main_topic: mainTopic,
        category: 'learn-guide',
        suggested_pillars: suggestedPillars,
        keywords: keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
        featured_image_url: featuredImageUrl,
      },
      suggested_pillars: suggestedPillars
    });

  } catch (error: any) {
    console.error('Cluster generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate cluster' },
      { status: 500 }
    );
  }
}
