'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import { BookOpen, FileText, Award, Check, Shield, Search } from 'lucide-react';
import Image from 'next/image';

const categoryTitles: Record<string, { title: string; color: string }> = {
  testosterone: { title: 'Тестостерон', color: 'bg-blue-100 text-blue-700' },
  potency: { title: 'Потенция', color: 'bg-purple-100 text-purple-700' },
  fitness: { title: 'Фитнес', color: 'bg-orange-100 text-orange-700' },
  nutrition: { title: 'Хранене', color: 'bg-green-100 text-green-700' },
  supplements: { title: 'Добавки', color: 'bg-pink-100 text-pink-700' },
  lifestyle: { title: 'Начин на живот', color: 'bg-teal-100 text-teal-700' },
};

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
          <linearGradient id="wave-gradient-learn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: opacity }} />
            <stop offset="50%" style={{ stopColor: color, stopOpacity: opacity * 1.5 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: opacity }} />
          </linearGradient>
        </defs>
        <path
          fill="url(#wave-gradient-learn)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave1 15s ease-in-out infinite',
            transformOrigin: 'center'
          }}
        />
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

// Trust Badges Bar Component (Mobile Optimized)
function TrustBadgesBar() {
  return (
    <div className="bg-[#e6e6e6] border-b border-gray-200 py-2 sm:py-3">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Сертифицирано от БАБХ</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">GMP стандарт на производство</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Произведено в Европейския съюз</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">HACCP система за качество</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component (Mobile Optimized)
function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4">TESTOGRAPH</h3>
            <p className="text-xs sm:text-sm">Цялостна програма за естествено повишаване на тестостерона.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Продукти</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="https://shop.testograph.eu/products/testoup" className="hover:text-[#5fb57e] transition-colors">TestoUP</a></li>
              <li><a href="https://shop.testograph.eu" className="hover:text-[#5fb57e] transition-colors">Магазин</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Информация</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/terms" className="hover:text-[#5fb57e] transition-colors">Общи условия</Link></li>
              <li><Link href="/privacy" className="hover:text-[#5fb57e] transition-colors">Политика за поверителност</Link></li>
              <li><Link href="/cookies" className="hover:text-[#5fb57e] transition-colors">Политика за бисквитки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Контакти</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>Имейл: support@testograph.eu</li>
              <li>Работно време: Понеделник - Петък, 9:00 - 18:00 ч.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
          <p>© 2025 Testograph. Всички права запазени.</p>
          <p className="mt-2 text-gray-500">Този продукт не е лекарствено средство и не е предназначен за диагностика, лечение или превенция на заболявания. Консултирайте се с лекар преди употреба.</p>
        </div>
      </div>
    </footer>
  );
}

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Trust Badges Bar */}
      <TrustBadgesBar />

      {/* Hero Section (Mobile Optimized) */}
      <section className="relative min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/testograph-background.webp"
            alt="Научни статии за мъжко здраве от Testograph"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
        </div>

        {/* Wave Animation - Hidden on mobile for performance */}
        <div className="hidden md:block absolute inset-0 z-5">
          <WaveBackground color="#499167" opacity={0.08} />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Научен Център
            </h1>
            <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto">
              Образователни статии за тестостерон, мъжко здраве и фитнес.
              Научно обосновани ръководства с практически съвети.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters (Mobile Optimized) */}
      <div className="border-b border-gray-200 bg-gray-50 py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Търси статии..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#499167] focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition touch-manipulation ${
                selectedCategory === null
                  ? 'bg-[#499167] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Всички
            </button>
            {Object.keys(categoryTitles).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition touch-manipulation ${
                  selectedCategory === cat
                    ? 'bg-[#499167] text-white'
                    : `bg-white hover:bg-gray-100 border border-gray-300 ${categoryTitles[cat].color.split(' ')[1]}`
                }`}
              >
                {categoryTitles[cat].title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (Mobile Optimized) */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16 bg-white">
        {/* Results Count */}
        <div className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600">
          {filteredGuides.length} {filteredGuides.length === 1 ? 'статия' : 'статии'}
        </div>

        {/* Categories */}
        {guidesByCategory && Object.keys(guidesByCategory).length > 0 ? Object.keys(guidesByCategory).map((category) => {
          const categoryInfo = categoryTitles[category] || { title: category, color: 'bg-gray-100 text-gray-700' };
          const categoryGuides = guidesByCategory[category];

          return (
            <div key={category} className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                {categoryInfo.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categoryGuides.map((guide: any) => (
                  <Link
                    key={guide.id}
                    href={`/learn/${guide.guide_category}/${guide.slug}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#499167] hover:shadow-lg transition touch-manipulation"
                  >
                    {/* Featured Image */}
                    <div className="relative w-full h-40 sm:h-48 bg-gray-100">
                      {guide.featured_image_url ? (
                        <Image
                          src={guide.featured_image_url}
                          alt={guide.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {guide.guide_type === 'cluster' ? (
                            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16" />
                          ) : (
                            <FileText className="w-12 h-12 sm:w-16 sm:h-16" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      {/* Category Pill */}
                      <div className="mb-2 sm:mb-3">
                        <span className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.title}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-[#499167] transition mb-2 line-clamp-2">
                        {guide.title}
                      </h3>

                      {/* Excerpt */}
                      {guide.excerpt && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                          {guide.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                        <span className={`px-2 py-0.5 sm:py-1 rounded ${
                          guide.guide_type === 'cluster'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {guide.guide_type === 'cluster' ? 'Цялостно ръководство' : 'Задълбочена статия'}
                        </span>
                        <span>
                          {guide.reading_time || Math.ceil((guide.word_count || guide.content.split(' ').length) / 200)} мин
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-12 sm:py-16">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-base sm:text-lg mb-2">Няма намерени статии</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Опитайте с различни ключови думи или изберете друга категория
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
