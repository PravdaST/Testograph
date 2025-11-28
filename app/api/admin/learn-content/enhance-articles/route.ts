import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Безопасно добавя Disclaimer и References секции към съществуващи статии
 * НЕ променя основното съдържание - само добавя в края
 */

// Медицински отказ от отговорност на правилен български език
const DISCLAIMER_SECTION = `
<div class="disclaimer-section">
  <h3>Медицински отказ от отговорност</h3>
  <p>Информацията в тази статия е предоставена единствено с образователна цел и не представлява медицински съвет, диагноза или лечение. Съдържанието не замества професионална медицинска консултация.</p>
  <p>Преди да предприемете каквито и да било промени в начина си на живот, хранене, физическа активност или прием на хранителни добавки, препоръчваме да се консултирате с квалифициран лекар или специалист.</p>
  <p>Авторите и издателите на този материал не носят отговорност за каквито и да било последици, произтичащи от използването на представената информация.</p>
</div>`;

// Източници секция на правилен български език
const REFERENCES_SECTION = `
<div class="references-section">
  <h3>Източници и допълнително четене</h3>
  <p>Тази статия е базирана на съвременни научни изследвания и авторитетни медицински източници. За повече информация относно мъжкото здраве и хормоналния баланс, препоръчваме да се консултирате със следните ресурси:</p>
  <ul>
    <li>Световна здравна организация (СЗО) - препоръки за мъжко здраве</li>
    <li>Европейска асоциация по урология - клинични насоки</li>
    <li>Национален институт по здравеопазване - изследвания за тестостерон</li>
    <li>PubMed - рецензирани научни публикации</li>
  </ul>
  <p><em>Последна актуализация на статията: ${new Date().toLocaleDateString('bg-BG', { year: 'numeric', month: 'long' })}</em></p>
</div>`;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { articleId, dryRun = true } = body;

    // Ако е подаден конкретен articleId, обработваме само него
    // Иначе обработваме всички статии без disclaimer
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, content, is_published')
      .eq('is_published', true)
      .not('content', 'like', '%disclaimer-section%');

    if (articleId) {
      query = query.eq('id', articleId);
    }

    const { data: articles, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        message: 'Няма статии за обновяване - всички вече имат disclaimer секция',
        updated: 0
      });
    }

    const results: Array<{
      id: string;
      title: string;
      slug: string;
      status: 'updated' | 'skipped' | 'error';
      message?: string;
    }> = [];

    for (const article of articles) {
      try {
        // Проверка дали вече има disclaimer (допълнителна защита)
        if (article.content.includes('disclaimer-section')) {
          results.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            status: 'skipped',
            message: 'Вече има disclaimer секция'
          });
          continue;
        }

        // Проверка дали вече има references
        const hasReferences = article.content.includes('references-section');

        // Създаваме подобреното съдържание
        let enhancedContent = article.content.trim();

        // Добавяме references секция ако я няма
        if (!hasReferences) {
          enhancedContent += '\n\n' + REFERENCES_SECTION;
        }

        // Винаги добавяме disclaimer накрая
        enhancedContent += '\n\n' + DISCLAIMER_SECTION;

        if (dryRun) {
          // Режим на тестване - не записваме промените
          results.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            status: 'updated',
            message: `DRY RUN: Ще добави ${hasReferences ? 'само disclaimer' : 'references + disclaimer'}`
          });
        } else {
          // Реално обновяване
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({
              content: enhancedContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', article.id);

          if (updateError) {
            results.push({
              id: article.id,
              title: article.title,
              slug: article.slug,
              status: 'error',
              message: updateError.message
            });
          } else {
            results.push({
              id: article.id,
              title: article.title,
              slug: article.slug,
              status: 'updated',
              message: `Успешно добавени ${hasReferences ? 'disclaimer' : 'references + disclaimer'}`
            });
          }
        }
      } catch (err) {
        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: 'error',
          message: err instanceof Error ? err.message : 'Неизвестна грешка'
        });
      }
    }

    const updated = results.filter(r => r.status === 'updated').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      message: dryRun
        ? `DRY RUN: ${updated} статии ще бъдат обновени`
        : `Успешно обновени ${updated} статии`,
      summary: {
        total: articles.length,
        updated,
        skipped,
        errors
      },
      dryRun,
      results
    });

  } catch (error) {
    console.error('Error enhancing articles:', error);
    return NextResponse.json(
      { error: 'Грешка при обновяване на статиите' },
      { status: 500 }
    );
  }
}

// GET endpoint за преглед на статиите без disclaimer
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: articles, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, guide_type, is_published, created_at')
      .eq('is_published', true)
      .not('content', 'like', '%disclaimer-section%')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Намерени ${articles?.length || 0} статии без disclaimer секция`,
      articles: articles || []
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Грешка при извличане на статиите' },
      { status: 500 }
    );
  }
}
