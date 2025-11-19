import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface KeywordStats {
  keyword: string;
  total_count: number;
  article_count: number;
  title_count: number;
  meta_title_count: number;
  meta_description_count: number;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  content_count: number;
  articles: {
    slug: string;
    title: string;
    count: number;
  }[];
}

// Helper: Extract text from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');

  // Clean whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text.toLowerCase();
}

// Helper: Extract heading text
function extractHeadings(html: string, tag: 'h1' | 'h2' | 'h3'): string[] {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gi');
  const matches = [...html.matchAll(regex)];
  return matches.map(m => extractTextFromHTML(m[1]));
}

// Helper: Count keyword occurrences in text
function countKeyword(text: string, keyword: string): number {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  // Use word boundaries for exact matches
  const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = lowerText.match(regex);

  return matches ? matches.length : 0;
}

// GET /api/admin/keywords/on-site-analysis - Analyze on-site keyword usage
export async function GET(request: Request) {
  console.log('[On-Site Analysis] Starting analysis...');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[On-Site Analysis] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[On-Site Analysis] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // 1. Fetch all published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, content, meta_title, meta_description, excerpt')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('[On-Site Analysis] Error fetching posts:', postsError);
      throw new Error('Failed to fetch blog posts');
    }

    if (!posts || posts.length === 0) {
      console.log('[On-Site Analysis] No published posts found');
      return NextResponse.json({
        keywords: [],
        total_posts: 0,
        total_keywords: 0,
      });
    }

    console.log(`[On-Site Analysis] Analyzing ${posts.length} posts...`);

    // 2. Get target keywords to analyze
    const { data: targetKeywords } = await supabase
      .from('target_keywords')
      .select('keyword')
      .order('focus_score', { ascending: false });

    // 3. Get GSC keywords too
    const { data: gscKeywords } = await supabase
      .from('gsc_keyword_performance')
      .select('keyword')
      .order('clicks', { ascending: false })
      .limit(100);

    // Combine all keywords to analyze (unique)
    const allKeywords = new Set<string>();

    targetKeywords?.forEach(k => allKeywords.add(k.keyword.toLowerCase()));
    gscKeywords?.forEach(k => allKeywords.add(k.keyword.toLowerCase()));

    // Also extract common words from content (2+ words, appears in 2+ posts)
    const wordFrequency = new Map<string, Set<string>>();

    posts.forEach(post => {
      const allText = [
        post.title,
        post.meta_title,
        post.meta_description,
        extractTextFromHTML(post.content || ''),
      ].join(' ').toLowerCase();

      // Extract 2-3 word phrases
      const words = allText.match(/\b[\p{L}]+(?:\s+[\p{L}]+){1,2}\b/gu) || [];

      words.forEach(phrase => {
        const normalized = phrase.toLowerCase().trim();
        if (normalized.length < 5) return; // Skip very short phrases

        if (!wordFrequency.has(normalized)) {
          wordFrequency.set(normalized, new Set());
        }
        wordFrequency.get(normalized)!.add(post.id);
      });
    });

    // Add common phrases that appear in 2+ posts
    wordFrequency.forEach((postIds, phrase) => {
      if (postIds.size >= 2) {
        allKeywords.add(phrase);
      }
    });

    console.log(`[On-Site Analysis] Analyzing ${allKeywords.size} keywords across ${posts.length} posts...`);

    // 4. Analyze each keyword
    const keywordStatsMap = new Map<string, KeywordStats>();

    allKeywords.forEach(keyword => {
      const stats: KeywordStats = {
        keyword,
        total_count: 0,
        article_count: 0,
        title_count: 0,
        meta_title_count: 0,
        meta_description_count: 0,
        h1_count: 0,
        h2_count: 0,
        h3_count: 0,
        content_count: 0,
        articles: [],
      };

      posts.forEach(post => {
        let postCount = 0;

        // Count in title
        const titleCount = countKeyword(post.title, keyword);
        if (titleCount > 0) {
          stats.title_count += titleCount;
          postCount += titleCount;
        }

        // Count in meta_title
        if (post.meta_title) {
          const metaTitleCount = countKeyword(post.meta_title, keyword);
          if (metaTitleCount > 0) {
            stats.meta_title_count += metaTitleCount;
            postCount += metaTitleCount;
          }
        }

        // Count in meta_description
        if (post.meta_description) {
          const metaDescCount = countKeyword(post.meta_description, keyword);
          if (metaDescCount > 0) {
            stats.meta_description_count += metaDescCount;
            postCount += metaDescCount;
          }
        }

        // Count in headings
        if (post.content) {
          const h1s = extractHeadings(post.content, 'h1');
          const h2s = extractHeadings(post.content, 'h2');
          const h3s = extractHeadings(post.content, 'h3');

          h1s.forEach(h => {
            const count = countKeyword(h, keyword);
            if (count > 0) {
              stats.h1_count += count;
              postCount += count;
            }
          });

          h2s.forEach(h => {
            const count = countKeyword(h, keyword);
            if (count > 0) {
              stats.h2_count += count;
              postCount += count;
            }
          });

          h3s.forEach(h => {
            const count = countKeyword(h, keyword);
            if (count > 0) {
              stats.h3_count += count;
              postCount += count;
            }
          });

          // Count in body text (excluding headings)
          const bodyText = extractTextFromHTML(post.content);
          const bodyCount = countKeyword(bodyText, keyword);
          if (bodyCount > 0) {
            stats.content_count += bodyCount;
            postCount += bodyCount;
          }
        }

        // If keyword appears in this post, add to articles list
        if (postCount > 0) {
          stats.article_count++;
          stats.total_count += postCount;
          stats.articles.push({
            slug: post.slug,
            title: post.title,
            count: postCount,
          });
        }
      });

      // Only add keywords that appear at least once
      if (stats.total_count > 0) {
        keywordStatsMap.set(keyword, stats);
      }
    });

    // Convert to array and sort by total_count
    const keywordStats = Array.from(keywordStatsMap.values())
      .sort((a, b) => b.total_count - a.total_count);

    console.log(`[On-Site Analysis] ✅ Found ${keywordStats.length} keywords with usage data`);

    return NextResponse.json({
      keywords: keywordStats,
      total_posts: posts.length,
      total_keywords: keywordStats.length,
      analyzed_at: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('[On-Site Analysis] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze on-site keywords' },
      { status: 500 }
    );
  }
}
