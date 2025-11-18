import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://testograph.eu';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // Fetch published learn guides
  const supabase = await createClient();

  const { data: guides } = await supabase
    .from('blog_posts')
    .select('slug, guide_category, updated_at')
    .eq('category', 'learn-guide')
    .eq('is_published', true);

  const learnPages = (guides || []).map((guide) => ({
    url: `${baseUrl}/learn/${guide.guide_category}/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...learnPages];
}
