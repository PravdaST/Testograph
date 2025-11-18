'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Award, Check, Shield, Share2, Facebook, Twitter, Linkedin, MessageCircle, List, Mail } from 'lucide-react';
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
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Key Takeaways Component - Compact version for hero
function KeyTakeaways({ content }: { content: string }) {
  const [takeaways, setTakeaways] = useState<string[]>([]);

  useEffect(() => {
    // Extract text from TLDR section if exists, or use first few important points
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Look for TLDR section
    const tldrSection = doc.querySelector('.tldr-section, [class*="tldr"]');
    if (tldrSection) {
      const listItems = tldrSection.querySelectorAll('li');
      const items = Array.from(listItems).map(li => li.textContent || '').filter(Boolean);
      if (items.length > 0) {
        setTakeaways(items.slice(0, 3)); // Only 3 points
        return;
      }
    }

    // Fallback: extract first few paragraphs with strong tags
    const strongElements = doc.querySelectorAll('p > strong, h2, h3');
    const items = Array.from(strongElements)
      .map(el => el.textContent || '')
      .filter(text => text.length > 20 && text.length < 120)
      .slice(0, 3); // Only 3 points

    setTakeaways(items);
  }, [content]);

  if (takeaways.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        <h3 className="text-xs sm:text-sm font-bold text-white">Ключови моменти</h3>
      </div>
      {/* Mobile: Stack vertically, Desktop: 3 columns */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3">
        {takeaways.map((takeaway, index) => (
          <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
            <span className="flex-shrink-0 w-5 h-5 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="text-white/90 leading-tight line-clamp-2">{takeaway}</span>
          </div>
        ))}
      </div>
    </div>
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

  useEffect(() => {
    // Wait for DOM to be rendered
    setTimeout(() => {
      const articleContent = document.getElementById('article-content');
      if (!articleContent) return;

      const headings = articleContent.querySelectorAll('h2, h3');
      const tocItems: TOCItem[] = [];

      headings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));
        const id = `heading-${index}`;

        // Add ID to actual DOM element
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

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border-l-4 border-[#499167] rounded-lg p-4 sm:p-6 md:p-8">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 flex items-center gap-2">
        <List className="w-5 h-5 sm:w-6 sm:h-6 text-[#499167]" />
        Съдържание на статията
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Кликни на секция за бърза навигация</p>
      {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 2 columns */}
      <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {toc.map((item, index) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-lg text-left transition bg-white/70 hover:bg-white hover:shadow-sm min-h-[44px] ${
              item.level === 3 ? 'md:col-span-1' : 'md:col-span-1'
            } ${
              activeId === item.id
                ? 'border-2 border-[#499167] bg-white shadow-sm'
                : 'border-2 border-transparent'
            }`}
            aria-label={`Към секция: ${item.text}`}
          >
            <span className={`flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeId === item.id
                ? 'bg-[#499167] text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </span>
            <span className={`text-xs sm:text-sm leading-tight ${
              activeId === item.id
                ? 'text-[#499167] font-semibold'
                : 'text-gray-700 font-medium'
            }`}>
              {item.text}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Sidebar Components
function MostReadArticles({ currentSlug, category }: { currentSlug: string; category: string }) {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    async function loadMostRead() {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, guide_category, view_count')
        .eq('status', 'published')
        .neq('slug', currentSlug)
        .order('view_count', { ascending: false })
        .limit(5);

      setArticles(data || []);
    }
    loadMostRead();
  }, [currentSlug]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Най-четени статии</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.guide_category}/${article.slug}`}
            className="block group"
          >
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#499167] transition line-clamp-2">
              {article.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {article.view_count || 0} преглеждания
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoriesWidget() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('blog_posts')
        .select('guide_category')
        .eq('status', 'published');

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((item) => {
          counts[item.guide_category] = (counts[item.guide_category] || 0) + 1;
        });

        const categoryTitles: Record<string, string> = {
          testosterone: 'Тестостерон',
          potency: 'Потенция',
          fitness: 'Фитнес',
          nutrition: 'Хранене',
          supplements: 'Добавки',
          lifestyle: 'Начин на живот',
        };

        const categoriesArray = Object.entries(counts).map(([key, count]) => ({
          key,
          title: categoryTitles[key] || key,
          count,
        }));

        setCategories(categoriesArray);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Категории</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/learn?category=${cat.key}`}
            className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition"
          >
            <span className="text-sm text-gray-700">{cat.title}</span>
            <span className="text-xs font-semibold text-[#499167] bg-green-50 px-2 py-1 rounded">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Implement newsletter subscription
    // For now, just simulate success
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-[#499167] to-[#3a7450] text-white rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5" />
        <h3 className="text-lg font-bold">Абонирай се</h3>
      </div>
      <p className="text-sm text-white/90 mb-4">
        Получавай нови статии и съвети директно в имейла си.
      </p>
      {status === 'success' ? (
        <div className="bg-white/20 rounded-lg p-3 text-sm text-center">
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
            className="w-full px-4 py-2 rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-white text-[#499167] font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Зареждане...' : 'Абонирай се'}
          </button>
        </form>
      )}
    </div>
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
      // If we have keywords, try to find articles with similar keywords
      let query = supabase
        .from('blog_posts')
        .select('title, slug, guide_category, excerpt, keywords')
        .eq('status', 'published')
        .neq('slug', currentSlug)
        .neq('guide_category', currentCategory);

      // If we have keywords, prioritize articles with matching keywords
      if (keywords && keywords.length > 0) {
        query = query.overlaps('keywords', keywords);
      }

      const { data } = await query.limit(4);

      // If no keyword matches, get random articles from other categories
      if (!data || data.length === 0) {
        const { data: randomData } = await supabase
          .from('blog_posts')
          .select('title, slug, guide_category, excerpt')
          .eq('status', 'published')
          .neq('slug', currentSlug)
          .neq('guide_category', currentCategory)
          .limit(4);

        setRelatedArticles(randomData || []);
      } else {
        setRelatedArticles(data);
      }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Може да те интересува също</h2>
      <div className="grid gap-4">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.guide_category}/${article.slug}`}
            className="group p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#499167] hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-[#499167] bg-green-50 px-2 py-1 rounded">
                {categoryTitles[article.guide_category] || article.guide_category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#499167] transition mb-2">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Social Share Component - Mobile optimized
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Сподели:
      </span>
      {/* Touch-friendly buttons: min 44x44px */}
      <div className="flex gap-3 sm:gap-2">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
          aria-label="Сподели във Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition flex items-center justify-center"
          aria-label="Сподели в Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center justify-center"
          aria-label="Сподели в LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition flex items-center justify-center"
          aria-label="Сподели в WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

// Wave Animation Component
function WaveBackground({ color = "#499167", opacity = 0.1 }: { color?: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: opacity }} />
            <stop offset="50%" style={{ stopColor: color, stopOpacity: opacity * 1.5 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: opacity }} />
          </linearGradient>
        </defs>
        {/* Wave 1 */}
        <path
          fill="url(#wave-gradient)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave1 15s ease-in-out infinite',
            transformOrigin: 'center'
          }}
        />
        {/* Wave 2 */}
        <path
          fill={color}
          fillOpacity={opacity * 0.7}
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave2 20s ease-in-out infinite',
            animationDelay: '-5s',
            transformOrigin: 'center'
          }}
        />
        {/* Wave 3 */}
        <path
          fill={color}
          fillOpacity={opacity * 0.5}
          d="M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,181.3C672,171,768,149,864,144C960,139,1056,149,1152,160C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave3 25s ease-in-out infinite',
            animationDelay: '-10s',
            transformOrigin: 'center'
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(10px); }
        }
        @keyframes wave3 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(5px); }
        }
      `}</style>
    </div>
  );
}

// Trust Badges Bar Component - Mobile optimized
function TrustBadgesBar() {
  return (
    <div className="bg-[#e6e6e6] border-b border-gray-200 py-2.5 sm:py-3">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Mobile: Stack 2 per row, Desktop: All in one row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Сертифицирано от БАБХ</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">GMP стандарт</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Произведено в ЕС</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">HACCP качество</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">TESTOGRAPH</h3>
            <p className="text-sm">Цялостна програма за естествено повишаване на тестостерона.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Продукти</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://shop.testograph.eu/products/testoup" className="hover:text-[#5fb57e] transition-colors">TestoUP</a></li>
              <li><a href="https://shop.testograph.eu" className="hover:text-[#5fb57e] transition-colors">Магазин</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-[#5fb57e] transition-colors">Общи условия</Link></li>
              <li><Link href="/privacy" className="hover:text-[#5fb57e] transition-colors">Политика за поверителност</Link></li>
              <li><Link href="/cookies" className="hover:text-[#5fb57e] transition-colors">Политика за бисквитки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Контакти</h4>
            <ul className="space-y-2 text-sm">
              <li>Имейл: support@testograph.eu</li>
              <li>Работно време: Понеделник - Петък, 9:00 - 18:00 ч.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© 2025 Testograph. Всички права запазени.</p>
          <p className="mt-2 text-gray-500">Този продукт не е лекарствено средство и не е предназначен за диагностика, лечение или превенция на заболявания. Консултирайте се с лекар преди употреба.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LearnGuidePage({ params }: PageProps) {
  const [guide, setGuide] = useState<BlogPost | null>(null);
  const [parentCluster, setParentCluster] = useState<any>(null);
  const [siblingPillars, setSiblingPillars] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ category: string; slug: string } | null>(null);

  useEffect(() => {
    (async () => {
      const awaitedParams = await params;
      setResolvedParams(awaitedParams);
    })();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    async function loadGuide() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('guide_category', resolvedParams.category)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        notFound();
        return;
      }

      setGuide(data);

      // Increment view count
      await supabase.rpc('increment_guide_views', { guide_slug: resolvedParams.slug });

      // Get parent cluster if this is a pillar
      if (data.guide_type === 'pillar' && data.parent_cluster_slug) {
        const { data: parent } = await supabase
          .from('blog_posts')
          .select('title, slug')
          .eq('slug', data.parent_cluster_slug)
          .single();

        setParentCluster(parent);

        // Get sibling pillars
        const { data: siblings } = await supabase
          .from('blog_posts')
          .select('title, slug, excerpt')
          .eq('parent_cluster_slug', data.parent_cluster_slug)
          .eq('guide_type', 'pillar')
          .eq('status', 'published')
          .neq('slug', resolvedParams.slug)
          .limit(5);

        setSiblingPillars(siblings || []);
      }

      // Get suggested pillars if this is a cluster
      if (data.guide_type === 'cluster') {
        const { data: childPillars } = await supabase
          .from('blog_posts')
          .select('title, slug, excerpt')
          .eq('parent_cluster_slug', resolvedParams.slug)
          .eq('guide_type', 'pillar')
          .eq('status', 'published');

        setPillars(childPillars || []);
      }

      setLoading(false);
    }

    loadGuide();
  }, [resolvedParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Зареждане...</div>
      </div>
    );
  }

  if (!guide) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Trust Badges Bar */}
      <TrustBadgesBar />

      {/* Hero Section with Background - Mobile First */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={guide.featured_image_url || "/testograph-background.webp"}
            alt={guide.title}
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
          />
        </div>

        {/* Wave Animation */}
        <div className="absolute inset-0 z-5">
          <WaveBackground color="#499167" opacity={0.08} />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Content - Mobile optimized padding */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          {/* Breadcrumbs - Mobile optimized */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6">
            <Link href="/" className="hover:text-[#5fb57e] transition">
              Начало
            </Link>
            <span>/</span>
            <Link href="/learn" className="hover:text-[#5fb57e] transition">
              Learn
            </Link>
            <span>/</span>
            <span className="text-gray-400 capitalize">{resolvedParams?.category}</span>
          </div>

          {/* Guide Type Badge - Mobile optimized */}
          <div className="mb-3 sm:mb-4">
            <span className={`inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${
              guide.guide_type === 'cluster'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {guide.guide_type === 'cluster' ? '📚 Comprehensive Guide' : '📖 In-Depth Article'}
            </span>
          </div>

          {/* Title - Fluid typography for mobile */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {guide.title}
          </h1>

          {/* Meta Info - Mobile optimized spacing */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-300">
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

          {/* Key Takeaways - Compact in Hero */}
          <KeyTakeaways content={guide.content} />
        </div>
      </section>

      {/* Main Content - Mobile First */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Sidebar after content, Desktop: Sidebar on right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 sm:gap-8">
            {/* Article Content Column */}
            <div className="min-w-0">
              {/* Parent Cluster Link */}
              {parentCluster && (
                <Link
                  href={`/learn/${resolvedParams?.category}/${parentCluster.slug}`}
                  className="inline-flex items-center gap-2 text-[#499167] hover:text-[#5fb57e] transition mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад към: {parentCluster.title}
                </Link>
              )}

              {/* Table of Contents - In Article */}
              <div className="mb-8">
                <TableOfContents content={guide.content} />
              </div>

              {/* Article Content */}
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

              {/* Social Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <SocialShare
                  title={guide.title}
                  url={`https://testograph.eu/learn/${resolvedParams?.category}/${resolvedParams?.slug}`}
                />
              </div>

              {/* Related Content */}
              {(pillars.length > 0 || siblingPillars.length > 0) && (
                <div className="mt-16 pt-12 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {guide.guide_type === 'cluster' ? 'Задълбочени Статии:' : 'Свързани Теми:'}
                  </h2>
                  <div className="grid gap-4">
                    {(guide.guide_type === 'cluster' ? pillars : siblingPillars).map((related) => (
                      <Link
                        key={related.slug}
                        href={`/learn/${resolvedParams?.category}/${related.slug}`}
                        className="group p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#499167] hover:shadow-md transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#499167] transition mb-2">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {related.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related from Other Categories */}
              <RelatedFromOtherCategories
                currentSlug={guide.slug}
                currentCategory={guide.guide_category}
                keywords={guide.keywords}
              />
            </div>

            {/* Sidebar Column */}
            <aside className="space-y-6">
              {/* Most Read Articles */}
              <MostReadArticles currentSlug={guide.slug} category={guide.guide_category} />

              {/* Categories */}
              <CategoriesWidget />

              {/* Newsletter Subscribe */}
              <NewsletterSubscribe />
            </aside>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
