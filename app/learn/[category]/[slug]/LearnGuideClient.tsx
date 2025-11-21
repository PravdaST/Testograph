'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Check, Share2, Facebook, Twitter, Linkedin, MessageCircle, List, Eye, FileText, ArrowRight, Mail, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { insertImagesIntoContent } from '@/lib/utils/insert-images';

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

interface LearnGuideClientProps {
  guide: BlogPost;
  category: string;
  slug: string;
}

// ============================================
// NOISE OVERLAY COMPONENT
// ============================================
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}
    />
  );
}

// ============================================
// BENTO CARD COMPONENT
// ============================================
function BentoCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  const hoverClasses = hover ? "hover:-translate-y-1 hover:scale-[1.005] hover:shadow-2xl hover:shadow-brand-green/10 hover:border-brand-green/30" : "";

  return (
    <div
      className={`bg-white/70 backdrop-blur-[16px] border border-white/60 shadow-lg rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================
// FLOATING NAVIGATION
// ============================================
function FloatingNav() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-5xl">
      <BentoCard className="!rounded-full px-6 py-4 flex justify-between items-center shadow-xl bg-white/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse" />
          <span className="font-display font-bold text-lg tracking-tight">TESTOGRAPH</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium text-brand-dark/70">
          <Link href="/#system" className="hover:text-brand-green transition-colors">Системата</Link>
          <Link href="/#clinical-proof" className="hover:text-brand-green transition-colors">Формула</Link>
          <Link href="/#pricing" className="hover:text-brand-green transition-colors">Цени</Link>
          <Link href="/learn" className="text-brand-green font-semibold">Научи повече</Link>
        </div>

        <a href="https://shop.testograph.eu/products/testoup" className="bg-brand-dark text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-brand-green transition-colors">
          Поръчай
        </a>
      </BentoCard>
    </nav>
  );
}

// Key Takeaways Component
function KeyTakeaways({ content }: { content: string }) {
  const [takeaways, setTakeaways] = useState<string[]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const tldrSection = doc.querySelector('.tldr-section, [class*="tldr"]');
    if (tldrSection) {
      const listItems = tldrSection.querySelectorAll('li');
      const items = Array.from(listItems).map(li => li.textContent || '').filter(Boolean);
      if (items.length > 0) {
        setTakeaways(items.slice(0, 3));
        return;
      }
    }

    const strongElements = doc.querySelectorAll('p > strong, h2, h3');
    const items = Array.from(strongElements)
      .map(el => el.textContent || '')
      .filter(text => text.length > 20 && text.length < 120)
      .slice(0, 3);

    setTakeaways(items);
  }, [content]);

  if (takeaways.length === 0) return null;

  return (
    <BentoCard className="mt-6 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Check className="w-5 h-5 text-brand-green" />
        <h3 className="text-sm font-bold text-brand-dark">Ключови моменти</h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {takeaways.map((takeaway, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-brand-green/20 rounded-full flex items-center justify-center text-xs font-bold text-brand-green">
              {index + 1}
            </span>
            <span className="text-gray-700 text-sm leading-tight line-clamp-2">{takeaway}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// Table of Contents Component
interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function TableOfContents({ content }: { content: string }) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      const articleContent = document.getElementById('article-content');
      if (!articleContent) return;

      const headings = articleContent.querySelectorAll('h2, h3');
      const tocItems: TOCItem[] = [];

      headings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));
        const id = `heading-${index}`;

        heading.id = id;
        tocItems.push({ id, text, level });
      });

      setToc(tocItems);
    }, 100);
  }, [content]);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (toc.length === 0) return null;

  const displayedToc = isExpanded ? toc : toc.slice(0, 4);
  const hasMore = toc.length > 4;

  return (
    <BentoCard className="p-4 md:p-6">
      <h3 className="font-display text-xl font-bold text-brand-dark mb-2 flex items-center gap-2">
        <List className="w-5 h-5 text-brand-green" />
        Съдържание
      </h3>
      <p className="text-sm text-gray-600 mb-6">Кликни за бърза навигация</p>
      <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedToc.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`flex items-start gap-3 p-3 rounded-2xl text-left transition ${
              activeId === item.id
                ? 'bg-brand-green/10 border-2 border-brand-green'
                : 'bg-white/50 border-2 border-transparent hover:bg-white'
            }`}
          >
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeId === item.id
                ? 'bg-brand-green text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </span>
            <span className={`text-sm leading-tight ${
              activeId === item.id
                ? 'text-brand-green font-semibold'
                : 'text-gray-700 font-medium'
            }`}>
              {item.text}
            </span>
          </button>
        ))}
      </nav>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-brand-green hover:bg-brand-green/5 rounded-2xl transition"
        >
          {isExpanded ? 'Скрий' : `Покажи всички (${toc.length})`}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </BentoCard>
  );
}

// Sidebar Components
function MostReadArticles({ currentSlug, category }: { currentSlug: string; category: string }) {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    async function loadMostRead() {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, guide_category, views, featured_image_url')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .order('views', { ascending: false })
        .limit(5);

      setArticles(data || []);
    }
    loadMostRead();
  }, [currentSlug]);

  return (
    <BentoCard className="p-4 md:p-6">
      <h3 className="font-display text-lg font-bold text-brand-dark mb-4">Най-четени</h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.guide_category}/${article.slug}`}
            className="flex gap-3 group"
          >
            {article.featured_image_url ? (
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-green to-brand-green/70 flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-brand-dark group-hover:text-brand-green transition line-clamp-2 mb-1">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views || 0} преглеждания
              </p>
            </div>
          </Link>
        ))}
      </div>
    </BentoCard>
  );
}

function ProductBanner() {
  return (
    <a
      href="https://shop.testograph.eu/products/testoup"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BentoCard className="overflow-hidden group">
        <div className="relative h-48 overflow-hidden bg-white">
          <img
            src="/Product image/77.webp"
            alt="TestoUP"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-5 bg-gradient-to-br from-brand-green to-brand-green/80">
          <h3 className="text-lg font-bold mb-2 text-white">TestoUP</h3>
          <p className="text-sm text-white/90 mb-3">
            Естествен тестостеронов бустер
          </p>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-white">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>100% натурални съставки</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Сертифицирано от БАБХ</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            <span className="text-sm font-semibold text-white">Виж продукта</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </BentoCard>
    </a>
  );
}

function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <BentoCard className="p-4 md:p-6 bg-gradient-to-br from-brand-green/10 to-brand-green/5">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-brand-green" />
        <h3 className="font-display text-lg font-bold text-brand-dark">Абонирай се</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Получавай нови статии директно в имейла си
      </p>
      {status === 'success' ? (
        <div className="bg-brand-green/20 rounded-2xl p-3 text-sm text-center text-brand-green font-medium">
          ✓ Успешно се абонирахте!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="твоят@имейл.bg"
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-brand-green focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-3 bg-brand-green text-white font-semibold rounded-2xl hover:bg-brand-green/90 transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Зареждане...' : 'Абонирай се'}
          </button>
        </form>
      )}
    </BentoCard>
  );
}

function RelatedFromOtherCategories({ currentSlug, currentCategory, keywords }: {
  currentSlug: string;
  currentCategory: string;
  keywords?: string[];
}) {
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    async function loadRelated() {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, guide_category, excerpt, featured_image_url')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .neq('guide_category', currentCategory)
        .limit(4);

      setRelatedArticles(data || []);
    }
    loadRelated();
  }, [currentSlug, currentCategory, keywords]);

  if (relatedArticles.length === 0) return null;

  const categoryTitles: Record<string, string> = {
    testosterone: 'Тестостерон',
    potency: 'Потенция',
    fitness: 'Фитнес',
    nutrition: 'Хранене',
    supplements: 'Добавки',
    lifestyle: 'Начин на живот',
  };

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-dark mb-6">Може да те интересува</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.guide_category}/${article.slug}`}
          >
            <BentoCard className="h-full group">
              {/* Featured Image */}
              <div className="relative w-full h-40 bg-gradient-to-br from-brand-green/10 to-brand-green/5">
                {article.featured_image_url ? (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-green/30">
                    <FileText className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="inline-block text-xs font-semibold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full mb-3">
                  {categoryTitles[article.guide_category] || article.guide_category}
                </span>
                <h3 className="text-base font-bold text-brand-dark group-hover:text-brand-green transition mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </BentoCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialShare({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Сподели:
      </span>
      <div className="flex gap-2">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition flex items-center justify-center"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center justify-center"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition flex items-center justify-center"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-12 text-center text-sm text-gray-400 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-2 h-2 bg-brand-green rounded-full" />
        <span className="font-display font-bold text-brand-dark">TESTOGRAPH</span>
      </div>
      <p>&copy; 2025 Testograph EU. Научно обоснована формула.</p>
      <div className="flex justify-center gap-6 mt-4">
        <Link href="/terms" className="hover:text-brand-green">Условия</Link>
        <Link href="/privacy" className="hover:text-brand-green">Политика</Link>
        <a href="mailto:support@testograph.eu" className="hover:text-brand-green">Контакти</a>
      </div>
    </footer>
  );
}

export default function LearnGuideClient({ guide, category, slug }: LearnGuideClientProps) {
  const [parentCluster, setParentCluster] = useState<any>(null);
  const [siblingPillars, setSiblingPillars] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);

  useEffect(() => {
    async function loadRelatedContent() {
      if (guide.guide_type === 'pillar' && guide.parent_cluster_slug) {
        const { data: parent } = await supabase
          .from('blog_posts')
          .select('title, slug')
          .eq('slug', guide.parent_cluster_slug)
          .single();

        setParentCluster(parent);

        const { data: siblings } = await supabase
          .from('blog_posts')
          .select('title, slug, excerpt')
          .eq('parent_cluster_slug', guide.parent_cluster_slug)
          .eq('guide_type', 'pillar')
          .eq('is_published', true)
          .neq('slug', slug)
          .limit(5);

        setSiblingPillars(siblings || []);
      }

      if (guide.guide_type === 'cluster') {
        const { data: childPillars } = await supabase
          .from('blog_posts')
          .select('title, slug, excerpt')
          .eq('parent_cluster_slug', slug)
          .eq('guide_type', 'pillar')
          .eq('is_published', true);

        setPillars(childPillars || []);
      }
    }

    loadRelatedContent();
  }, [guide, slug]);

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Noise Texture Overlay */}
      <NoiseOverlay />

      {/* Background gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-green/[0.08] via-transparent to-brand-green/[0.08]" />
      </div>

      {/* Floating Glass Navigation */}
      <FloatingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto relative z-10">
        {/* Hero Content Container with Background Image */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Featured Image as Background */}
          {guide.featured_image_url && (
            <>
              <div className="absolute inset-0 z-0">
                <img
                  src={guide.featured_image_url}
                  alt={guide.title}
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-surface via-brand-surface/50 to-brand-surface z-[1]" />
            </>
          )}

          {/* Content on top of image */}
          <div className="relative z-10 p-8 md:p-12">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
              <Link href="/" className="hover:text-brand-green transition">
                Начало
              </Link>
              <span>/</span>
              <Link href="/learn" className="hover:text-brand-green transition">
                Learn
              </Link>
              <span>/</span>
              <span className="text-gray-400 capitalize">{category}</span>
            </div>

            {/* Type Badge */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-2 rounded-full text-xs font-semibold ${
                guide.guide_type === 'cluster'
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
              }`}>
                {guide.guide_type === 'cluster' ? 'Цялостно Ръководство' : 'Задълбочена Статия'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              {guide.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              {guide.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(guide.published_at).toLocaleDateString('bg-BG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                ~{Math.ceil(guide.content.split(' ').length / 200)} мин четене
              </div>
            </div>

            <KeyTakeaways content={guide.content} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="min-w-0">
            {parentCluster && (
              <Link
                href={`/learn/${category}/${parentCluster.slug}`}
                className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green/80 transition mb-8 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад към: {parentCluster.title}
              </Link>
            )}

            <div className="mb-8">
              <TableOfContents content={guide.content} />
            </div>

            <BentoCard className="p-5 md:p-8 md:p-12">
              <article className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: insertImagesIntoContent({
                      content: guide.content,
                      imageUrls: guide.article_images || []
                    })
                  }}
                  className="learn-content text-gray-800"
                  id="article-content"
                />
              </article>
            </BentoCard>

            <div className="mt-8">
              <BentoCard className="p-4 md:p-6">
                <SocialShare
                  title={guide.title}
                  url={`https://testograph.eu/learn/${category}/${slug}`}
                />
              </BentoCard>
            </div>

            {(pillars.length > 0 || siblingPillars.length > 0) && (
              <div className="mt-16 pt-12 border-t border-gray-200">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-dark mb-6">
                  {guide.guide_type === 'cluster' ? 'Задълбочени Статии' : 'Свързани Теми'}
                </h2>
                <div className="grid gap-4">
                  {(guide.guide_type === 'cluster' ? pillars : siblingPillars).map((related) => (
                    <Link
                      key={related.slug}
                      href={`/learn/${category}/${related.slug}`}
                    >
                      <BentoCard className="p-4 md:p-6 group">
                        <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-green transition mb-2">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {related.excerpt}
                          </p>
                        )}
                      </BentoCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <RelatedFromOtherCategories
              currentSlug={guide.slug}
              currentCategory={guide.guide_category}
              keywords={guide.keywords}
            />
          </div>

          <aside className="space-y-12">
            <MostReadArticles currentSlug={guide.slug} category={guide.guide_category} />
            <ProductBanner />
            <NewsletterSubscribe />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
