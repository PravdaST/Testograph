import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LearnGuideClient from './LearnGuideClient';
import type { Database } from '@/integrations/supabase/types';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  guide_type: 'cluster' | 'pillar';
  guide_category: string;
  parent_cluster_slug?: string;
  suggested_pillars?: string[];
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  article_images?: string[];
  keywords?: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views?: number;
}

// Create anonymous Supabase client for public data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Fetch guide data - reusable function
async function getGuideData(category: string, slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('guide_category', category)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    console.error('[getGuideData] Error:', error);
    return null;
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_guide_views', { guide_slug: slug }).then();

  return data as BlogPost;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const guide = await getGuideData(resolvedParams.category, resolvedParams.slug);

  if (!guide) {
    return {
      title: 'Статия не е намерена | Testograph',
      description: 'Търсената статия не съществува или не е публикувана.',
    };
  }

  const baseUrl = 'https://testograph.eu';
  const pageUrl = `${baseUrl}/learn/${resolvedParams.category}/${resolvedParams.slug}`;

  // Use custom meta_title/meta_description if available, otherwise fallback
  const metaTitle = guide.meta_title || `${guide.title} | Testograph`;
  const metaDescription = guide.meta_description || guide.excerpt || guide.title;

  const categoryTitles: Record<string, string> = {
    testosterone: 'Тестостерон',
    potency: 'Потенция',
    fitness: 'Фитнес',
    nutrition: 'Хранене',
    supplements: 'Добавки',
    lifestyle: 'Начин на живот',
  };

  const categoryTitle = categoryTitles[resolvedParams.category] || resolvedParams.category;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: guide.keywords || [],
    authors: [{ name: 'Testograph' }],

    openGraph: {
      type: 'article',
      locale: 'bg_BG',
      url: pageUrl,
      siteName: 'Testograph',
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: guide.featured_image_url || `${baseUrl}/testograph-background.webp`,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
      publishedTime: guide.published_at || guide.created_at,
      modifiedTime: guide.updated_at,
      section: categoryTitle,
      tags: guide.keywords || [],
    },

    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [guide.featured_image_url || `${baseUrl}/testograph-background.webp`],
    },

    alternates: {
      canonical: pageUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LearnGuidePage({ params }: PageProps) {
  const resolvedParams = await params;
  const guide = await getGuideData(resolvedParams.category, resolvedParams.slug);

  if (!guide) {
    notFound();
  }

  const baseUrl = 'https://testograph.eu';
  const pageUrl = `${baseUrl}/learn/${resolvedParams.category}/${resolvedParams.slug}`;
  const readingTime = Math.ceil(guide.content.split(' ').length / 200);

  const categoryTitles: Record<string, string> = {
    testosterone: 'Тестостерон',
    potency: 'Потенция',
    fitness: 'Фитнес',
    nutrition: 'Хранене',
    supplements: 'Добавки',
    lifestyle: 'Начин на живот',
  };

  // Structured Data (JSON-LD) for Article
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt || guide.meta_description,
    image: guide.featured_image_url || `${baseUrl}/testograph-background.webp`,
    datePublished: guide.published_at || guide.created_at,
    dateModified: guide.updated_at,
    author: {
      '@type': 'Organization',
      name: 'Testograph',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Testograph',
      logo: {
        '@type': 'ImageObject',
        url: 'https://storage.googleapis.com/gpt-engineer-file-uploads/5ByhMx7vllZrlm4HJCiFF4YTglh2/uploads/1757675182985-Minimalist dark themed logo design for the brand Testograph. Vector style, futuristic and masculine. Bold geometric typography inspired by Clash Display Bold, the word Testograph in clean white wi.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    articleSection: categoryTitles[resolvedParams.category] || resolvedParams.category,
    keywords: guide.keywords?.join(', ') || '',
    wordCount: guide.content.split(' ').length,
    timeRequired: `PT${readingTime}M`,
    url: pageUrl,
  };

  // Breadcrumb Structured Data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Начало',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learn',
        item: `${baseUrl}/learn`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryTitles[resolvedParams.category] || resolvedParams.category,
        item: `${baseUrl}/learn?category=${resolvedParams.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: guide.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      {/* Client Component */}
      <LearnGuideClient
        guide={guide}
        category={resolvedParams.category}
        slug={resolvedParams.slug}
      />
    </>
  );
}
