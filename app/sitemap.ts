import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://testograph.eu';

  // Static pages with SEO metadata
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch published learn guides
  const supabase = await createClient();

  const { data: guides } = await supabase
    .from('blog_posts')
    .select('slug, guide_category, updated_at')
    .eq('category', 'learn-guide')
    .eq('is_published', true);

  const learnPages: MetadataRoute.Sitemap = (guides || []).map((guide) => ({
    url: `${baseUrl}/learn/${guide.guide_category}/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...learnPages];
}
