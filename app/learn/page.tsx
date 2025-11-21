'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import { BookOpen, FileText, Search } from 'lucide-react';
import Image from 'next/image';

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


const categoryTitles: Record<string, { title: string; color: string }> = {
  testosterone: { title: 'Тестостерон', color: 'bg-blue-100 text-blue-700' },
  potency: { title: 'Потенция', color: 'bg-purple-100 text-purple-700' },
  fitness: { title: 'Фитнес', color: 'bg-orange-100 text-orange-700' },
  nutrition: { title: 'Хранене', color: 'bg-green-100 text-green-700' },
  supplements: { title: 'Добавки', color: 'bg-pink-100 text-pink-700' },
  lifestyle: { title: 'Начин на живот', color: 'bg-teal-100 text-teal-700' },
};

// ============================================
// FOOTER
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function LearnPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuides() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', 'learn-guide')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      setGuides(data || []);
      setLoading(false);
    }

    loadGuides();
  }, []);

  // Filter guides
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || guide.guide_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const guidesByCategory = filteredGuides.reduce((acc: any, guide) => {
    const cat = guide.guide_category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(guide);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <NoiseOverlay />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-green border-t-transparent mb-4"></div>
          <div className="text-brand-dark font-semibold text-lg">Зареждане...</div>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-12 reveal">
          <div className="inline-block mb-4 px-4 py-2 bg-brand-green/10 backdrop-blur-sm border border-brand-green/20 rounded-full">
            <span className="text-brand-green font-semibold text-sm">Научно Обосновани Статии</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-brand-dark mb-6">
            Научен Център
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Образователни статии за тестостерон, мъжко здраве и фитнес.<br/>
            Научно обосновани ръководства с практически съвети.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <BentoCard className="!rounded-full">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-green" />
                <input
                  type="text"
                  placeholder="Търси статии..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-base bg-transparent border-none focus:outline-none text-brand-dark placeholder:text-gray-400"
                />
              </div>
            </BentoCard>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                selectedCategory === null
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-white/60'
              }`}
            >
              Всички
            </button>
            {Object.keys(categoryTitles).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-brand-green text-white shadow-md'
                    : `bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md border border-white/60 ${categoryTitles[cat].color.split(' ')[1]}`
                }`}
              >
                {categoryTitles[cat].title}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-sm text-gray-600 font-medium text-center">
          {filteredGuides.length} {filteredGuides.length === 1 ? 'статия' : 'статии'}
        </div>
      </section>

      {/* Articles Grid by Category */}
      <section className="px-6 max-w-7xl mx-auto pb-20">
        {guidesByCategory && Object.keys(guidesByCategory).length > 0 ? Object.keys(guidesByCategory).map((category) => {
          const categoryInfo = categoryTitles[category] || { title: category, color: 'bg-gray-100 text-gray-700' };
          const categoryGuides = guidesByCategory[category];

          return (
            <div key={category} className="mb-16 reveal">
              <h2 className="font-display text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-brand-green rounded-full" />
                {categoryInfo.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryGuides.map((guide: any) => (
                  <Link
                    key={guide.id}
                    href={`/learn/${guide.guide_category}/${guide.slug}`}
                  >
                    <BentoCard className="h-full group">
                      {/* Featured Image */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-brand-green/10 to-brand-green/5">
                        {guide.featured_image_url ? (
                          <Image
                            src={guide.featured_image_url}
                            alt={guide.title}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-green/30">
                            {guide.guide_type === 'cluster' ? (
                              <BookOpen className="w-16 h-16" />
                            ) : (
                              <FileText className="w-16 h-16" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Category Pill */}
                        <div className="mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
                            {categoryInfo.title}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-green transition-colors mb-2 line-clamp-2">
                          {guide.title}
                        </h3>

                        {/* Excerpt */}
                        {guide.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                            {guide.excerpt}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200">
                          <span className={`px-2.5 py-1 rounded-lg font-medium ${
                            guide.guide_type === 'cluster'
                              ? 'bg-brand-green/10 text-brand-green'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {guide.guide_type === 'cluster' ? 'Ръководство' : 'Статия'}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {guide.reading_time || Math.ceil((guide.word_count || guide.content.split(' ').length) / 200)} мин
                          </span>
                        </div>
                      </div>
                    </BentoCard>
                  </Link>
                ))}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20">
            <BentoCard className="max-w-md mx-auto p-12">
              <FileText className="w-20 h-20 text-brand-green/30 mx-auto mb-4" />
              <h3 className="text-brand-dark text-xl font-bold mb-2">Няма намерени статии</h3>
              <p className="text-gray-600">
                Опитайте с различни ключови думи или изберете друга категория
              </p>
            </BentoCard>
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />

      {/* Global Reveal Styles */}
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease;
          animation: revealAnimation 0.8s ease forwards;
        }
        @keyframes revealAnimation {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
