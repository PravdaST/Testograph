import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// POST /api/admin/keywords/analyze-onpage - Analyze on-page SEO for a keyword
export async function POST(request: Request) {
  console.log('[On-Page SEO API] POST - Starting analysis');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[On-Page SEO API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[On-Page SEO API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { keyword_id } = body;

    if (!keyword_id) {
      return NextResponse.json(
        { error: 'keyword_id is required' },
        { status: 400 }
      );
    }

    // Get keyword details
    const { data: keyword, error: keywordError } = await supabase
      .from('target_keywords')
      .select('id, keyword, target_url')
      .eq('id', keyword_id)
      .single();

    if (keywordError || !keyword) {
      console.error('[On-Page SEO API] Keyword not found:', keywordError);
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    if (!keyword.target_url) {
      return NextResponse.json(
        { error: 'Keyword has no target URL assigned' },
        { status: 400 }
      );
    }

    // Normalize URL
    let targetUrl = keyword.target_url;
    if (!targetUrl.startsWith('http')) {
      // Assume it's a relative URL for testograph.eu
      targetUrl = `https://testograph.eu${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
    }

    console.log('[On-Page SEO API] Analyzing:', targetUrl);

    // Create pending analysis record
    const { data: analysis, error: createError } = await supabase
      .from('onpage_seo_analysis')
      .insert({
        keyword_id: keyword.id,
        target_url: keyword.target_url,
        status: 'analyzing'
      })
      .select()
      .single();

    if (createError) {
      console.error('[On-Page SEO API] Failed to create analysis:', createError);
      throw createError;
    }

    // Fetch and analyze the page
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TestographSEO/1.0)'
        },
        // 10 second timeout
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract meta information
      const metaTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const metaDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

      // Extract H1 tags
      const h1Tags: string[] = [];
      $('h1').each((_, el) => {
        const text = $(el).text().trim();
        if (text) h1Tags.push(text);
      });

      // Extract body text (excluding script, style, etc.)
      $('script, style, noscript, iframe').remove();
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

      // Normalize keyword for comparison (lowercase, remove diacritics for Bulgarian)
      const normalizedKeyword = keyword.keyword.toLowerCase().trim();

      // Check if keyword appears in various places (case-insensitive)
      const metaTitleLower = metaTitle.toLowerCase();
      const metaDescriptionLower = metaDescription.toLowerCase();
      const bodyTextLower = bodyText.toLowerCase();

      const hasMetaTitle = metaTitle.length > 0;
      const metaTitleMatch = metaTitleLower.includes(normalizedKeyword);

      const hasMetaDescription = metaDescription.length > 0;
      const metaDescriptionMatch = metaDescriptionLower.includes(normalizedKeyword);

      const hasH1 = h1Tags.length > 0;
      const h1Matches = h1Tags.filter(h1 => h1.toLowerCase().includes(normalizedKeyword));

      // Calculate keyword density
      const words = bodyText.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;

      // Count keyword occurrences (handle multi-word keywords)
      const keywordWords = normalizedKeyword.split(/\s+/);
      let keywordCount = 0;

      if (keywordWords.length === 1) {
        // Single word keyword
        keywordCount = words.filter(w => w.toLowerCase() === normalizedKeyword).length;
      } else {
        // Multi-word keyword - look for phrase occurrences
        const regex = new RegExp(normalizedKeyword.replace(/\s+/g, '\\s+'), 'gi');
        const matches = bodyTextLower.match(regex);
        keywordCount = matches ? matches.length : 0;
      }

      const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

      // Calculate SEO score (0-100)
      let score = 0;
      const recommendations: Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low' }> = [];

      // H1 check (25 points)
      if (hasH1 && h1Matches.length > 0) {
        score += 25;
      } else if (!hasH1) {
        recommendations.push({
          type: 'h1_missing',
          message: 'Страницата няма H1 tag. Добавете H1 с ключовата дума.',
          priority: 'high'
        });
      } else if (h1Matches.length === 0) {
        recommendations.push({
          type: 'h1_no_keyword',
          message: `H1 tag-ът не съдържа ключовата дума "${keyword.keyword}". Оптимизирайте H1.`,
          priority: 'high'
        });
      }

      // Meta title check (25 points)
      if (hasMetaTitle && metaTitleMatch) {
        score += 25;
      } else if (!hasMetaTitle) {
        recommendations.push({
          type: 'meta_title_missing',
          message: 'Страницата няма title tag. Добавете title с ключовата дума.',
          priority: 'high'
        });
      } else if (!metaTitleMatch) {
        recommendations.push({
          type: 'meta_title_no_keyword',
          message: `Title tag-ът не съдържа ключовата дума "${keyword.keyword}". Оптимизирайте title.`,
          priority: 'high'
        });
      }

      // Meta description check (20 points)
      if (hasMetaDescription && metaDescriptionMatch) {
        score += 20;
      } else if (!hasMetaDescription) {
        recommendations.push({
          type: 'meta_description_missing',
          message: 'Страницата няма meta description. Добавете description с ключовата дума.',
          priority: 'medium'
        });
      } else if (!metaDescriptionMatch) {
        recommendations.push({
          type: 'meta_description_no_keyword',
          message: `Meta description не съдържа ключовата дума "${keyword.keyword}".`,
          priority: 'medium'
        });
      }

      // Keyword density check (30 points)
      if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
        // Optimal range: 0.5% - 2.5%
        score += 30;
      } else if (keywordDensity > 0 && keywordDensity < 0.5) {
        score += 15;
        recommendations.push({
          type: 'keyword_density_low',
          message: `Keyword density е твърде ниска (${keywordDensity.toFixed(2)}%). Целева стойност: 1-2%.`,
          priority: 'medium'
        });
      } else if (keywordDensity > 2.5) {
        score += 15;
        recommendations.push({
          type: 'keyword_density_high',
          message: `Keyword density е твърде висока (${keywordDensity.toFixed(2)}%). Риск от keyword stuffing. Целева стойност: 1-2%.`,
          priority: 'high'
        });
      } else {
        recommendations.push({
          type: 'keyword_not_found',
          message: `Ключовата дума "${keyword.keyword}" не се среща в текста на страницата.`,
          priority: 'high'
        });
      }

      // Update analysis with results
      const { error: updateError } = await supabase
        .from('onpage_seo_analysis')
        .update({
          has_h1: hasH1,
          h1_matches: h1Matches,
          has_meta_title: hasMetaTitle,
          meta_title: metaTitle.substring(0, 500), // Limit length
          meta_title_match: metaTitleMatch,
          has_meta_description: hasMetaDescription,
          meta_description: metaDescription.substring(0, 1000),
          meta_description_match: metaDescriptionMatch,
          keyword_density: keywordDensity,
          word_count: wordCount,
          keyword_count: keywordCount,
          seo_score: score,
          recommendations: recommendations,
          status: 'completed',
          analyzed_at: new Date().toISOString()
        })
        .eq('id', analysis.id);

      if (updateError) {
        console.error('[On-Page SEO API] Failed to update analysis:', updateError);
        throw updateError;
      }

      console.log('[On-Page SEO API] ✅ Analysis completed. Score:', score);

      return NextResponse.json({
        success: true,
        analysis: {
          id: analysis.id,
          keyword: keyword.keyword,
          target_url: targetUrl,
          seo_score: score,
          has_h1: hasH1,
          h1_matches: h1Matches,
          meta_title_match: metaTitleMatch,
          meta_description_match: metaDescriptionMatch,
          keyword_density: keywordDensity,
          recommendations: recommendations
        }
      });

    } catch (fetchError: any) {
      console.error('[On-Page SEO API] Failed to fetch/analyze page:', fetchError);

      // Update analysis with error
      await supabase
        .from('onpage_seo_analysis')
        .update({
          status: 'failed',
          error_message: fetchError.message || 'Failed to fetch page'
        })
        .eq('id', analysis.id);

      return NextResponse.json(
        {
          error: 'Failed to analyze page',
          details: fetchError.message
        },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error('[On-Page SEO API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze on-page SEO' },
      { status: 500 }
    );
  }
}

// GET /api/admin/keywords/analyze-onpage?keyword_id=xxx - Get analysis results
export async function GET(request: Request) {
  console.log('[On-Page SEO API] GET - Fetching analysis results');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[On-Page SEO API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[On-Page SEO API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('keyword_id');

    if (!keywordId) {
      return NextResponse.json(
        { error: 'keyword_id parameter is required' },
        { status: 400 }
      );
    }

    // Get latest analysis for this keyword
    const { data: analysis, error: analysisError } = await supabase
      .from('onpage_seo_analysis')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (analysisError) {
      if (analysisError.code === 'PGRST116') {
        // No analysis found
        return NextResponse.json({ analysis: null });
      }
      throw analysisError;
    }

    return NextResponse.json({ analysis });

  } catch (err: any) {
    console.error('[On-Page SEO API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
