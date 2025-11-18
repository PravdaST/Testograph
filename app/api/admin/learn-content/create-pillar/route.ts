import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateAndUploadGuideImages } from '@/lib/ai/image-generation';
import {
  insertImagesIntoContent,
  insertInternalLinks,
  countWords,
  calculateReadingTime,
  extractExcerpt
} from '@/lib/utils/insert-images';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const CONTENT_MODEL = 'google/gemini-2.5-pro';
const SUGGESTION_MODEL = 'google/gemini-2.5-flash-lite';

async function callOpenRouter(messages: any[], temperature = 0.7, maxTokens = 25000, model = CONTENT_MODEL) {
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
    const { title, parent_cluster_slug, category, keywords, is_published, published_at } = await request.json();

    console.log('[Pillar] Starting:', { title, parent_cluster_slug, category, is_published, published_at });

    // Step 1: Fetch parent cluster
    const { data: parentCluster, error: clusterError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', parent_cluster_slug)
      .eq('guide_type', 'cluster')
      .single();

    if (clusterError || !parentCluster) {
      throw new Error('Parent cluster not found');
    }

    // Step 2: Fetch sibling pillars
    const { data: siblingPillars } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('parent_cluster_slug', parent_cluster_slug)
      .eq('guide_type', 'pillar');

    // Step 3: Generate content
    const contentPrompt = [
      {
        role: 'system',
        content: `Ти си ЕКСПЕРТЕН специалист по мъжко здраве, тестостерон, фитнес и хранене. Пишеш ЗАДЪЛБОЧЕНИ образователни статии на ЕСТЕСТВЕН БЪЛГАРСКИ ЕЗИК.

КРИТИЧНО - ЕСТЕСТВЕН БЪЛГАРСКИ:
- Пиши на естествен разговорен български (НЕ директни преводи!)
- Тон: професионален, научен, но приятелски като личен лекар/треньор
- Граматически перфектен

HTML ФОРМАТ:

❌ ЗАБРАНЕНО:
- Емотикони
- H1 тагове
- H2 със заглавието в началото
- Complex markup

✅ РАЗРЕШЕНО:
- <p>, <h2>, <h3>
- <ul>, <li>
- <strong>
- <div class="tldr-section">

СТРУКТУРА (5,500 думи):

1. TLDR (200 думи) - Ключови моменти
2. Въведение (400 думи) - Контекст и важност
3. Задълбочен анализ (2,000 думи) - Детайлна информация
4. Научна обосновка (1,000 думи) - Изследвания, механизми
5. Практически съвети (1,200 думи) - Конкретни действия
6. Често задавани въпроси (400 думи) - 5-6 FAQs
7. Заключение (300 думи) - Резюме

TLDR ФОРМАТ:
<div class="tldr-section">
  <h3>Ключови моменти</h3>
  <ul>
    <li><strong>Точка 1:</strong> Обяснение</li>
    <li><strong>Точка 2:</strong> Обяснение</li>
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

INTERNAL LINKING:
- Link към parent cluster: <a href="/learn/${category}/${parent_cluster_slug}">${parentCluster.title}</a>
${siblingPillars && siblingPillars.length > 0 ? `- Link към sibling pillars: ${siblingPillars.map((s: any) => `<a href="/learn/${category}/${s.slug}">${s.title}</a>`).join(', ')}` : ''}

НАУЧНА ТОЧНОСТ:
- Базирай се на реални медицински изследвания
- Споменавай studies естествено
- БЕЗ pseudo-science

SUBTLE PRODUCT MENTIONS:
- Можеш да споменеш TestoUP естествено
- БЕЗ агресивен marketing
- Фокус: образование

ВАЖНО:
- 5,500 думи минимум
- Задълбочена информация
- Научно точен + практичен`
      },
      {
        role: 'user',
        content: `Създай PILLAR guide за: "${title}"
Parent cluster: "${parentCluster.title}"
Категория: ${category}
Keywords: ${keywords || 'няма'}

Генерирай пълно HTML съдържание (5,500 думи) на естествен български език.`
      }
    ];

    let content = await callOpenRouter(contentPrompt, 0.7, 25000);

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

    // Step 4: Generate metadata
    const metaPrompt = [
      {
        role: 'system',
        content: `Генерирай SEO metadata. Върни САМО JSON:
{
  "meta_title": "SEO заглавие (50-60 символа)",
  "meta_description": "SEO описание (150-160 символа)",
  "slug": "url-slug-latinica"
}`
      },
      {
        role: 'user',
        content: `Заглавие: ${title}`
      }
    ];

    const metaResponse = await callOpenRouter(metaPrompt, 0.5, 500, SUGGESTION_MODEL);
    let metadata;
    try {
      metadata = JSON.parse(metaResponse.trim().replace(/^```json\s*/, '').replace(/\s*```$/, ''));
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

    // Step 5: Generate MULTIPLE images (hero + 3 in-article for pillars)
    let heroImageUrl = '';
    let articleImageUrls: string[] = [];

    try {
      console.log('[Images] Generating hero + article images...');

      const keywordsArray = keywords ? keywords.split(',').map((k: string) => k.trim()) : [];

      const imageResult = await generateAndUploadGuideImages(
        title,
        'pillar', // guide type (generates 4 total images)
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

    // Step 6: Fetch related guides for internal linking
    const { data: relatedGuides } = await supabase
      .from('blog_posts')
      .select('title, slug, guide_category, keywords')
      .eq('category', 'learn-guide')
      .eq('is_published', true)
      .neq('slug', metadata.slug)
      .limit(20);

    // Step 7: Insert internal links to related guides
    let finalContent = content;
    if (relatedGuides && relatedGuides.length > 0) {
      finalContent = insertInternalLinks({
        content: finalContent,
        relatedGuides: relatedGuides.map(g => ({
          title: g.title,
          slug: g.slug,
          category: g.guide_category || category,
          keywords: g.keywords || []
        })),
        currentSlug: metadata.slug,
        maxLinks: 5
      });
      console.log(`[Internal Links] ✅ Added keyword-based links to related guides`);
    }

    // Step 8: Insert article images into content
    if (articleImageUrls.length > 0) {
      finalContent = insertImagesIntoContent({
        content: finalContent,
        imageUrls: articleImageUrls,
        imageAlts: articleImageUrls.map((_, idx) => `${title} - illustration ${idx + 1}`)
      });
      console.log(`[Content] ✅ Inserted ${articleImageUrls.length} images into HTML`);
    }

    // Step 9: Calculate word count & reading time
    const wordCount = countWords(finalContent);
    const readingTime = calculateReadingTime(finalContent);

    console.log(`[Analytics] Word count: ${wordCount} | Reading time: ${readingTime} min`);

    // Step 10: Extract excerpt
    const excerpt = extractExcerpt(finalContent, 200);

    // Step 11: Check for duplicate by slug
    const { data: existingGuide } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('slug', metadata.slug)
      .single();

    if (existingGuide) {
      console.log('[Pillar] ❌ Duplicate detected:', existingGuide.slug);
      return NextResponse.json(
        {
          error: 'Pillar вече съществува',
          existing: {
            id: existingGuide.id,
            title: existingGuide.title,
            slug: existingGuide.slug
          }
        },
        { status: 409 } // Conflict
      );
    }

    // Step 12: Save to database with new fields
    const { data: savedGuide, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: metadata.slug,
        content: finalContent,
        excerpt: excerpt || metadata.meta_description,
        category: 'learn-guide',
        guide_type: 'pillar',
        guide_category: category,
        parent_cluster_slug,
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
      throw new Error(`Database: ${saveError.message}`);
    }

    console.log('[Pillar] ✅ Created:', savedGuide.slug);

    return NextResponse.json({
      success: true,
      guide: savedGuide
    });

  } catch (error: any) {
    console.error('[Pillar] ❌', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate pillar' },
      { status: 500 }
    );
  }
}
