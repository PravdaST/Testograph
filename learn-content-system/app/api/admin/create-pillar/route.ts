import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/utils/slugify';
import { generateImage } from '@/lib/ai/image-generation';
import { findClusterByCategory, findExistingPillars } from '@/lib/utils/check-guide-exists';
import { checkPillarDuplicate } from '@/lib/utils/check-duplicate';
import { validateInternalLinks } from '@/lib/utils/validate-links';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.5-flash-lite';

async function callOpenRouter(messages: any[], temperature = 0.7, maxTokens = 20000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://www.vrachka.eu',
      'X-Title': 'Vrachka Pillar Generator'
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
    const { pillarTitle, category, clusterSlug, clusterTitle, keywords, scheduledFor, mainTopic = 'astrology' } = await request.json();

    // Step 0: Check for duplicate pillar
    console.log('[Pillar] Checking for duplicates...');
    const duplicateCheck = await checkPillarDuplicate(pillarTitle, mainTopic, category);

    if (duplicateCheck.isDuplicate && duplicateCheck.existingPost) {
      console.warn('[Pillar] Duplicate found:', duplicateCheck.existingPost.title);
      return NextResponse.json(
        {
          error: `Pillar вече съществува: "${duplicateCheck.existingPost.title}"`,
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

    console.log('[Pillar] No duplicates found ✅');

    // Check if cluster exists (for smart linking back to cluster)
    let clusterExists = false;
    let clusterData: { title: string; slug: string } | null = null;
    let clusterContext = '';

    if (clusterSlug) {
      const { data: cluster } = await supabase
        .from('blog_posts')
        .select('title, slug, content')
        .eq('slug', clusterSlug)
        .eq('guide_type', 'cluster')
        .eq('status', 'published')
        .single();

      if (cluster) {
        clusterExists = true;
        clusterData = { title: cluster.title, slug: cluster.slug };
        clusterContext = `
Cluster статия: "${cluster.title}"
Този pillar е част от горната cluster тема.`;
      }
    } else {
      // Try to find cluster by category
      clusterData = await findClusterByCategory(category);
      if (clusterData) {
        clusterExists = true;
        clusterContext = `
Cluster статия: "${clusterData.title}"
Този pillar е част от горната cluster тема.`;
      }
    }

    // Get related pillars for internal linking (exclude current pillar)
    const existingPillars = await findExistingPillars(category);
    const relatedPillars = existingPillars.filter(p =>
      p.title.toLowerCase() !== pillarTitle.toLowerCase()
    );

    const relatedPillarsList = relatedPillars
      .map(p => `"${p.title}"`)
      .join(', ') || 'няма';

    // Step 1: Generate pillar content
    const contentPrompt = [
      {
        role: 'system',
        content: `Ти си ЕКСПЕРТЕН астролог и писател на задълбочено образователно съдържание на български език.

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
- <article>, <header>, <footer> тагове
- Complex grids, cards, sections

✅ РАЗРЕШЕНО:
- <p> параграфи
- <h2> и <h3> заглавия (БЕЗ емотикони!)
- <ul>, <li> списъци
- <a href="/learn/${mainTopic}/${category}/SLUG"> internal links (replace SLUG with actual slug)
- <strong> за emphasis
- <div class="tldr-section"> за резюмета
- Таблици с responsive classes

СТРУКТУРА НА PILLAR СТАТИЯ (5,500 думи):

1. TLDR секция (3-4 изречения)
2. Въведение (400 думи) - Защо е важна тази конкретна тема
3. Основни понятия (600 думи) - Дефиниции и терминология
4. Детайлен анализ (1500 думи) - Задълбочено разглеждане на темата
5. Практически примери (1000 думи) - Конкретни случаи и приложения
6. Таблици и данни (800 думи) - Структурирана информация
7. Често задавани въпроси (600 думи) - 5-7 популярни въпроса
8. Заключение (600 думи) - Резюме и препоръки

CRITICAL - SMART INTERNAL LINKING:

${clusterExists && clusterData ? `✅ CLUSTER СЪЩЕСТВУВА (линкни обратно):
   "${clusterData.title}" → <a href="/learn/${mainTopic}/${category}/${clusterData.slug}">${clusterData.title}</a>
   Добави линк в началото И в заключението.` : `⚠️ CLUSTER НЕ СЪЩЕСТВУВА ОЩЕ:
   Споменай общата тема без линк.`}

${relatedPillars.length > 0 ? `✅ RELATED PILLARS (линкни към тях):
${relatedPillars.map((p, i) => `   ${i + 1}. "${p.title}" → <a href="/learn/${mainTopic}/${category}/${p.slug}">${p.title}</a>`).join('\n')}
   Добави 2-3 линка естествено в текста.` : `⚠️ НЯМА други pillar теми още.
   Не слагай линкове към други pillars.`}

ПРАВИЛО: САМО линкове към СЪЩЕСТВУВАЩИ guides! НЕ измисляй линкове!

ТАБЛИЦИ (responsive):
<div class="overflow-x-auto my-6">
  <table class="min-w-full border-collapse border border-zinc-700">
    <thead>
      <tr class="bg-zinc-800">
        <th class="border border-zinc-700 px-4 py-2 text-left">Колона</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-zinc-700 px-4 py-2">Данни</td>
      </tr>
    </tbody>
  </table>
</div>

SEO ОПТИМИЗАЦИЯ:
- Използвай "${pillarTitle}" и keywords естествено
- H2/H3 заглавия с keywords
- Първи параграф с main topic

ВАЖНО:
- 5,500 думи (НЕ по-малко!)
- Задълбочен, експертен тон
- Без емотикони в заглавия
- Чист HTML код
- Естествени internal links`
      },
      {
        role: 'user',
        content: `Създай PILLAR guide за тема: "${pillarTitle}"
Категория: ${category}
Keywords: ${keywords || 'няма'}
${clusterContext}

Related pillars за линкване: ${relatedPillarsList}

Генерирай пълно HTML съдържание (5,500 думи) с internal links.`
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

    // Step 1.5: Validate and auto-fix internal links
    console.log('[Pillar] Validating internal links...');
    const linkValidation = await validateInternalLinks(content, mainTopic, category);

    // Use fixed content if auto-fixes were applied
    if (linkValidation.fixedContent) {
      content = linkValidation.fixedContent;
      console.log('[Pillar] ✅ Applied auto-fixes to content');
    }

    // Log any remaining issues (won't block generation)
    if (!linkValidation.isValid) {
      console.error('[Pillar] ❌ Broken links detected (not blocking generation):', linkValidation.brokenLinks);
    }

    // Step 2: Generate metadata
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
Пример: "Слънцето в астрологията" → "slanceto-v-astrologiyata"`
      },
      {
        role: 'user',
        content: `Заглавие: ${pillarTitle}\nCategory: ${category}`
      }
    ];

    const metaResponse = await callOpenRouter(metaPrompt, 0.5, 500);
    let metadata;
    try {
      metadata = JSON.parse(metaResponse);
      // Ensure slug is Latin - if AI returns Cyrillic, use slugify as fallback
      if (/[\u0400-\u04FF]/.test(metadata.slug)) {
        metadata.slug = slugify(pillarTitle);
      }
    } catch (e) {
      metadata = {
        meta_title: pillarTitle,
        meta_description: pillarTitle,
        slug: slugify(pillarTitle)
      };
    }

    // Step 3: Extract excerpt from TLDR section
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
      console.error('[Pillar] Failed to extract excerpt:', e);
    }

    // Step 4: Generate featured image
    let featuredImageUrl: string | null = null;
    try {
      console.log('[Pillar] Generating featured image...');
      const imagePrompt = `Hero banner for in-depth educational guide titled: "${pillarTitle}". Astrology theme, mystical atmosphere, professional quality, detailed. Category: ${category}. NO TEXT, NO LETTERS on the image. Pure visual symbolism.`;

      const generatedImage = await generateImage({
        prompt: imagePrompt,
        style: 'mystical, professional, astrological symbols, Bulgarian cultural elements, detailed',
        aspectRatio: '16:9'
      });

      featuredImageUrl = generatedImage.url;
      console.log('[Pillar] Featured image generated:', featuredImageUrl);
    } catch (imageError) {
      console.error('[Pillar] Failed to generate featured image:', imageError);
      // Continue without image - not critical
    }

    return NextResponse.json({
      success: true,
      pillar: {
        title: pillarTitle,
        content,
        slug: metadata.slug,
        meta_title: metadata.meta_title,
        meta_description: metadata.meta_description,
        excerpt: excerpt || metadata.meta_description,
        guide_type: 'pillar',
        guide_category: category,
        main_topic: mainTopic,
        category: 'learn-guide',
        status: scheduledFor ? 'draft' : 'published',
        scheduled_for: scheduledFor || null,
        published_at: scheduledFor ? null : new Date().toISOString(),
        keywords: keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
        featured_image_url: featuredImageUrl,
      }
    });

  } catch (error: any) {
    console.error('Pillar generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate pillar' },
      { status: 500 }
    );
  }
}
