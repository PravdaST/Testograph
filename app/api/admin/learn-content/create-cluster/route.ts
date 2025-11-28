import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateAndUploadGuideImages } from '@/lib/ai/image-generation';
import {
  insertImagesIntoContent,
  countWords,
  calculateReadingTime,
  extractExcerpt
} from '@/lib/utils/insert-images';
import { addSmartInternalLinks } from '@/lib/utils/smart-linking';

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

═══════════════════════════════════════════════
ЕЗИК И ТОН
═══════════════════════════════════════════════
- Пиши на естествен разговорен български (НЕ буквални преводи от английски!)
- Използвай термини, които българите реално използват
- Граматически перфектен български
- Тон: приятелски, мотивиращ, като личен треньор/лекар

ПРИМЕРИ ЗА ЕСТЕСТВЕН ЕЗИК:
✅ "мускулна маса" (НЕ "мускулна тъкан")
✅ "горене на мазнини" (НЕ "загуба на мазнини")
✅ "силови тренировки" (НЕ "силов тренинг")
✅ "качване на тегло" (НЕ "увеличаване на телесното тегло")

═══════════════════════════════════════════════
HTML ФОРМАТ
═══════════════════════════════════════════════
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
- <a> за линкове
- <table>, <thead>, <tbody>, <tr>, <th>, <td> за таблици

СПЕЦИАЛНИ СЕКЦИИ (използвай в целия текст, НЕ само накрая):
<div class="tldr-section"> - за TLDR в началото
<div class="faq-section"> - за FAQ секция
<div class="faq-item"> - за всеки FAQ въпрос

CALLOUT BOXES (разпредели в текста на подходящи места):

1. WARNING - за важни предупреждения (след рискови теми):
<div class="callout-box warning">
<strong>⚠️ Важно:</strong> Текст за предупреждение. При здравословни проблеми се консултирай с лекар.
</div>

2. KEY TAKEAWAY - за ключови изводи (след важни секции):
<div class="callout-box key-takeaway">
<strong>💡 Ключов извод:</strong> Обобщение на най-важното от секцията.
</div>

3. INFO - за научни справки (при цитиране на изследвания):
<div class="callout-box info">
<strong>ℹ️ Научна справка:</strong> Интересен факт или данни от изследване.
</div>

4. FEATURED SNIPPET - за директни отговори (след въпроси):
<div class="featured-snippet-answer">
<strong>Кратък отговор:</strong> Директен отговор на въпрос в 1-2 изречения.
</div>

ПРОМОЦИОНАЛЕН БАНЕР (постави 1 път в средата на статията):
<p><a title="TestoUP - натурална добавка за мъжко здраве" href="https://shop.testograph.eu/products/testoup"><img src="https://cdn.shopify.com/s/files/1/0989/8236/3485/files/testoup-banner-namalenie-testosteronov-buster.webp?v=1764239433" alt="TestoUP - натурален тестостеронов бустер с намаление до 40%"></a></p>

ТАБЛИЦИ (използвай когато сравняваш данни):
<table class="comparison-table">
  <thead><tr><th>Колона 1</th><th>Колона 2</th></tr></thead>
  <tbody><tr><td>Данни</td><td>Данни</td></tr></tbody>
</table>

═══════════════════════════════════════════════
СТРУКТУРА (3,500+ думи)
═══════════════════════════════════════════════
1. WARNING BOX веднага в началото (преди TLDR):
   <div class="callout-box warning">
   <strong>⚠️ Важно:</strong> Тази статия е с информационна цел и не замества професионална медицинска консултация. При здравословни проблеми се консултирай с квалифициран лекар.
   </div>

2. TLDR секция (150-200 думи)
   <div class="tldr-section">
     <h3>Ключови моменти</h3>
     <ul><li><strong>Точка:</strong> Обяснение...</li></ul>
   </div>

3. Въведение (300 думи)
   - Защо е важна темата
   - FEATURED SNIPPET с директен отговор на основния въпрос

4. Общ преглед (500 думи)
   - Основни концепции
   - Включи ТАБЛИЦА за сравнение ако е уместно
   - KEY TAKEAWAY след секцията

5. TestoUP БАНЕР (след общия преглед)

6. Основни подтеми (1,500 думи)
   - Детайлно разглеждане с H2 секции
   - INFO BOX при споменаване на изследвания
   - KEY TAKEAWAY след всяка важна под-секция
   - WARNING BOX ако има рискове

7. Научна обосновка (400 думи)
   - Референции към изследвания с години
   - БЕЗ pseudo-science
   - INFO BOX за интересни факти

8. FAQ секция (300 думи)
   <div class="faq-section">
     <h2>Често задавани въпроси</h2>
     <div class="faq-item">
       <h3>Въпрос?</h3>
       <div class="featured-snippet-answer"><strong>Кратък отговор:</strong> ...</div>
       <p>Допълнително обяснение...</p>
     </div>
   </div>

9. Практически съвети (300 думи)
   - Конкретни действия
   - KEY TAKEAWAY с обобщение

10. Заключение (200 думи)
    - Резюме и следващи стъпки
    - KEY TAKEAWAY с финално обобщение

11. ЗАДЪЛЖИТЕЛНО: Източници (накрая)
   <div class="references-section">
     <h3>Източници и изследвания</h3>
     <ul><li>Поне 4-5 реални източника с години</li></ul>
   </div>

12. ЗАДЪЛЖИТЕЛНО: Медицински Disclaimer (най-накрая)
    <div class="disclaimer-section">
      <p><strong>Медицински отказ от отговорност:</strong> Информацията в тази статия е с образователна цел и не замества консултация с лекар. Преди да започнете нов хранителен режим, тренировъчна програма или прием на добавки, консултирайте се с квалифициран медицински специалист.</p>
    </div>

═══════════════════════════════════════════════
KEYWORD ОПТИМИЗАЦИЯ
═══════════════════════════════════════════════
ВАЖНО: Използвай всички подадени keywords:
- Главната keyword: в първите 100 думи, в поне 2 H2 заглавия, 4-6 пъти в текста
- Вторични keywords: поне 2 пъти всяка в текста
- Естествено вграждане (не keyword stuffing!)

═══════════════════════════════════════════════
ИЗИСКВАНИЯ
═══════════════════════════════════════════════
✓ 3,500 думи минимум
✓ Естествен, приятелски български
✓ Научно точен + мотивиращ
✓ БЕЗ емотикони в заглавия (само в callout boxes)

ЗАДЪЛЖИТЕЛНИ ЕЛЕМЕНТИ:
✓ WARNING BOX в началото на статията
✓ Поне 2-3 KEY TAKEAWAY boxes разпределени в текста
✓ Поне 1-2 INFO boxes при научни данни
✓ Поне 1-2 FEATURED SNIPPET boxes за директни отговори
✓ 1 TestoUP промоционален банер в средата
✓ Поне 1 таблица за сравнение (ако уместно)
✓ ЗАДЪЛЖИТЕЛЕН references section накрая
✓ ЗАДЪЛЖИТЕЛЕН disclaimer накрая`
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

    // Step 10: Add smart internal links
    try {
      console.log('[Cluster] Adding smart internal links...');

      // Fetch all published guides for linking
      const { data: allGuides } = await supabase
        .from('blog_posts')
        .select('id, slug, title, guide_type, guide_category, parent_cluster_slug, suggested_pillars')
        .eq('category', 'learn-guide')
        .eq('is_published', true);

      if (allGuides && allGuides.length > 0) {
        const contentWithLinks = addSmartInternalLinks(savedGuide, allGuides);

        // Update content with links if it changed
        if (contentWithLinks !== savedGuide.content) {
          await supabase
            .from('blog_posts')
            .update({ content: contentWithLinks })
            .eq('id', savedGuide.id);

          console.log('[Cluster] ✅ Internal links added');
        }
      }
    } catch (linkError) {
      console.error('[Cluster] ⚠️ Failed to add internal links:', linkError);
      // Don't fail the whole operation if linking fails
    }

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
