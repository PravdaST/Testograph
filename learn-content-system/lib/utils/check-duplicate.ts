/**
 * Check if a cluster or pillar with the same title already exists
 * This prevents duplicate content creation and wasted AI API calls
 */

import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slugify';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingPost?: {
    id: string;
    title: string;
    slug: string;
    guide_type: 'cluster' | 'pillar';
    main_topic: string;
    guide_category: string;
  };
}

/**
 * Check if a cluster already exists with the same or similar title
 */
export async function checkClusterDuplicate(
  title: string,
  mainTopic: string,
  category: string
): Promise<DuplicateCheckResult> {
  const supabase = await createClient();

  // Strategy: Check by slug (most reliable) and fuzzy title match
  const expectedSlug = slugify(title);

  const { data: duplicates } = await supabase
    .from('blog_posts')
    .select('id, title, slug, guide_type, main_topic, guide_category')
    .eq('guide_type', 'cluster')
    .eq('main_topic', mainTopic)
    .eq('guide_category', category)
    .or(`slug.eq.${expectedSlug},title.ilike.%${title}%`)
    .limit(1);

  if (duplicates && duplicates.length > 0) {
    return {
      isDuplicate: true,
      existingPost: duplicates[0] as DuplicateCheckResult['existingPost']
    };
  }

  return { isDuplicate: false };
}

/**
 * Check if a pillar already exists with the same or similar title
 */
export async function checkPillarDuplicate(
  title: string,
  mainTopic: string,
  category: string
): Promise<DuplicateCheckResult> {
  const supabase = await createClient();

  const expectedSlug = slugify(title);

  const { data: duplicates } = await supabase
    .from('blog_posts')
    .select('id, title, slug, guide_type, main_topic, guide_category')
    .eq('guide_type', 'pillar')
    .eq('main_topic', mainTopic)
    .eq('guide_category', category)
    .or(`slug.eq.${expectedSlug},title.ilike.%${title}%`)
    .limit(1);

  if (duplicates && duplicates.length > 0) {
    return {
      isDuplicate: true,
      existingPost: duplicates[0] as DuplicateCheckResult['existingPost']
    };
  }

  return { isDuplicate: false };
}

/**
 * Check if any guide (cluster or pillar) exists with the same slug
 * Useful for preventing slug collisions across different types
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .limit(1);

  return !!(data && data.length > 0);
}
