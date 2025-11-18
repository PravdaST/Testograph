/**
 * Check if a blog post/guide exists by slug or title
 */

import { createClient } from '@/lib/supabase/server';

export async function checkGuideExists(slug: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return !!data;
}

export async function findExistingPillars(category: string): Promise<Array<{ title: string; slug: string }>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug')
    .eq('guide_category', category)
    .eq('guide_type', 'pillar')
    .eq('status', 'published');

  return data || [];
}

export async function findClusterByCategory(category: string): Promise<{ title: string; slug: string } | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug')
    .eq('guide_category', category)
    .eq('guide_type', 'cluster')
    .eq('status', 'published')
    .single();

  return data || null;
}
