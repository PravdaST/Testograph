import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateAndUploadGuideImages } from '@/lib/ai/image-generation';
import {
  insertImagesIntoContent,
  countWords,
  calculateReadingTime,
  extractExcerpt
} from '@/lib/utils/insert-images';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const CONTENT_MODEL = 'google/gemini-2.5-pro';
const SUGGESTION_MODEL = 'google/gemini-2.5-flash-lite';

// Testograph category-specific pillar suggestions
function getTestographPillarSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    testosterone: [
      'Какво е тестостерон и как работи',
      'Симптоми на нисък тестостерон',
      'Естествени начини за повишаване на тестостерона',
      'Храни, които повишават тестостерона',
      'Тренировки за повишаване на тестостерона',
      'Добавки за тестостерон',
      'Тестване на нивата на тестостерон',
      'Хормонална заместителна терапия (TRT)'
    ],
    potency: [
      'Физиология на ерекцията',
      'Причини за еректилна дисфункция',
      'Естествени методи за подобряване на потенцията',
      'Упражнения за мъжка потенция',
      'Добавки за либидо и потенция',
      'Психологически фактори при еректилната дисфункция'
    ],
    fitness: [
      'Силови тренировки за мъже',
      'Кардио за мъжко здраве',
      'Изграждане на мускулна маса',
      'Горене на мазнини при мъжете',
      'Тренировъчна програма за начинаещи',
      'Тренировъчна програма за напреднали',
      'Възстановяване след тренировка'
    ],
    nutrition: [
      'Протеини за мъжко здраве',
      'Здравословни мазнини и тестостерон',
      'Въглехидрати и хормонален баланс',
      'Витамини за мъжко здраве',
      'Минерали за мъжко здраве',
      'Хранителен режим за повишаване на тестостерона',
      'Рецепти за мъжко здраве'
    ],
    supplements: [
      'Трибулус терестрис',
      'Ашваганда за мъже',
      'Цинк за тестостерон',
      'Магнезий и мъжко здраве',
      'Витамин D за тестостерон',
      'Комбиниране на добавки'
    ],
    lifestyle: [
      'Сън и тестостерон',
      'Управление на стреса',
      'Алкохол и тестостерон',
      'Тютюнопушене и мъжко здраве',
      'Работа и хормонален баланс'
    ]
  };

  return suggestions[category] || [];
}

async function callOpenRouter(messages: any[], temperature = 0.7, maxTokens = 20000, model = CONTENT_MODEL) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://testograph.eu',
      'X-Title': 'Testograph Learn Content Generator'
    },
    body: JSON.stringify({
      model,
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

function slugify(text: string): string {
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya'
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => cyrillicToLatin[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { title, category, keywords, is_published, published_at } = await request.json();

    console.log('[Cluster] Starting generation:', { title, category, keywords, is_published, published_at });

    // Step 1: Determine suggested pillars
    let suggestedPillars = getTestographPillarSuggestions(category);

    // If no predefined suggestions or category is custom, ask AI
    if (suggestedPillars.length === 0) {
      const aiSuggestionPrompt = [
        {
          role: 'system',
          content: `Ти си ЕКСПЕРТ по мъжко здраве, тестостерон, фитнес и хранене.

Анализирай темата на cluster статията и предложи 6-10 КОНКРЕТНИ pillar теми на ЕСТЕСТВЕН БЪЛГАРСКИ ЕЗИК.

ВАЖНО - НЕ ПРЕВОДИ ДИРЕКТНО ОТ АНГЛИЙСКИ:
- Пиши на естествен разговорен български
- Използвай термини, които българите реално използват
- Избягвай буквални преводи, които звучат неестествено

ПРИМЕРИ ЗА ЕСТЕСТВЕН БЪЛГАРСКИ:
✅ ДОБРЕ: "Как да повишиш тестостерона естествено"
❌ ЗУРНО: "Естествено повишаване на тестостерона" (звучи като превод)

✅ ДОБРЕ: "Храни, които повишават тестостерона"
❌ ЗУРНО: "Храни за повишаване на тестостерона"

✅ ДОБРЕ: "Силови тренировки за мъже"
❌ ЗУРНО: "Силов тренинг за мъже" (тренинг е русизъм)

Върни САМО валиден JSON array с конкретни български теми:
["Тема 1", "Тема 2", ...]`
        },
        {
          role: 'user',
          content: `Cluster тема: "${title}"
Категория: ${category}
Keywords: ${keywords || 'няма'}

Предложи 6-10 конкретни pillar теми на естествен български език.`
        }
      ];

      let aiResponse = await callOpenRouter(aiSuggestionPrompt, 0.8, 1000, SUGGESTION_MODEL);

      // Clean up markdown code fences
      aiResponse = aiResponse.trim();
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (aiResponse.startsWith('```')) {
        aiResponse = aiResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        suggestedPillars = JSON.parse(aiResponse);
        console.log('[AI Suggestions] ✅', suggestedPillars.length, 'pillars suggested');
      } catch (e) {
        console.error('[AI Suggestions] ❌ Failed to parse:', e);
        suggestedPillars = [];
      }
    }

    // Step 2: Generate cluster content
    const contentPrompt = [
      {
        role: 'system',
        content: `Ти си ЕКСПЕРТЕН специалист по мъжко здраве, тестостерон, фитнес и хранене. Пишеш образователно съдържание на ЕСТЕСТВЕН БЪЛГАРСКИ ЕЗИК.

КРИТИЧНО - ЕСТЕСТВЕН БЪЛГАРСКИ ЕЗИК:
- Пиши на естествен разговорен български (НЕ буквални преводи от английски!)
- Използвай термини, които българите реално използват
- Граматически перфектен български
- Тон: приятелски, мотивиращ, като личен треньор/лекар

ПРИМЕРИ ЗА ЕСТЕСТВЕН ЕЗИК:
✅ "мускулна маса" (НЕ "мускулна тъкан")
✅ "горене на мазнини" (НЕ "загуба на мазнини")
✅ "силови тренировки" (НЕ "силов тренинг")
✅ "качване на тегло" (НЕ "увеличаване на телесното тегло")

КРИТИЧНО - HTML ФОРМАТ:

❌ ЗАБРАНЕНО:
- Емотикони в заглавия
- H1 тагове
- H2 със заглавието в началото (template го показва!)
- <article>, <header>, <footer>
- Complex grids/cards

✅ РАЗРЕШЕНО:
- <p> параграфи
- <h2>, <h3> заглавия (БЕЗ емотикони!)
- <ul>, <li> списъци
- <strong> за emphasis
- <div class="tldr-section"> за резюме

СТРУКТУРА (3,500 думи):

1. TLDR секция (150-200 думи) - Кратко резюме с ключови моменти
2. Въведение (300 думи) - Защо е важна темата
3. Общ преглед (500 думи) - Основни концепции
4. Основни подтеми (1,500 думи) - Детайлно разглеждане
5. Научна обосновка (400 думи) - Референции към изследвания
6. Практически съвети (400 думи) - Какво да правиш
7. Заключение (250 думи) - Резюме и следващи стъпки

TLDR ФОРМАТ:
<div class="tldr-section">
  <h3>Ключови моменти</h3>
  <ul>
    <li><strong>Ключова точка 1:</strong> Обяснение...</li>
    <li><strong>Ключова точка 2:</strong> Обяснение...</li>
    <li><strong>Ключова точка 3:</strong> Обяснение...</li>
  </ul>
</div>

FAQ ФОРМАТ:
<div class="faq-section">
  <h2>Често задавани въпроси</h2>
  <div class="faq-item">
    <h3>Въпрос 1?</h3>
    <p>Отговор на въпрос 1...</p>
  </div>
  <div class="faq-item">
    <h3>Въпрос 2?</h3>
    <p>Отговор на въпрос 2...</p>
  </div>
</div>

НАУЧНА ТОЧНОСТ:
- Базирай се на реални медицински изследвания
- Споменавай studies естествено (напр. "Изследванията показват...")
- БЕЗ pseudo-science или нереалистични обещания

SUBTLE PRODUCT MENTIONS:
- Можеш да споменеш TestoUP естествено в контекста
- БЕЗ агресивен marketing език
- Фокус върху образованието, НЕ продажбите

SEO:
- Използвай keywords естествено
- H2/H3 с keywords
- Първи параграф с main keyword

ВАЖНО:
- 3,500 думи минимум
- Естествен, приятелски български
- Научно точен + мотивиращ
- БЕЗ емотикони в заглавия`
      },
      {
        role: 'user',
        content: `Създай CLUSTER guide за: "${title}"
Категория: ${category}
Keywords: ${keywords || 'няма'}

Pillar теми за споменаване: ${suggestedPillars.join(', ')}

Генерирай пълно HTML съдържание (3,500 думи) на естествен български език.`
      }
    ];

    let content = await callOpenRouter(contentPrompt, 0.7, 20000);

    // Clean AI-generated markdown artifacts and introductory text
    content = content.trim();

    // Remove markdown code fences
    content = content.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```\s*$/g, '');

    // Remove AI introductory/meta text (anything before first HTML tag)
    // Look for common AI intro patterns and remove them
    const htmlTagMatch = content.match(/<(div|p|h2|h3|ul|article)/i);
    if (htmlTagMatch && htmlTagMatch.index && htmlTagMatch.index > 0) {
      // There's text before the first HTML tag - remove it
      content = content.substring(htmlTagMatch.index);
    }

    // Additional cleanup: remove any remaining markdown artifacts
    content = content.replace(/^\*+\s*/gm, ''); // Remove asterisks at line start
    content = content.trim();

    // Step 3: Generate metadata
    const metaPrompt = [
      {
        role: 'system',
        content: `Генерирай SEO metadata. Върни САМО валиден JSON:
{
  "meta_title": "SEO заглавие (50-60 символа)",
  "meta_description": "SEO описание (150-160 символа)",
  "slug": "url-slug-na-latinica"
}

ВАЖНО: slug САМО на латиница!`
      },
      {
        role: 'user',
        content: `Заглавие: ${title}\nКатегория: ${category}`
      }
    ];

    const metaResponse = await callOpenRouter(metaPrompt, 0.5, 500, SUGGESTION_MODEL);
    let metadata;
    try {
      metadata = JSON.parse(metaResponse.trim().replace(/^```json\s*/, '').replace(/\s*```$/, ''));

      // Ensure slug is Latin
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

    // Step 4: Generate MULTIPLE images (hero + in-article)
    let heroImageUrl = '';
    let articleImageUrls: string[] = [];

    try {
      console.log('[Images] Generating hero + article images...');

      const keywordsArray = keywords ? keywords.split(',').map((k: string) => k.trim()) : [];

      const imageResult = await generateAndUploadGuideImages(
        title,
        'cluster', // guide type
        category,
        keywordsArray
      );

      heroImageUrl = imageResult.heroImageUrl;
      articleImageUrls = imageResult.articleImageUrls;

      console.log(`[Images] ✅ Generated ${1 + articleImageUrls.length} images`);
    } catch (error) {
      console.error('[Images] ❌ Failed:', error);
      // Continue without images - not critical
    }

    // Step 5: Insert article images into content
    let finalContent = content;
    if (articleImageUrls.length > 0) {
      finalContent = insertImagesIntoContent({
        content,
        imageUrls: articleImageUrls,
        imageAlts: articleImageUrls.map((_, idx) => `${title} - illustration ${idx + 1}`)
      });
      console.log(`[Content] ✅ Inserted ${articleImageUrls.length} images into HTML`);
    }

    // Step 6: Calculate word count & reading time
    const wordCount = countWords(finalContent);
    const readingTime = calculateReadingTime(finalContent);

    console.log(`[Analytics] Word count: ${wordCount} | Reading time: ${readingTime} min`);

    // Step 7: Extract excerpt
    const excerpt = extractExcerpt(finalContent, 200);

    // Step 8: Check for duplicate by slug
    const { data: existingGuide } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('slug', metadata.slug)
      .single();

    if (existingGuide) {
      console.log('[Cluster] ❌ Duplicate detected:', existingGuide.slug);
      return NextResponse.json(
        {
          error: 'Cluster вече съществува',
          existing: {
            id: existingGuide.id,
            title: existingGuide.title,
            slug: existingGuide.slug
          }
        },
        { status: 409 } // Conflict
      );
    }

    // Step 9: Save to database with new fields
    const { data: savedGuide, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: metadata.slug,
        content: finalContent,
        excerpt: excerpt || metadata.meta_description,
        category: 'learn-guide',
        guide_type: 'cluster',
        guide_category: category,
        suggested_pillars: suggestedPillars,
        meta_title: metadata.meta_title,
        meta_description: metadata.meta_description,
        featured_image_url: heroImageUrl,
        author_id: user.id,
        is_published: is_published || false,
        published_at: published_at || null
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Database error: ${saveError.message}`);
    }

    console.log('[Cluster] ✅ Created:', savedGuide.slug);

    return NextResponse.json({
      success: true,
      guide: savedGuide,
      suggested_pillars: suggestedPillars
    });

  } catch (error: any) {
    console.error('[Cluster] ❌ Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate cluster' },
      { status: 500 }
    );
  }
}
