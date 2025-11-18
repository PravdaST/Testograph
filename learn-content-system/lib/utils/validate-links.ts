/**
 * Validate internal links in generated HTML content
 * Ensures all links point to existing, published content
 */

import { createClient } from '@/lib/supabase/server';

export interface LinkValidationResult {
  isValid: boolean;
  brokenLinks: Array<{
    url: string;
    text: string;
    reason: string;
    line?: number;
  }>;
  warnings: Array<{
    url: string;
    text: string;
    message: string;
    line?: number;
  }>;
  fixedContent?: string; // Auto-fixed content if any fixes were applied
}

/**
 * Validate all internal /learn/* links in HTML content
 */
export async function validateInternalLinks(
  content: string,
  expectedMainTopic: string,
  expectedCategory: string
): Promise<LinkValidationResult> {
  const supabase = await createClient();
  const brokenLinks: LinkValidationResult['brokenLinks'] = [];
  const warnings: LinkValidationResult['warnings'] = [];
  let fixedContent = content;
  let contentWasFixed = false;

  // Match all internal learn links with capture groups
  // Format: <a href="/learn/TOPIC/CATEGORY/SLUG">TEXT</a>
  const linkRegex = /<a\s+href="(\/learn\/[^"]+)">([^<]+)<\/a>/gi;
  const matches = [...content.matchAll(linkRegex)];

  console.log(`[Link Validation] Found ${matches.length} internal links to validate`);

  for (const match of matches) {
    const fullUrl = match[1]; // e.g., "/learn/astrology/planets/merkuriy"
    const linkText = match[2];
    const fullMatch = match[0]; // Full <a> tag

    // Extract parts from URL
    const urlParts = fullUrl.replace('/learn/', '').split('/');

    if (urlParts.length !== 3) {
      brokenLinks.push({
        url: fullUrl,
        text: linkText,
        reason: `Invalid URL structure (expected /learn/topic/category/slug, got ${urlParts.length} parts)`
      });
      continue;
    }

    const [topic, category, slug] = urlParts;

    // Warn if topic doesn't match expected
    if (topic !== expectedMainTopic) {
      warnings.push({
        url: fullUrl,
        text: linkText,
        message: `Links to different topic "${topic}" (current article is "${expectedMainTopic}")`
      });

      // AUTO-FIX: Replace wrong topic with correct one
      const fixedUrl = `/learn/${expectedMainTopic}/${category}/${slug}`;
      const fixedLink = `<a href="${fixedUrl}">${linkText}</a>`;
      fixedContent = fixedContent.replace(fullMatch, fixedLink);
      contentWasFixed = true;

      console.log(`[Link Validation] Auto-fixed: ${fullUrl} → ${fixedUrl}`);
    }

    // Verify that linked content exists and is published
    const { data: linkedPost } = await supabase
      .from('blog_posts')
      .select('id, title, status, guide_type, main_topic, guide_category')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!linkedPost) {
      brokenLinks.push({
        url: fullUrl,
        text: linkText,
        reason: `Target content "${slug}" not found or not published`
      });
      continue;
    }

    // Verify topic and category match
    if (linkedPost.main_topic !== topic || linkedPost.guide_category !== category) {
      warnings.push({
        url: fullUrl,
        text: linkText,
        message: `URL mismatch: link says "${topic}/${category}" but content is "${linkedPost.main_topic}/${linkedPost.guide_category}"`
      });

      // AUTO-FIX: Use correct topic/category from database
      const correctUrl = `/learn/${linkedPost.main_topic}/${linkedPost.guide_category}/${slug}`;
      const fixedLink = `<a href="${correctUrl}">${linkText}</a>`;
      fixedContent = fixedContent.replace(fullMatch, fixedLink);
      contentWasFixed = true;

      console.log(`[Link Validation] Auto-fixed URL mismatch: ${fullUrl} → ${correctUrl}`);
    }
  }

  // Log summary
  if (brokenLinks.length > 0) {
    console.error(`[Link Validation] ❌ ${brokenLinks.length} broken links found:`);
    brokenLinks.forEach(link => console.error(`  - ${link.url}: ${link.reason}`));
  }

  if (warnings.length > 0) {
    console.warn(`[Link Validation] ⚠️ ${warnings.length} warnings:`);
    warnings.forEach(warn => console.warn(`  - ${warn.url}: ${warn.message}`));
  }

  if (contentWasFixed) {
    console.log(`[Link Validation] 🔧 Auto-fixed ${warnings.length} link(s)`);
  }

  if (brokenLinks.length === 0 && warnings.length === 0) {
    console.log(`[Link Validation] ✅ All ${matches.length} links are valid`);
  }

  return {
    isValid: brokenLinks.length === 0,
    brokenLinks,
    warnings,
    fixedContent: contentWasFixed ? fixedContent : undefined
  };
}

/**
 * Quick check: does this slug exist in the database?
 */
export async function linkExists(slug: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1);

  return !!(data && data.length > 0);
}
