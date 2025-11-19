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

    console.log('\n═══════════════════════════════════════════════');
    console.log('🚀 [Pillar] Starting generation');
    console.log('═══════════════════════════════════════════════');
    console.log('Title:', title);
    console.log('Parent:', parent_cluster_slug);
    console.log('Category:', category);
    console.log('Published:', is_published);
    console.log('Publish date:', published_at || 'not scheduled');
    console.log('═══════════════════════════════════════════════\n');

    // Step 1: Fetch parent cluster
    console.log('[Step 1] Fetching parent cluster...');
    const { data: parentCluster, error: clusterError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', parent_cluster_slug)
      .eq('guide_type', 'cluster')
      .single();

    if (clusterError || !parentCluster) {
      throw new Error('Parent cluster not found');
    }
    console.log('[Step 1] ✅ Parent cluster:', parentCluster.title);

    // Step 2: Fetch sibling pillars for internal linking
    console.log('[Step 2] Fetching sibling pillars...');
    const { data: siblingPillars } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('parent_cluster_slug', parent_cluster_slug)
      .eq('guide_type', 'pillar');

    console.log(`[Step 2] ✅ Found ${siblingPillars?.length || 0} sibling pillars`);

    // Step 3: Generate content
    const siblingLinks = siblingPillars && siblingPillars.length > 0
      ? `\nSibling pillars за internal linking:\n${siblingPillars.map((s: any) => `- ${s.title} (/learn/${category}/${s.slug})`).join('\n')}`
      : '';

    const contentPrompt = [
      {
        role: 'system',
        content: `Ти си експертен специалист по мъжко здраве, тестостерон, фитнес и хранене. Създаваш задълбочени образователни статии на естествен български език.

═══════════════════════════════════════════════
ЕЗИК И ТОН
═══════════════════════════════════════════════
✅ Естествен разговорен български (НЕ директни преводи)
✅ Професионален, научен, но приятелски тон
✅ Като личен лекар/треньор
✅ Граматически перфектен

═══════════════════════════════════════════════
HTML ФОРМАТ
═══════════════════════════════════════════════
✅ РАЗРЕШЕНИ: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>
❌ ЗАБРАНЕНИ: Емотикони, <h1> тагове, complex markup

СПЕЦИАЛНИ СЕКЦИИ:
<div class="tldr-section"> - за TLDR
<div class="faq-section"> - за FAQ
<div class="faq-item"> - за всеки въпрос

═══════════════════════════════════════════════
СТРУКТУРА (5,500+ думи)
═══════════════════════════════════════════════
1. TLDR (200 думи)
   - Списък с ключови моменти
   - <div class="tldr-section">

2. Въведение (400 думи)
   - Защо е важна темата
   - Какво ще научи читателят
   - Link към parent cluster естествено в текста

3. Задълбочен анализ (2,000 думи)
   - 3-4 под-секции с <h2>
   - Детайлни обяснения
   - Научни факти

4. Научна обосновка (1,000 думи)
   - Изследвания и studies
   - Механизми на действие
   - БЕЗ pseudo-science

5. Практически съвети (1,200 думи)
   - Конкретни действия
   - Списъци с препоръки
   - Може естествено да споменеш TestoUP

6. FAQ секция (400 думи)
   - 5-6 въпроса
   - <div class="faq-section">

7. Заключение (300 думи)
   - Резюме на ключовите точки
   - Мотивация за действие

═══════════════════════════════════════════════
INTERNAL LINKING
═══════════════════════════════════════════════
Parent cluster: ${parentCluster.title}
Link: <a href="/learn/${category}/${parent_cluster_slug}">${parentCluster.title}</a>${siblingLinks}

Вгради линковете ЕСТЕСТВЕНО в текста, не на едно място.

═══════════════════════════════════════════════
ИЗИСКВАНИЯ
═══════════════════════════════════════════════
✓ Минимум 5,500 думи
✓ Научна точност
✓ Практическа стойност
✓ Subtle product mentions (не агресивен marketing)
✓ БЕЗ H2 със заглавието в началото`
      },
      {
        role: 'user',
        content: `Създай PILLAR guide:

Заглавие: ${title}
Parent cluster: ${parentCluster.title}
Категория: ${category}
${keywords ? `Keywords: ${keywords}` : ''}

Генерирай пълното HTML съдържание (5,500+ думи) на естествен български език.`
      }
    ];

    console.log('[Step 3] Generating content with AI (5,500+ words)...');
    let content = await callOpenRouter(contentPrompt, 0.7, 25000);
    console.log('[Step 3] ✅ Content generated');

    // Clean AI-generated markdown artifacts
    console.log('[Step 3] Cleaning AI artifacts...');
    content = content
      .trim()
      // Remove markdown code fences
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```\s*$/g, '')
      // Remove markdown asterisks
      .replace(/^\*+\s*/gm, '')
      .trim();

    // Remove AI introductory text (anything before first HTML tag)
    const htmlTagMatch = content.match(/<(div|p|h2|h3|ul|article)/i);
    if (htmlTagMatch?.index && htmlTagMatch.index > 0) {
      content = content.substring(htmlTagMatch.index);
    }

    // Step 4: Generate metadata
    console.log('[Metadata] Generating SEO metadata...');

    const metaPrompt = [
      {
        role: 'system',
        content: `Генерирай SEO-оптимизирано metadata за статия. Върни САМО валиден JSON без допълнителен текст:

{
  "meta_title": "SEO заглавие (50-60 символа, включва ключова дума)",
  "meta_description": "SEO описание (150-160 символа, ангажиращо и информативно)",
  "slug": "url-slug-v-latinica-kebab-case"
}

Изисквания:
- meta_title: кратко, ясно, с ключова дума
- meta_description: накара да кликнат, включи полза
- slug: само латински букви, цифри и тире`
      },
      {
        role: 'user',
        content: `Заглавие: ${title}
Категория: ${category}`
      }
    ];

    let metadata;
    try {
      const metaResponse = await callOpenRouter(metaPrompt, 0.5, 500, SUGGESTION_MODEL);
      const cleaned = metaResponse.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      metadata = JSON.parse(cleaned);

      // Validate and fix slug if contains cyrillic
      if (/[\u0400-\u04FF]/.test(metadata.slug)) {
        console.log('[Metadata] ⚠️ Slug contains cyrillic, using slugify fallback');
        metadata.slug = slugify(title);
      }

      console.log('[Metadata] ✅ Generated:', metadata.slug);
    } catch (e) {
      console.log('[Metadata] ⚠️ JSON parse failed, using fallback');
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
    console.log('[Step 6] Fetching related guides for internal linking...');
    const { data: relatedGuides } = await supabase
      .from('blog_posts')
      .select('title, slug, guide_category, keywords')
      .eq('category', 'learn-guide')
      .eq('is_published', true)
      .neq('slug', metadata.slug)
      .limit(20);

    console.log(`[Step 6] ✅ Found ${relatedGuides?.length || 0} related guides`);

    // Step 7: Insert internal links to related guides
    console.log('[Step 7] Adding keyword-based internal links...');
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
      console.log('[Step 7] ✅ Internal links added');
    } else {
      console.log('[Step 7] ⚠️ No related guides for linking');
    }

    // Step 8: Insert article images into content
    console.log('[Step 8] Inserting images into content...');
    if (articleImageUrls.length > 0) {
      finalContent = insertImagesIntoContent({
        content: finalContent,
        imageUrls: articleImageUrls,
        imageAlts: articleImageUrls.map((_, idx) => `${title} - illustration ${idx + 1}`)
      });
      console.log(`[Step 8] ✅ Inserted ${articleImageUrls.length} images`);
    } else {
      console.log('[Step 8] ⚠️ No images to insert');
    }

    // Step 9: Calculate word count & reading time
    console.log('[Step 9] Calculating analytics...');
    const wordCount = countWords(finalContent);
    const readingTime = calculateReadingTime(finalContent);
    console.log(`[Step 9] ✅ Word count: ${wordCount} | Reading time: ${readingTime} min`);

    // Step 10: Extract excerpt
    console.log('[Step 10] Extracting excerpt...');
    const excerpt = extractExcerpt(finalContent, 200);
    console.log('[Step 10] ✅ Excerpt extracted');

    // Step 11: Check for duplicate by slug
    console.log('[Step 11] Checking for duplicates...');
    const { data: existingGuide } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('slug', metadata.slug)
      .single();

    if (existingGuide) {
      console.log('[Step 11] ❌ DUPLICATE DETECTED:', existingGuide.slug);
      return NextResponse.json(
        {
          error: 'Pillar вече съществува',
          existing: {
            id: existingGuide.id,
            title: existingGuide.title,
            slug: existingGuide.slug
          }
        },
        { status: 409 }
      );
    }
    console.log('[Step 11] ✅ No duplicates found');

    // Step 12: Save to database
    console.log('[Step 12] Saving to database...');
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
        published_at: published_at || null,
        word_count: wordCount,
        reading_time: readingTime,
        keywords: keywords ? keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) : []
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Database save failed: ${saveError.message}`);
    }
    console.log('[Step 12] ✅ Saved to database:', savedGuide.slug);

    // Step 13: Remove pillar from parent cluster's suggested_pillars
    console.log('[Step 13] Cleaning up parent cluster suggested_pillars...');
    try {
      const { data: parentClusterData } = await supabase
        .from('blog_posts')
        .select('suggested_pillars')
        .eq('slug', parent_cluster_slug)
        .eq('guide_type', 'cluster')
        .single();

      if (parentClusterData?.suggested_pillars) {
        const originalCount = parentClusterData.suggested_pillars.length;
        const updatedSuggestedPillars = parentClusterData.suggested_pillars.filter(
          (suggestedTitle: string) => suggestedTitle.toLowerCase().trim() !== title.toLowerCase().trim()
        );

        if (updatedSuggestedPillars.length < originalCount) {
          await supabase
            .from('blog_posts')
            .update({ suggested_pillars: updatedSuggestedPillars })
            .eq('slug', parent_cluster_slug)
            .eq('guide_type', 'cluster');

          console.log('[Step 13] ✅ Removed from suggested_pillars');
        } else {
          console.log('[Step 13] ℹ️ Not found in suggested_pillars');
        }
      }
    } catch (clusterUpdateError) {
      console.error('[Step 13] ⚠️ Cleanup failed:', clusterUpdateError);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ [Pillar] SUCCESSFULLY CREATED');
    console.log('═══════════════════════════════════════════════');
    console.log('Slug:', savedGuide.slug);
    console.log('Words:', wordCount);
    console.log('Reading time:', readingTime, 'min');
    console.log('Published:', savedGuide.is_published);
    console.log('═══════════════════════════════════════════════\n');

    return NextResponse.json({
      success: true,
      guide: savedGuide
    });

  } catch (error: any) {
    console.error('\n═══════════════════════════════════════════════');
    console.error('❌ [Pillar] GENERATION FAILED');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error.message || error);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════\n');

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate pillar',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
