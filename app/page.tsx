'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Check, Star, TrendingUp, Zap, Activity, ChevronRight, Award, Users, Lock, Truck, ShoppingCart, Smartphone, Package, Brain, UtensilsCrossed, Dumbbell, LineChart, Sparkles, Target } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";

// ============================================
// NOISE OVERLAY COMPONENT (Swiss Style)
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
// BENTO CARD COMPONENT (Reusable)
// ============================================
function BentoCard({ children, className = "", hover = true, onClick }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  const hoverClasses = hover ? "hover:-translate-y-1 hover:scale-[1.005] hover:shadow-2xl hover:shadow-brand-green/10 hover:border-brand-green/30" : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`bg-white/70 backdrop-blur-[16px] border border-white/60 shadow-lg rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============================================
// REVEAL ON SCROLL HOOK
// ============================================
function useRevealOnScroll() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 100;

      revealElements.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);
}

export default function HomePage() {
  useRevealOnScroll();

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

      {/* Hero Section with Bento Grid */}
      <HeroSection />

      {/* Trust Badges Bento */}
      <TrustBadgesBento />

      {/* Reviews Section (Horizontal Slider) */}
      <ReviewsSection />

      {/* Video Testimonials Section */}
      <VideoTestimonialsSection />

      {/* Testograph V2 App Section */}
      <TestographV2Section />

      {/* Ecosystem Section (Hardware + Software) */}
      <EcosystemSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Clinical Proof Section */}
      <ClinicalProofSection />

      {/* Product Packages (Bento Cards) */}
      <ProductPackagesSection />

      {/* Member Testimonials Grid */}
      <MemberTestimonialsSection />

      {/* Guarantee Section */}
      <GuaranteeSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Minimal Footer */}
      <Footer />

      {/* Chat Assistant - временно деактивиран за технически ъпдейт */}
      {/* <ChatAssistant /> */}

      {/* Global Reveal Styles */}
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal.delay-75 {
          transition-delay: 75ms;
        }
        .reveal.delay-100 {
          transition-delay: 100ms;
        }
        .reveal.delay-150 {
          transition-delay: 150ms;
        }
        .reveal.delay-200 {
          transition-delay: 200ms;
        }
      `}</style>
    </div>
  );
}

// ============================================
// FLOATING GLASS NAVIGATION
// ============================================
function FloatingNav() {
  return (
    <nav className="fixed top-2 md:top-6 left-1/2 -translate-x-1/2 z-40 w-[96%] md:w-[90%] max-w-5xl">
      <BentoCard className="!rounded-full px-2 md:px-6 py-1.5 md:py-4 flex justify-between items-center shadow-xl bg-white/90">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-1.5 md:w-3 h-1.5 md:h-3 bg-brand-green rounded-full animate-pulse" />
          <span className="font-display font-bold text-[11px] md:text-lg tracking-tight">TESTOGRAPH</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-brand-dark/70">
          <a href="#system" className="hover:text-brand-green transition-colors">Системата</a>
          <a href="#clinical-proof" className="hover:text-brand-green transition-colors">Формула</a>
          <a href="#pricing" className="hover:text-brand-green transition-colors">Цени</a>
          <Link href="/learn" className="hover:text-brand-green transition-colors">Научи повече</Link>
        </div>

        <a href="https://shop.testograph.eu/products/testoup" className="bg-brand-green text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold hover:bg-brand-dark transition-colors flex items-center">
          Поръчай
        </a>
      </BentoCard>
    </nav>
  );
}

// ============================================
// HERO SECTION (Bento Grid Layout)
// ============================================
function HeroSection() {
  return (
    <>
      {/* Animated Wave Background - Full Width */}
      <div className="absolute left-0 right-0 top-0 h-screen overflow-hidden pointer-events-none opacity-[0.06] z-0">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          {/* Wave 1 */}
          <path
            fill="#499167"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
          {/* Wave 2 */}
          <path
            fill="#499167"
            fillOpacity="0.7"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="15s"
              repeatCount="indefinite"
              values="
                M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,213.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </path>
        </svg>
      </div>

      <section className="pt-8 md:pt-40 pb-2 md:pb-20 px-3 md:px-6 max-w-7xl mx-auto relative z-10 overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-2.5 md:gap-6 relative z-10">

        {/* Main Hero Text (Span 8) */}
        <div className="lg:col-span-8 flex flex-col justify-center reveal max-w-full">
          <div className="flex items-center gap-1.5 md:gap-3 mb-1.5 md:mb-6 flex-wrap">
            <span className="px-1.5 md:px-3 py-0.5 md:py-1 rounded border border-brand-green/20 text-brand-green text-[8px] md:text-xs font-bold uppercase tracking-wide bg-brand-green/5">
              Science-Backed
            </span>
            <span className="text-brand-dark/40 text-[8px] md:text-xs font-mono">V.2.0</span>
          </div>

          <h1 class="font-display font-bold text-xl leading-tight sm:text-4xl md:text-6xl md:leading-[0.95] text-brand-dark mb-2 md:mb-8 w-full">
            ОПТИМИЗИРАЙ<br />
            <span className="text-brand-green italic">ТЕСТОСТЕРОНА</span> СИ.
          </h1>

          <p className="text-[12px] md:text-lg text-brand-dark/60 leading-tight md:leading-relaxed mb-2 md:mb-10 max-w-full">
            <span className="hidden md:inline">Повиши тестостерона, подобри либидото и върни мъжкото здраве с първата хибридна система в България: Фармацевтично чиста добавка + Алгоритмичен коучинг.</span>
            <span className="md:hidden">Повиши тестостерона. Първата хибридна система в България.</span>
          </p>

          <div className="flex flex-row gap-2 md:gap-4">
            <a href="https://shop.testograph.eu/products/testoup" className="bg-brand-green text-white px-3 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl text-[12px] md:text-lg font-bold hover:bg-brand-dark transition-colors shadow-lg whitespace-nowrap">
              Поръчай
            </a>
            <a href="#system" className="bg-gray-100 text-gray-800 px-3 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl text-[12px] md:text-lg font-bold border border-gray-300 hover:border-brand-green transition-colors whitespace-nowrap">
              Виж как →
            </a>
          </div>
        </div>

        {/* Stats Card (Span 4) - Compact horizontal on mobile */}
        <div className="lg:col-span-4 lg:row-span-2 h-full reveal delay-100">
          <BentoCard className="h-full p-2 md:p-8 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-between min-h-[60px] md:min-h-[400px] relative overflow-hidden group">
            {/* Product Image Background - Smaller on mobile */}
            <div className="absolute right-2 md:left-1/2 top-1/2 md:-translate-x-1/2 -translate-y-1/2 w-14 md:w-72 h-14 md:h-72 opacity-40 md:opacity-80">
              <img
                src="/product/testoup-3.png"
                alt="TestoUP Bottle"
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Decor - hidden on mobile */}
            <div className="absolute top-0 right-0 w-12 md:w-32 h-12 md:h-32 bg-brand-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 hidden md:block" />

            <div className="relative z-10 flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
              <h3 className="text-brand-dark/50 text-[8px] md:text-sm font-mono md:mb-2 uppercase tracking-wider hidden md:block">ЕФЕКТИВНОСТ</h3>
              <div className="text-2xl md:text-6xl font-display font-bold text-brand-green md:mb-2">+27%</div>
              <p className="text-[10px] md:text-sm font-medium leading-tight text-brand-dark/70">Тестостерон след 90д</p>
            </div>

            {/* Animated Progress Chart - Hide on mobile */}
            <div className="relative z-10 hidden md:block">
              <h4 className="text-[8px] md:text-xs font-mono text-brand-dark/50 mb-1.5 md:mb-3 uppercase tracking-wider">Прогрес</h4>
              <div className="flex items-end justify-between gap-1 md:gap-2 h-12 md:h-20">
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[8px] md:text-[10px] font-bold text-gray-400 mb-0.5">0%</span>
                  <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative h-[36px] md:h-[60px]">
                    <div className="w-full bg-gray-300 h-full flex items-center justify-center">
                      <span className="text-[7px] md:text-[10px] text-gray-600 font-bold hidden md:block">Base</span>
                    </div>
                  </div>
                  <span className="text-[7px] md:text-[9px] text-gray-500 mt-0.5">0д</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[8px] md:text-[10px] font-bold text-brand-green mb-0.5 opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]">+9%</span>
                  <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative h-[40px] md:h-[66px]">
                    <div className="w-full bg-brand-green/50 h-full animate-[slideUp_1.2s_ease-out_forwards]"></div>
                  </div>
                  <span className="text-[7px] md:text-[9px] text-gray-500 mt-0.5">30д</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[8px] md:text-[10px] font-bold text-brand-green mb-0.5 opacity-0 animate-[fadeIn_0.5s_ease-out_1.3s_forwards]">+18%</span>
                  <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative h-[44px] md:h-[72px]">
                    <div className="w-full bg-brand-green/70 h-full animate-[slideUp_1.4s_ease-out_forwards]"></div>
                  </div>
                  <span className="text-[7px] md:text-[9px] text-gray-500 mt-0.5">60д</span>
                </div>
                <div className="flex-1 flex flex-col items-center relative">
                  <div className="absolute -top-4 md:-top-7 left-1/2 -translate-x-1/2 opacity-0 animate-[fadeIn_0.5s_ease-out_1.6s_forwards]">
                    <TrendingUp className="w-2.5 h-2.5 md:w-4 md:h-4 text-brand-green animate-bounce" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-bold text-brand-green mb-0.5 opacity-0 animate-[fadeIn_0.5s_ease-out_1.6s_forwards]">+27%</span>
                  <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative h-[48px] md:h-[78px]">
                    <div className="w-full bg-brand-green h-full animate-[slideUp_1.6s_ease-out_forwards]"></div>
                  </div>
                  <span className="text-[7px] md:text-[9px] font-bold text-brand-green mt-0.5">90д</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity z-10">
              <Zap className="w-10 h-10 text-brand-green" />
            </div>
          </BentoCard>
        </div>

        {/* Ingredients Slider (Full Width) - Ultra compact on mobile */}
        <div className="lg:col-span-8 mt-1 md:mt-6 lg:mt-0 reveal delay-200">
          <BentoCard className="p-1.5 md:p-6" hover={false}>
            <h4 className="text-[9px] md:text-sm font-mono text-brand-dark/50 mb-1 md:mb-4 uppercase tracking-wider">12 Активни Съставки</h4>
            <div className="overflow-hidden">
              <div className="flex gap-1.5 md:gap-4 animate-[slide_30s_linear_infinite]">
                {/* All 12 ingredients */}
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-D.webp" alt="Vitamin D3" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Витамин Д3</p>
                    <p className="text-[8px] md:text-xs text-gray-500">2400 МЕ</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/zinc-img.webp" alt="Zinc" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Цинк</p>
                    <p className="text-[8px] md:text-xs text-gray-500">50мг</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/ashwagandha-img.webp" alt="Ashwagandha" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Ашваганда</p>
                    <p className="text-[8px] md:text-xs text-gray-500">400мг</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/magnesium-img.webp" alt="Magnesium" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Магнезий</p>
                    <p className="text-[8px] md:text-xs text-gray-500">400мг</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/tribulus-terestris-img.webp" alt="Tribulus" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Трибулус</p>
                    <p className="text-[8px] md:text-xs text-gray-500">500мг</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/selenium-img.webp" alt="Selenium" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Selenium</p>
                    <p className="text-[8px] md:text-xs text-gray-500">100mcg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-C.webp" alt="Vitamin C" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin C</p>
                    <p className="text-[8px] md:text-xs text-gray-500">200mg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-E.webp" alt="Vitamin E" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin E</p>
                    <p className="text-[8px] md:text-xs text-gray-500">30mg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-K2.webp" alt="Vitamin K2" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin K2</p>
                    <p className="text-[8px] md:text-xs text-gray-500">100mcg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-B6.webp" alt="Vitamin B6" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin B6</p>
                    <p className="text-[8px] md:text-xs text-gray-500">5mg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-B12.webp" alt="Vitamin B12" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin B12</p>
                    <p className="text-[8px] md:text-xs text-gray-500">10mcg</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-B9.webp" alt="Vitamin B9" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Vitamin B9</p>
                    <p className="text-[8px] md:text-xs text-gray-500">400mcg</p>
                  </div>
                </div>
                {/* Duplicate for infinite loop */}
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/vitamin-D.webp" alt="Vitamin D3" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Витамин Д3</p>
                    <p className="text-[8px] md:text-xs text-gray-500">2400 МЕ</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-white/60 flex items-center gap-1.5 md:gap-3 min-w-[100px] md:min-w-[180px]">
                  <div className="w-7 h-7 md:w-12 md:h-12 rounded-full overflow-hidden bg-white">
                    <img src="/Testoup formula/zinc-img.webp" alt="Zinc" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-bold">Цинк</p>
                    <p className="text-[8px] md:text-xs text-gray-500">50мг</p>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
      </section>
    </>
  );
}

// ============================================
// TRUST BADGES BENTO
// ============================================
function TrustBadgesBento() {
  return (
    <section className="py-3 md:py-6 px-3 md:px-6 bg-brand-green">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 text-[11px] md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-white" />
            <span className="font-semibold text-white">Сертифицирано БАБХ</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1.5 md:gap-2">
            <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
            <span className="font-semibold text-white">GMP стандарт</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1.5 md:gap-2">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
            <span className="font-semibold text-white">Произведено в ЕС</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-1.5 md:gap-2">
            <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
            <span className="font-semibold text-white">HACCP качество</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// REVIEWS SECTION (Horizontal Slider)
// ============================================
function ReviewsSection() {
  const reviews = [
    {
      name: "Иван, 32г.",
      subtitle: "Фитнес ентусиаст",
      avatar: "/funnel/ivan-avatar.jpg",
      review: `Пробвал съм три различни добавки преди Testograph, но без никакъв резултат.

С вашата формула усетих разлика още на петия-шестия ден.
Сутрешните ерекции се върнаха, либидото ми се повиши - честно казано, не очаквах толкова бърз ефект.

След това започнах да следвам и плановете в приложението - за тренировки, хранене и сън.

Един месец по-късно съм буквално различен човек - в залата, в леглото, дори на работа.
Имам повече енергия, по-добра концентрация и се чувствам отново на 25.

Добавката действа бързо, но цялата програма наистина те преобразява.`
    },
    {
      name: "Георги, 38г.",
      subtitle: "Вечно уморен",
      avatar: "/funnel/georgi-avatar.jpg",
      review: `Още на четвъртия ден се събудих с ерекция, което не ми се беше случвало от месеци.
Веднага си помислих: "Добре, това работи".

След това разгледах плановете в приложението - какво да ям, как да тренирам и кога да спя.
Реших да ги пробвам.

След шест седмици съм напълно различен човек. Промяната не е само в либидото, а цялостна.
Енергията ми е стабилна през целия ден, а настроението ми е значително по-добро.
Жена ми казва, че съм по-присъстващ и жизнен.`
    },
    {
      name: "Петър, 41г.",
      subtitle: "В търсене на искрата",
      avatar: "/funnel/petar-avatar.jpg",
      review: `Още през първата седмица либидото ми скочи. Буквално я желаех отново.
Не осъзнавах колко ми е липсвало това чувство, докато не се върна.

Съпругата ми го забеляза веднага. Връзката ни се промени само за няколко дни.

След това започнах да следвам и останалите насоки - плановете за тренировки, хранене и режим.

Два месеца по-късно не мога да се позная. По-уверен съм, в по-добра форма и с много по-стабилна енергия.
Отново се чувствам мъж.

Ефектът от добавката е бърз, но ако следваш цялата програма, животът ти наистина се променя.`
    }
  ];

  return (
    <section className="py-6 md:py-20 bg-white">
      <div className="container mx-auto px-3 md:px-6">
        <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-6 md:mb-16 reveal">
          Реални Резултати от TestoUP
        </h2>

        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-x-auto pb-2 md:pb-4 scrollbar-hide">
            <div className="flex gap-3 md:gap-6 snap-x snap-mandatory">
              {reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[80vw] sm:w-[70vw] md:w-[45vw] lg:w-[30vw] snap-center reveal"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <BentoCard className="p-3 md:p-8 h-full">
                    <div className="flex items-center gap-0.5 md:gap-1 mb-2 md:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[13px] md:text-base text-gray-700 whitespace-pre-line mb-3 md:mb-6 leading-snug md:leading-relaxed line-clamp-6 md:line-clamp-none">
                      {review.review}
                    </p>
                    <div className="border-t pt-2 md:pt-4 flex items-center gap-2 md:gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-brand-green/20"
                      />
                      <div>
                        <p className="font-bold text-[13px] md:text-base text-gray-900">{review.name}</p>
                        <p className="text-[11px] md:text-sm text-gray-500">{review.subtitle}</p>
                      </div>
                    </div>
                  </BentoCard>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 md:gap-2 mt-3 md:mt-6">
            {reviews.map((_, idx) => (
              <div key={idx} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}

// ============================================
// VIDEO TESTIMONIALS SECTION
// ============================================
function VideoTestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState("ЛИБИДО");

  const videos = [
    {
      src: "/testimonials/TestoUp - Libido 1.mp4",
      title: "Подобрено либидо след 2 седмици",
      category: "ЛИБИДО"
    },
    {
      src: "/testimonials/TestoUP - LIBIDO 2.mp4",
      title: "Връщане на сексуалната енергия",
      category: "ЛИБИДО"
    },
    {
      src: "/testimonials/TestoUP - Libido 3.mp4",
      title: "По-силно желание и увереност",
      category: "ЛИБИДО"
    },
    {
      src: "/testimonials/TestoUp - Pregmant 1.mp4",
      title: "Успешна бременност след години опити",
      category: "ФЕРТИЛНОСТ"
    },
    {
      src: "/testimonials/TestoUp - Pregmant 2.mp4",
      title: "Подобрени параметри и зачатие",
      category: "ФЕРТИЛНОСТ"
    },
    {
      src: "/testimonials/TestoUp - Pregmant 3.mp4",
      title: "Реална промяна в качеството",
      category: "ФЕРТИЛНОСТ"
    }
  ];

  const filteredVideos = videos.filter(video => video.category === activeCategory);

  return (
    <section className="py-6 md:py-20 bg-white">
      <div className="container mx-auto px-3 md:px-6">
        <div className="text-center mb-6 md:mb-12 reveal">
          <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
            Реални Истории от Клиенти
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto">
            Вижте как TestoUP промени живота на мъже в България
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex justify-center gap-2 md:gap-3 mb-6 md:mb-12 reveal">
          <button
            onClick={() => setActiveCategory("ЛИБИДО")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-[11px] md:text-sm uppercase tracking-wider transition-all duration-300 ${
              activeCategory === "ЛИБИДО"
                ? "bg-brand-green text-white shadow-lg shadow-brand-green/30"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
            }`}
          >
            💪 Либидо
          </button>
          <button
            onClick={() => setActiveCategory("ФЕРТИЛНОСТ")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-[11px] md:text-sm uppercase tracking-wider transition-all duration-300 ${
              activeCategory === "ФЕРТИЛНОСТ"
                ? "bg-brand-green text-white shadow-lg shadow-brand-green/30"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
            }`}
          >
            👶 Фертилност
          </button>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
          {filteredVideos.map((video, idx) => (
            <div
              key={video.src}
              className="reveal opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <BentoCard className="p-0 overflow-hidden group h-full">
                <div className="relative aspect-[9/16] bg-gray-100">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    <source src={video.src} type="video/mp4" />
                    Вашият браузър не поддържа видео елемент.
                  </video>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                    <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-wider bg-brand-green/90 backdrop-blur-sm text-white">
                      {video.category}
                    </span>
                  </div>
                </div>

                <div className="p-2 md:p-4">
                  <h3 className="font-bold text-[11px] md:text-base text-gray-900 line-clamp-2">{video.title}</h3>
                </div>
              </BentoCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTOGRAPH V2 APP SECTION (Swiss Bento Glass)
// ============================================
function TestographV2Section() {
  return (
    <section className="py-6 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">

      {/* Section Header */}
      <div className="mb-6 md:mb-16 reveal">
        <div className="inline-flex items-center gap-1.5 md:gap-2 bg-red-50 text-red-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-medium mb-3 md:mb-4">
          <Target className="w-3 h-3 md:w-4 md:h-4" />
          Уморени ли сте да не виждате резултати?
        </div>
        <h2 className="font-display font-bold text-xl md:text-4xl lg:text-5xl text-brand-dark mb-2 md:mb-4">
          Testograph
        </h2>
        <p className="text-sm md:text-xl text-gray-600 max-w-3xl mb-3 md:mb-6">
          Вашата програма: Хранителна, Тренировъчна и Релакс
        </p>
        <div className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-brand-green/10 to-brand-green/5 border border-brand-green/20 px-3 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-green/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
          </div>
          <div className="text-left">
            <p className="font-bold text-brand-dark text-[11px] md:text-sm">Безплатен достъп до приложението</p>
            <p className="text-[10px] md:text-xs text-gray-600">При покупка получавате достъп за колкото дни имате капсули</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto gap-3 md:gap-6">

        {/* Phone Mockup - Large Card */}
        <div className="md:col-span-2 md:row-span-3 reveal">
          <BentoCard className="p-3 md:p-8 relative overflow-hidden h-full bg-gradient-to-br from-brand-dark via-brand-dark to-brand-green/20">
            <div className="absolute top-3 left-3 md:top-6 md:left-6 bg-brand-green text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full z-20">
              LIVE PREVIEW
            </div>

            {/* Phone Container */}
            <div className="relative h-full flex items-center justify-center py-4 md:py-0">
              {/* Phone Frame - Smaller on mobile */}
              <div className="relative w-[160px] md:w-[280px] h-[320px] md:h-[580px] bg-gray-900 rounded-[24px] md:rounded-[40px] p-1.5 md:p-3 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[20px] md:rounded-[32px] overflow-hidden relative">
                  {/* Scrolling Content */}
                  <div className="absolute top-0 left-0 w-full animate-[slowScroll_40s_linear_infinite]">
                    <img
                      src="/Application-fullpage-scroll.png"
                      alt="Testograph App"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-32 h-3 md:h-6 bg-gray-900 rounded-b-xl md:rounded-b-2xl z-10" />
              </div>

              {/* Floating Labels - Hidden on mobile */}
              <div className="hidden md:block absolute top-8 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-lg text-white text-xs font-mono">
                <Smartphone className="w-4 h-4 inline mr-1" />
                iOS & Android
              </div>

              <div className="hidden md:block absolute bottom-8 left-4 bg-brand-green/20 backdrop-blur-md border border-brand-green/40 px-3 py-2 rounded-lg text-white text-xs font-bold">
                <Sparkles className="w-4 h-4 inline mr-1" />
                AI-Powered
              </div>
            </div>

            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-5xl md:text-9xl font-display font-bold text-white/5 select-none">V2</div>
          </BentoCard>
        </div>

        {/* Problem Card */}
        <div className="lg:col-span-2 reveal delay-100">
          <BentoCard className="p-3 md:p-8 bg-brand-surface hover:bg-white transition-colors h-full">
            <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl md:rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-2 md:mb-4">
              <Target className="w-4 md:w-6 h-4 md:h-6" />
            </div>
            <h3 className="font-bold text-base md:text-2xl mb-2 md:mb-3 text-gray-900">Проблемът не е във вашите усилия</h3>
            <p className="text-[11px] md:text-base text-gray-600 leading-relaxed">
              Инвестирате време и пари в тренировки и добавки, но усещате застой. Енергията е ниска, напредъкът бавен.
              Проблемът е в липсата на персонализирана система, която обединява хранене, тренировки, добавки и почивка.
            </p>
          </BentoCard>
        </div>

        {/* Feature 1: Personalized Plan */}
        <div className="reveal delay-150">
          <BentoCard className="p-3 md:p-6 bg-brand-surface hover:bg-white transition-colors h-full group">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">Персонализиран План</h4>
            <p className="text-[11px] md:text-sm text-gray-600">
              AI въпросник избира една от 9 програми, 100% съобразени с вашето тяло.
            </p>
          </BentoCard>
        </div>

        {/* Feature 2: Nutrition */}
        <div className="reveal delay-200">
          <BentoCard className="p-3 md:p-6 bg-brand-surface hover:bg-white transition-colors h-full group">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">Хранителни Режими</h4>
            <p className="text-[11px] md:text-sm text-gray-600">
              Седмични планове с точни грамажи и макроси за оптимален тестостерон.
            </p>
          </BentoCard>
        </div>

        {/* Feature 3: Workouts */}
        <div className="lg:col-span-2 reveal delay-250">
          <BentoCard className="p-3 md:p-8 bg-brand-surface hover:bg-white transition-colors h-full relative overflow-hidden group">
            <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl md:rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform relative z-10">
              <Dumbbell className="w-4 md:w-6 h-4 md:h-6" />
            </div>
            <h4 className="font-bold text-base md:text-2xl mb-2 md:mb-3 text-gray-900 relative z-10">Тренировъчни Програми</h4>
            <p className="text-[11px] md:text-base text-gray-600 leading-relaxed mb-2 md:mb-4 relative z-10">
              5,000+ упражнения с видео демонстрации на български. Вкъщи, в залата или йога - имате всичко необходимо.
            </p>
            <div className="flex items-center gap-2 text-[10px] md:text-sm font-medium text-brand-green relative z-10">
              <Check className="w-3 md:w-4 h-3 md:h-4" />
              Правилна техника, безопасност, максимален ефект
            </div>

            <div className="absolute -right-4 -bottom-4 w-20 md:w-32 h-20 md:h-32 bg-orange-100 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
          </BentoCard>
        </div>

        {/* Feature 4: Tracking */}
        <div className="reveal delay-300">
          <BentoCard className="p-3 md:p-6 bg-brand-surface hover:bg-white transition-colors h-full group">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
              <LineChart className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">Проследяване</h4>
            <p className="text-[11px] md:text-sm text-gray-600">
              Напомняния за TestoUP, записване на тегло и прогрес в реално време.
            </p>
          </BentoCard>
        </div>

        {/* Transformation Card - Full Width */}
        <div className="lg:col-span-4 reveal delay-350">
          <BentoCard className="p-3 md:p-8 bg-gradient-to-r from-brand-green/10 via-brand-surface to-brand-green/10 hover:bg-white transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
              <div className="flex-1">
                <h4 className="text-lg md:text-3xl font-display font-bold text-gray-900 mb-2 md:mb-4">
                  Повече от Добавка – Цялостна Трансформация
                </h4>
                <p className="text-[11px] md:text-lg text-gray-600 mb-3 md:mb-6">
                  С Testograph, TestoUP престава да бъде просто добавка. Той се превръща в катализатор на цялостна система.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-6">
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-base text-gray-700">
                    <Check className="w-3 md:w-5 h-3 md:h-5 text-brand-green flex-shrink-0" />
                    <span>Увеличете енергията</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-base text-gray-700">
                    <Check className="w-3 md:w-5 h-3 md:h-5 text-brand-green flex-shrink-0" />
                    <span>Пробиете застоя</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-base text-gray-700">
                    <Check className="w-3 md:w-5 h-3 md:h-5 text-brand-green flex-shrink-0" />
                    <span>Подобрете либидото</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-base text-gray-700">
                    <Check className="w-3 md:w-5 h-3 md:h-5 text-brand-green flex-shrink-0" />
                    <span>Пълен контрол</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto">
                <a
                  href="https://shop.testograph.eu/products/testoup"
                  className="inline-flex items-center justify-center w-full md:w-auto gap-2 px-4 md:px-8 py-2.5 md:py-4 bg-brand-green text-white font-bold text-sm md:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-brand-green/20 hover:bg-brand-dark"
                >
                  Започни сега
                  <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />
                </a>
              </div>
            </div>
          </BentoCard>
        </div>

      </div>
    </section>
  );
}

// ============================================
// ANIMATED CHAT CARD (Cycling Conversations)
// ============================================
function AnimatedChatCard() {
  const [activeChat, setActiveChat] = useState(0);
  const [animationStep, setAnimationStep] = useState<'user' | 'typing' | 'ai'>('user');

  const conversations = [
    {
      userMsg: "Колко време отнема да видя резултати?",
      aiMsg: "Първите ефекти (повишено либидо, повече енергия) се усещат в рамките на 3-7 дни. За пълна трансформация препоръчвам 60-90 дни следване на програмата."
    },
    {
      userMsg: "Как получавам достъп до приложението?",
      aiMsg: "Веднага след поръчката ще получиш имейл с линк за регистрация. Попълваш кратък въпросник (10 мин) и получаваш своя персонализиран план."
    },
    {
      userMsg: "Безопасна ли е добавката TestoUP?",
      aiMsg: "Абсолютно. Всички съставки са натурални и клинично тествани. Произвежда се в ЕС със сертификати GMP, HACCP и от БАБХ."
    },
    {
      userMsg: "Трябва ли да посещавам фитнес зала?",
      aiMsg: "Не е задължително. Приложението предлага тренировки за всякакви нива - от начинаещи до напреднали. Можеш да тренираш у дома или във фитнеса."
    }
  ];

  useEffect(() => {
    // Reset animation when chat changes
    setAnimationStep('user');

    const userTimer = setTimeout(() => setAnimationStep('typing'), 800);
    const typingTimer = setTimeout(() => setAnimationStep('ai'), 2500);
    const nextChatTimer = setTimeout(() => {
      setActiveChat((prev) => (prev + 1) % conversations.length);
    }, 8000);

    return () => {
      clearTimeout(userTimer);
      clearTimeout(typingTimer);
      clearTimeout(nextChatTimer);
    };
  }, [activeChat, conversations.length]);

  return (
    <BentoCard className="p-4 md:p-6 bg-brand-dark text-white relative overflow-hidden group h-full">
      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full z-20">ПРИЛОЖЕНИЕ</div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4">
          <h3 className="font-display font-bold text-xl mb-1">Изкуствен Интелект</h3>
          <p className="text-gray-400 text-xs">Твоят дигитален ендокринолог 24/7</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 overflow-hidden relative">
          <div className="space-y-3">
            {/* User Message */}
            <div
              className={`flex justify-end transition-all duration-500 ${
                animationStep === 'user' || animationStep === 'typing' || animationStep === 'ai'
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="bg-purple-100 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] border border-purple-200">
                <p className="text-xs text-gray-900">{conversations[activeChat].userMsg}</p>
              </div>
            </div>

            {/* Typing Indicator */}
            {animationStep === 'typing' && (
              <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-green-100 rounded-2xl rounded-tl-sm px-4 py-2 border border-green-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-brand-green rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
                    <div className="w-2 h-2 bg-brand-green rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
                    <div className="w-2 h-2 bg-brand-green rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              </div>
            )}

            {/* AI Message */}
            {animationStep === 'ai' && (
              <div className="flex justify-start animate-[fadeIn_0.5s_ease-out]">
                <div className="bg-green-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-3 h-3 text-brand-green" />
                    <span className="text-[10px] font-bold text-brand-green">Изкуствен Интелект</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-900">{conversations[activeChat].aiMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input (Disabled) */}
        <div className="mt-3 bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Задай въпрос..."
            disabled
            className="flex-1 bg-transparent text-xs text-white/40 placeholder:text-white/30 outline-none cursor-not-allowed"
          />
          <Brain className="w-4 h-4 text-brand-green" />
        </div>

        {/* Conversation Indicator Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {conversations.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                activeChat === idx ? 'bg-brand-green w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-brand-green/20 to-transparent opacity-30 pointer-events-none" />
      <div className="absolute bottom-2 right-2 text-6xl font-display font-bold text-white/5 select-none pointer-events-none">02</div>
    </BentoCard>
  );
}

// ============================================
// ECOSYSTEM SECTION (Big Bento Grid)
// ============================================
function EcosystemSection() {
  return (
    <section id="system" className="py-6 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">
      <div className="mb-4 md:mb-12 flex items-end justify-between reveal">
        <div>
          <h2 className="font-display font-bold text-xl md:text-4xl text-brand-dark">Екосистемата</h2>
          <p className="text-[11px] md:text-base text-gray-500 mt-1 md:mt-2">Хардуер (Тяло) + Софтуер (Навици)</p>
        </div>
        <div className="hidden md:block h-px flex-1 bg-brand-dark/10 ml-8 mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto gap-4 md:gap-6 min-h-0 md:min-h-[600px]">

        {/* Card 1: The Supplement (Large) */}
        <div className="md:col-span-2 md:row-span-2 reveal">
          <BentoCard className="p-3 md:p-6 md:p-8 relative group h-full overflow-hidden">
            <div className="absolute top-3 md:top-6 left-3 md:left-6 bg-brand-green text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full z-20">ДОБАВКА</div>

            <div className="h-full flex flex-col justify-center relative z-10 pt-6 md:pt-0">
              <h3 className="font-display font-bold text-lg md:text-3xl mb-2 md:mb-4">Формула TestoUP</h3>
              <p className="text-[11px] md:text-base text-gray-600 mb-3 md:mb-8 max-w-xs">
                12 активни съставки в синергична матрица. Цинк, Витамин Д3, Магнезий и Ашваганда КСМ-66.
              </p>
              <ul className="space-y-1.5 md:space-y-3 text-[11px] md:text-sm font-medium text-gray-700">
                <li className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-brand-green rounded-full" /> 60 капсули на опаковка
                </li>
                <li className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-brand-green rounded-full" /> 2 капсули дневно
                </li>
                <li className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-brand-green rounded-full" /> Без пълнители
                </li>
                <li className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-brand-green rounded-full" /> Висока бионаличност
                </li>
              </ul>
            </div>

            {/* Product Image - Smaller on mobile */}
            <div className="absolute -right-4 md:-right-8 bottom-0 w-32 md:w-96 h-32 md:h-96">
              <img
                src="/product/testoup-3.png"
                alt="TestoUP Complex"
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="absolute bottom-0 right-0 w-24 md:w-64 h-24 md:h-64 bg-gradient-to-tl from-brand-green/20 to-transparent rounded-tl-full transition-transform group-hover:scale-110 duration-500" />
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-5xl md:text-9xl font-display font-bold text-brand-dark/5 select-none">01</div>
          </BentoCard>
        </div>

        {/* Card 2: The App (Medium) - Animated Chat */}
        <div className="md:col-span-1 lg:col-span-2 reveal delay-100">
          <AnimatedChatCard />
        </div>

        {/* Card 3: Ingredient Highlight (Small) */}
        <div className="reveal delay-150">
          <BentoCard className="p-3 md:p-6 flex flex-col justify-between h-full hover:bg-white transition-colors group relative overflow-hidden">
            {/* Full Background Image */}
            <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
              <img
                src="/Testoup formula/ashwagandha-img.webp"
                alt="Ashwagandha KSM-66"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Ingredient Bubble */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 w-12 md:w-20 h-12 md:h-20 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg z-10">
              <img
                src="/Testoup formula/ashwagandha-img.webp"
                alt="Ashwagandha"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2 md:mb-4 relative z-10">
              <Activity className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-sm md:text-lg leading-tight">
                Ашваганда КСМ-66<br />
                <span className="text-xs md:text-base font-normal text-gray-600">(400мг)</span>
              </h4>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Клиничен екстракт за намаляване на стреса.</p>
            </div>
          </BentoCard>
        </div>

        {/* Card 4: Ingredient Highlight (Small) */}
        <div className="reveal delay-200">
          <BentoCard className="p-3 md:p-6 flex flex-col justify-between h-full hover:bg-white transition-colors group relative overflow-hidden">
            {/* Full Background Image */}
            <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
              <img
                src="/Testoup formula/zinc-img.webp"
                alt="Zinc"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Ingredient Bubble */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 w-12 md:w-20 h-12 md:h-20 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg z-10">
              <img
                src="/Testoup formula/zinc-img.webp"
                alt="Zinc"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 md:mb-4 relative z-10">
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5" />
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-sm md:text-lg leading-tight">
                Цинк + Магнезий<br />
                <span className="text-xs md:text-base font-normal text-gray-600">(50мг + 400мг)</span>
              </h4>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">За дълбок сън и възстановяване.</p>
            </div>
          </BentoCard>
        </div>

      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS SECTION
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      icon: <ShoppingCart className="w-16 h-16 text-brand-green" />,
      title: "1. Поръчай добавката",
      description: "С поръчката си получаваш незабавен достъп до приложението Testograph."
    },
    {
      icon: <Smartphone className="w-16 h-16 text-brand-green" />,
      title: "2. Следвай твоя план",
      description: "Вътре те очаква персонализиран план за тренировки, хранене, сън и прием на добавката."
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-brand-green" />,
      title: "3. Постигни резултати",
      description: "Седмица 1: Повишено либидо и по-добри ерекции.\nМесец 1: Повече енергия и по-бързо възстановяване.\nМесец 2: Цялостна трансформация."
    }
  ];

  return (
    <section className="py-6 md:py-20 bg-white">
      <div className="container mx-auto px-3 md:px-6">
        <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-4 md:mb-16 reveal">
          Как Работи TestoUP Програмата?
        </h2>

        <div className="flex flex-col md:flex-row items-stretch max-w-5xl mx-auto gap-2 md:gap-0">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                <BentoCard className="p-3 md:p-8 text-center flex flex-col items-center h-full">
                  <div className="mb-2 md:mb-4 [&>svg]:w-8 [&>svg]:h-8 md:[&>svg]:w-16 md:[&>svg]:h-16">{step.icon}</div>
                  <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-[11px] md:text-base text-gray-600 whitespace-pre-line leading-snug md:leading-relaxed">{step.description}</p>
                </BentoCard>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-4 flex-shrink-0">
                  <ChevronRight className="w-8 h-8 text-brand-green" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center mt-4 md:mt-12">
          <a
            href="#clinical-proof"
            className="inline-flex items-center gap-2 px-4 md:px-8 py-2.5 md:py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold text-[12px] md:text-lg rounded-full border-2 border-gray-300 transition-all duration-300 hover:scale-105"
          >
            Виж съставките
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CLINICAL PROOF SECTION
// ============================================
function ClinicalProofSection() {
  return (
    <section id="clinical-proof" className="py-6 md:py-20 bg-brand-surface">
      <div className="container mx-auto px-3 md:px-6">
        <div className="text-center mb-4 md:mb-16 reveal">
          <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
            Клинично Доказана Формула
          </h2>
          <p className="text-[12px] md:text-xl text-gray-600 max-w-3xl mx-auto">
            12 активни съставки, подкрепени от над 50 клинични проучвания.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto mb-4 md:mb-12">
          <ResearcherCard
            ingredient="Витамин Д3 (2400 МЕ)"
            researcher="Д-р Майкъл Холик"
            institution="Бостънски университет"
            quote="Дефицитът на витамин D е пряко свързан с ниските нива на тестостерон. Суплементирането с витамин D доказано ги повишава."
          />
          <ResearcherCard
            ingredient="Цинк (50мг)"
            researcher="Д-р Ананда Прасад"
            institution="Щатски университет 'Уейн'"
            quote="Дефицитът на цинк директно намалява производството на тестостерон. Приемът му като добавка нормализира нивата в рамките на 3 до 6 месеца."
          />
          <ResearcherCard
            ingredient="Ашваганда (400мг)"
            researcher="Д-р Биджасвит Оди"
            institution="Институт за клинични изследвания, Индия"
            quote="Доказано повишава тестостерона с до 15% и намалява кортизола (хормона на стреса) с до 40% при възрастни, подложени на стрес."
          />
          <ResearcherCard
            ingredient="Магнезий (400мг)"
            researcher="Д-р Джовани Чеда"
            institution="Университет на Парма"
            quote="Магнезият повишава както свободния, така и общия тестостерон, особено когато се комбинира с редовна физическа активност."
          />
          <ResearcherCard
            ingredient="Трибулус Терестрис (500мг)"
            researcher="Д-р Антонио Дзоло"
            institution="Институт по спортна медицина, Италия"
            quote="Трибулус терестрис стимулира естественото производство на тестостерон и значително увеличава силата и мускулната маса при атлети."
          />
          <ResearcherCard
            ingredient="Селен (100мкг)"
            researcher="Д-р Маргарет Рейман"
            institution="Университет на Съри"
            quote="Селенът е критичен за производството на сперматозоиди и защитава клетките от оксидативен стрес, свързан с възрастта."
          />
          <ResearcherCard
            ingredient="Витамин Ц (200мг)"
            researcher="Д-р Балз Фрей"
            institution="Институт Линус Полинг"
            quote="Витамин C намалява ефектите от стреса върху организма и защитава клетките от оксидативни увреждания."
          />
          <ResearcherCard
            ingredient="Витамин Е (30мг)"
            researcher="Д-р Ишваран Балачандран"
            institution="Университет на Кералa"
            quote="Витамин E подобрява кръвообращението и клетъчното здраве, като поддържа нормални хормонални нива."
          />
          <ResearcherCard
            ingredient="Витамин К2 (100мкг)"
            researcher="Д-р Сис Вермеер"
            institution="Университет Маастрихт"
            quote="Витамин K2 подсилва костите, оптимизира усвояването на калций и участва активно в хормоналната регулация."
          />
          <ResearcherCard
            ingredient="Витамин B6 (5мг)"
            researcher="Д-р Джон Дакс"
            institution="Университет на Алабама"
            quote="Витамин B6 стимулира метаболизма, подпомага синтеза на тестостерон и значително намалява чувството на умора."
          />
          <ResearcherCard
            ingredient="Витамин B12 (10мкг)"
            researcher="Д-р Джошуа Миллър"
            institution="Ръткърс университет"
            quote="B12 повишава енергията, издръжливостта и концентрацията, като поддържа оптимално функциониране на нервната система."
          />
          <ResearcherCard
            ingredient="Витамин B9 (400мкг)"
            researcher="Д-р Паул Жак"
            institution="Министерство на земеделието на САЩ"
            quote="Фолиевата киселина подобрява клетъчния растеж, кръвообращението и е основна за репродуктивната функция."
          />
        </div>

        <div className="text-center reveal">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-4 md:px-8 py-2.5 md:py-4 bg-brand-green text-white font-bold text-[12px] md:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-brand-green/20 hover:bg-brand-dark"
          >
            Виж пълния състав
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ResearcherCard({ ingredient, researcher, institution, quote }: { ingredient: string; researcher: string; institution: string; quote: string }) {
  // Map ingredients to their image paths (Bulgarian keys)
  const ingredientImages: { [key: string]: string } = {
    "Витамин Д3 (2400 МЕ)": "/Testoup formula/vitamin-D.webp",
    "Цинк (50мг)": "/Testoup formula/zinc-img.webp",
    "Ашваганда (400мг)": "/Testoup formula/ashwagandha-img.webp",
    "Магнезий (400мг)": "/Testoup formula/magnesium-img.webp",
    "Трибулус Терестрис (500мг)": "/Testoup formula/tribulus-terestris-img.webp",
    "Селен (100мкг)": "/Testoup formula/selenium-img.webp",
    "Витамин Ц (200мг)": "/Testoup formula/vitamin-C.webp",
    "Витамин Е (30мг)": "/Testoup formula/vitamin-E.webp",
    "Витамин К2 (100мкг)": "/Testoup formula/vitamin-K2.webp",
    "Витамин B6 (5мг)": "/Testoup formula/vitamin-B6.webp",
    "Витамин B12 (10мкг)": "/Testoup formula/vitamin-B12.webp",
    "Витамин B9 (400мкг)": "/Testoup formula/vitamin-B9.webp",
  };

  const imagePath = ingredientImages[ingredient];

  return (
    <div className="reveal">
      <BentoCard className="p-2 md:p-6 h-full group relative overflow-hidden">
        {/* Full Background Ingredient Image */}
        {imagePath && (
          <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
            <img
              src={imagePath}
              alt={ingredient}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Ingredient Bubble - hidden on mobile */}
        {imagePath && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg z-10">
            <img
              src={imagePath}
              alt={ingredient}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="mb-1 md:mb-4 relative z-10">
          <h4 className="font-bold text-gray-900 text-[11px] md:text-lg leading-tight mb-0.5 md:mb-1">
            {ingredient.split(' (')[0]}<br />
            <span className="text-[10px] md:text-base font-normal text-gray-600">({ingredient.split(' (')[1]}</span>
          </h4>
          <p className="text-[9px] md:text-sm font-semibold text-brand-green hidden md:block">{researcher}</p>
          <p className="text-[8px] md:text-xs text-gray-600 hidden md:block">{institution}</p>
        </div>
        <blockquote className="text-[9px] md:text-sm text-gray-700 italic leading-snug md:leading-relaxed relative z-10 line-clamp-3 md:line-clamp-none">
          "{quote}"
        </blockquote>
      </BentoCard>
    </div>
  );
}

// ============================================
// PRODUCT PACKAGES SECTION (Swiss Bento Grid)
// ============================================
function ProductPackagesSection() {
  return (
    <section id="pricing" className="py-6 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">

      {/* Section Header */}
      <div className="mb-4 md:mb-16 text-center reveal">
        <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
          Избери <span className="text-brand-green">Твоя План</span>
        </h2>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-auto gap-2 md:gap-6">

        {/* 1-Month Plan */}
        <div className="reveal">
          <BentoCard className="p-2 md:p-6 h-full hover:bg-white transition-all group">
            <div className="text-center mb-2 md:mb-4">
              <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-1 md:mb-3">
                <img src="/product/testoup-1.png" alt="1 месец" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1">1 Месец</h3>
              <p className="text-lg md:text-3xl font-black text-brand-green mb-0.5 md:mb-1">67 лв.</p>
              <p className="text-[10px] md:text-sm text-gray-500">(34.26 €)</p>
            </div>
            <div className="space-y-1 md:space-y-2 mb-2 md:mb-4 text-[10px] md:text-sm hidden md:block">
              <div className="flex items-center gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>1 опаковка (30 дни)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>30 дни достъп до приложението</span>
              </div>
            </div>
            <a
              href="https://shop.testograph.eu/products/testoup"
              className="block w-full text-center py-1.5 md:py-3 rounded-full font-bold text-[10px] md:text-base bg-gray-100 hover:bg-gray-200 text-gray-900 border md:border-2 border-gray-300 transition-all duration-300 hover:scale-105"
            >
              Избери →
            </a>
          </BentoCard>
        </div>

        {/* 2-Month Plan (Popular - Large) */}
        <div className="col-span-2 md:col-span-2 md:row-span-2 reveal delay-100">
          <BentoCard className="p-3 md:p-8 h-full relative overflow-hidden border-2 md:border-4 border-brand-green bg-gradient-to-br from-brand-green/5 to-transparent hover:bg-white transition-all group">
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-brand-green text-white px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-xs font-bold">
              НАЙ-ПОПУЛЯРЕН
            </div>

            <div className="relative z-10">
              <div className="text-center mb-2 md:mb-6">
                <div className="w-16 h-16 md:w-32 md:h-32 mx-auto mb-2 md:mb-4">
                  <img src="/product/testoup-2.png" alt="2 месеца" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">2-Месечен План</h3>
                <div className="mb-2 md:mb-4">
                  <p className="text-xl md:text-5xl font-black text-brand-green mb-0.5 md:mb-1">57 лв./месец</p>
                  <p className="text-[10px] md:text-base text-gray-600">(общо 114 лв.)</p>
                  <p className="text-[9px] md:text-sm text-gray-500">(29.13 € на месец)</p>
                </div>
                <div className="inline-flex items-center gap-1 md:gap-2 bg-green-100 text-green-700 px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold mb-2 md:mb-6">
                  <span>Спестяваш 20 лв.</span>
                </div>
              </div>

              <div className="space-y-1 md:space-y-3 mb-2 md:mb-6 hidden md:block">
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0" />
                  <span className="font-medium text-[11px] md:text-base">2 опаковки (60 дни)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0" />
                  <span className="font-medium text-[11px] md:text-base">60 дни достъп до приложението</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0" />
                  <span className="font-medium text-[11px] md:text-base">Персонализиран план</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0" />
                  <span className="font-medium text-[11px] md:text-base">30-дневна гаранция</span>
                </div>
              </div>

              <a
                href="https://shop.testograph.eu/products/testoup"
                className="block w-full text-center py-2 md:py-4 rounded-full font-bold text-[11px] md:text-lg bg-brand-green hover:bg-brand-dark text-white shadow-xl shadow-brand-green/20 transition-all duration-300 hover:scale-105"
              >
                Избери план →
              </a>
            </div>

            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-brand-green/10 rounded-full blur-2xl" />
          </BentoCard>
        </div>

        {/* 3-Month Plan (Best Value) */}
        <div className="reveal delay-200">
          <BentoCard className="p-2 md:p-6 h-full relative overflow-hidden border-2 md:border-4 border-orange-500 bg-gradient-to-br from-orange-50 to-transparent hover:bg-white transition-all group">
            <div className="absolute top-1 right-1 md:top-4 md:right-4 bg-orange-500 text-white px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-xs font-bold">
              НАЙ-ИЗГОДЕН
            </div>

            <div className="relative z-10">
              <div className="text-center mb-2 md:mb-4">
                <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-1 md:mb-3">
                  <img src="/product/testoup-3.png" alt="3 месеца" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1">3 Месеца</h3>
                <p className="text-lg md:text-3xl font-black text-orange-600 mb-0.5 md:mb-1">50 лв./месец</p>
                <p className="text-[9px] md:text-xs text-gray-600">(общо 150 лв.)</p>
                <p className="text-[8px] md:text-xs text-gray-500 mb-1 md:mb-2">(25.55 €)</p>
                <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold">
                  Спестяваш 51 лв.
                </div>
              </div>

              <div className="space-y-1 md:space-y-2 mb-2 md:mb-4 text-[10px] md:text-sm hidden md:block">
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-orange-600 flex-shrink-0" />
                  <span>3 опаковки (90 дни)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-orange-600 flex-shrink-0" />
                  <span>90 дни достъп до приложението</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-orange-600 flex-shrink-0" />
                  <span>Максимални резултати</span>
                </div>
              </div>

              <a
                href="https://shop.testograph.eu/products/testoup"
                className="block w-full text-center py-1.5 md:py-3 rounded-full font-bold text-[10px] md:text-base bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-105"
              >
                Избери →
              </a>
            </div>
          </BentoCard>
        </div>

        {/* Benefits Card */}
        <div className="col-span-2 md:col-span-2 reveal delay-300">
          <BentoCard className="p-2 md:p-6 bg-brand-surface hover:bg-white transition-colors">
            <h4 className="font-bold text-[11px] md:text-lg mb-1 md:mb-4 text-gray-900">Какво получаваш:</h4>
            <div className="grid grid-cols-2 gap-1 md:gap-3 text-[9px] md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>Безплатна доставка</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>Сигурно плащане</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>Дискретна опаковка</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-gray-700">
                <Check className="w-3 h-3 md:w-4 md:h-4 text-brand-green flex-shrink-0" />
                <span>30-дневна гаранция</span>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Social Proof Card */}
        <div className="col-span-2 md:col-span-2 reveal delay-350">
          <BentoCard className="p-2 md:p-6 bg-gradient-to-r from-brand-green/10 via-brand-surface to-brand-green/10 hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 md:gap-3">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-brand-green" />
              <span className="font-bold text-[11px] md:text-lg text-gray-900">Над 2,438 доволни клиенти в България</span>
            </div>
          </BentoCard>
        </div>

      </div>
    </section>
  );
}

// ============================================
// MEMBER TESTIMONIALS SECTION
// ============================================
function MemberTestimonialsSection() {
  const testimonials = [
    { text: "Първите две седмици бях скептичен. След това обаче забелязах, че приключвам работния ден без да съм напълно изтощен. Това е огромна промяна за мен.", author: "Стоян, 34г., София", avatar: "/funnel/stoyan-avatar.jpg" },
    { text: "На четвъртия ден се появи сутрешна ерекция, което не ми се беше случвало от месеци. Жена ми забеляза, че нещо се променя, още преди да ѝ кажа.", author: "Димитър, 40г., Пловдив", avatar: "/funnel/dimitar-avatar.jpg" },
    { text: "Без приложението нямаше да знам какво да правя. Особено частта за съня - промених часа си на лягане и температурата в стаята. Разликата беше огромна.", author: "Николай, 37г., Варна", avatar: "/funnel/avatar-extra1.jpg" },
    { text: "Пета седмица: момчетата в залата ме питат 'какво взимаш?'. Вдигам повече и се възстановявам по-бързо.", author: "Иван, 29г., Бургас", avatar: "/funnel/ivan-avatar.jpg" },
    { text: "Пробвал съм трибулус и мака преди, но без резултат. Тук е различно, защото следваш цялостна програма, а не просто пиеш хапчета.", author: "Петър, 42г., Русе", avatar: "/funnel/petar-avatar.jpg" },
    { text: "Преди спях по 5-6 часа и се чувствах разбит. Сега спя по 7-8 часа и се събуждам сам, преди алармата. Енергията ми през деня е стабилна.", author: "Георги, 45г., Стара Загора", avatar: "/funnel/georgi-avatar.jpg" },
    { text: "Не стана за седмица, отне ми около месец и половина. Но програмата наистина работи, стига да си постоянен.", author: "Христо, 38г., Плевен", avatar: "/funnel/emil-avatar.jpg" },
    { text: "Харчил съм толкова пари за безполезни неща. Това е първото, което реално промени начина, по който се чувствам всеки ден.", author: "Александър, 35г., Велико Търново", avatar: "/funnel/avatar-extra2.jpg" },
    { text: "Преди два месеца бях постоянно уморен, с нулево либидо и в лошо настроение. Сега отново се чувствам нормално. Просто нормално. Това е всичко, което исках.", author: "Мартин, 41г., Благоевград", avatar: "/funnel/martin-avatar.jpg" }
  ];

  return (
    <section className="py-6 md:py-20 bg-brand-surface">
      <div className="container mx-auto px-3 md:px-6">
        <div className="text-center mb-4 md:mb-12 reveal">
          <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
            Успешни Истории
          </h2>
          <p className="text-[12px] md:text-xl text-gray-600">
            Хиляди мъже вече следват програмата.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="reveal" style={{ transitionDelay: `${idx * 50}ms` }}>
              <BentoCard className="p-2 md:p-6 h-full hover:bg-white transition-colors">
                <p className="text-[10px] md:text-base text-gray-700 mb-2 md:mb-4 leading-snug md:leading-relaxed line-clamp-4 md:line-clamp-none">"{testimonial.text}"</p>
                <div className="flex items-center gap-1 md:gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-6 h-6 md:w-12 md:h-12 rounded-full object-cover border md:border-2 border-brand-green/20"
                  />
                  <p className="text-[8px] md:text-sm font-semibold text-gray-900">— {testimonial.author}</p>
                </div>
              </BentoCard>
            </div>
          ))}
        </div>

        <div className="text-center mt-4 md:mt-12 reveal">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-4 md:px-8 py-2.5 md:py-4 bg-brand-green text-white font-bold text-[12px] md:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-brand-green/20 hover:bg-brand-dark"
          >
            Присъедини се към тях
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// GUARANTEE SECTION
// ============================================
function GuaranteeSection() {
  const guarantees = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "30 Дневна Гаранция",
      description: "Пълно възстановяване на сумата, ако не си доволен"
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Безплатна Доставка",
      description: "За поръчки над 100 лв. до цяла България"
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: "Сигурно Плащане",
      description: "SSL криптиране и защитени транзакции"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Сертифицирано Качество",
      description: "Произведено в GMP сертифициран обект"
    }
  ];

  return (
    <section className="py-6 md:py-20 bg-white">
      <div className="container mx-auto px-3 md:px-6">
        <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-2 md:mb-4 reveal">
          Нашата Гаранция за Качество
        </h2>
        <p className="text-[12px] md:text-xl text-gray-600 text-center mb-4 md:mb-16 max-w-3xl mx-auto reveal">
          Купуваш с пълна увереност. Връщаме парите без въпроси.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8 max-w-6xl mx-auto">
          {guarantees.map((guarantee, idx) => (
            <div key={idx} className="reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
              <BentoCard className="p-2 md:p-8 text-center h-full">
                <div className="flex justify-center mb-1 md:mb-4 text-brand-green [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-12 md:[&>svg]:h-12">{guarantee.icon}</div>
                <h3 className="text-[11px] md:text-xl font-black text-gray-900 mb-1 md:mb-3">{guarantee.title}</h3>
                <p className="text-[9px] md:text-base text-gray-600 hidden md:block">{guarantee.description}</p>
              </BentoCard>
            </div>
          ))}
        </div>

        <div className="mt-4 md:mt-16 text-center reveal">
          <div className="inline-flex items-center gap-1 md:gap-3 bg-brand-green text-white px-3 md:px-8 py-2 md:py-4 rounded-xl font-bold text-[11px] md:text-lg">
            <Users className="w-4 h-4 md:w-6 md:h-6" />
            <span>Над 2,438 доволни клиенти в България</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION (Swiss Bento Grid)
// ============================================
function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Колко време отнема, за да видя резултати?",
      a: "Повечето мъже забелязват първите ефекти (повишено либидо, повече енергия) в рамките на 3 до 7 дни. За цялостна трансформация са необходими между 60 и 90 дни стриктно следване на програмата."
    },
    {
      q: "Як получавам достъп до приложението?",
      a: "Веднага след като завършиш поръчката си, ще получиш имейл с линк за регистрация. Процесът отнема около 10 минути, в които трябва да попълниш кратък въпросник, след което ще получиш своя персонализиран план."
    },
    {
      q: "Безопасна ли е добавката?",
      a: "Абсолютно. Всички съставки в нашата формула са натурални и клинично тествани. Продуктът се произвежда в Европейския съюз и е сертифициран по GMP, HACCP и от БАБХ."
    },
    {
      q: "Трябва ли да посещавам фитнес зала?",
      a: "Не е задължително. Приложението предлага тренировъчни планове за всякакви нива - от напълно начинаещи до напреднали. Можеш да изпълняваш тренировките си както във фитнеса, така и у дома."
    },
    {
      q: "Каква е гаранцията, ако не съм доволен?",
      a: "Предлагаме 30-дневна гаранция за връщане на парите. Ако не си доволен от резултатите, просто се свържи с нас и ние ще ти върнем парите, без да задаваме въпроси."
    }
  ];

  return (
    <section className="py-6 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">

      {/* Section Header */}
      <div className="mb-4 md:mb-16 reveal">
        <h2 className="text-xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
          Често Задавани Въпроси
        </h2>
        <p className="text-[12px] md:text-xl text-gray-600 max-w-3xl">
          Всичко за TestoUP и приложението Testograph.
        </p>
      </div>

      {/* Bento Grid - Asymmetric */}
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-2 md:gap-6">

        {/* FAQ 1 - Large (2 cols) */}
        <div className="md:col-span-2 reveal">
          <BentoCard
            className={`p-3 md:p-8 cursor-pointer transition-all duration-300 ${
              openFaq === 0 ? 'border md:border-2 border-brand-green bg-white' : 'hover:bg-white'
            }`}
            onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
          >
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-4">
              <h3 className="font-bold text-[13px] md:text-2xl text-gray-900 leading-tight">
                {faqs[0].q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 md:w-6 md:h-6 text-brand-green flex-shrink-0 transition-transform duration-300 ${
                  openFaq === 0 ? 'rotate-90' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-[11px] md:text-base text-gray-700 leading-snug md:leading-relaxed">
                {faqs[0].a}
              </p>
            </div>
          </BentoCard>
        </div>

        {/* FAQ 2 */}
        <div className="reveal delay-100">
          <BentoCard
            className={`p-3 md:p-6 cursor-pointer transition-all duration-300 h-full ${
              openFaq === 1 ? 'border md:border-2 border-brand-green bg-white' : 'hover:bg-white'
            }`}
            onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
          >
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-3">
              <h3 className="font-bold text-[12px] md:text-lg text-gray-900 leading-tight">
                {faqs[1].q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0 transition-transform duration-300 ${
                  openFaq === 1 ? 'rotate-90' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-[10px] md:text-sm text-gray-700 leading-snug md:leading-relaxed">
                {faqs[1].a}
              </p>
            </div>
          </BentoCard>
        </div>

        {/* FAQ 3 */}
        <div className="reveal delay-150">
          <BentoCard
            className={`p-3 md:p-6 cursor-pointer transition-all duration-300 h-full ${
              openFaq === 2 ? 'border md:border-2 border-brand-green bg-white' : 'hover:bg-white'
            }`}
            onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
          >
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-3">
              <h3 className="font-bold text-[12px] md:text-lg text-gray-900 leading-tight">
                {faqs[2].q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 md:w-5 md:h-5 text-brand-green flex-shrink-0 transition-transform duration-300 ${
                  openFaq === 2 ? 'rotate-90' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-[10px] md:text-sm text-gray-700 leading-snug md:leading-relaxed">
                {faqs[2].a}
              </p>
            </div>
          </BentoCard>
        </div>

        {/* FAQ 4 - Large (2 cols) */}
        <div className="md:col-span-2 reveal delay-200">
          <BentoCard
            className={`p-3 md:p-8 cursor-pointer transition-all duration-300 ${
              openFaq === 3 ? 'border md:border-2 border-brand-green bg-white' : 'hover:bg-white'
            }`}
            onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
          >
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-4">
              <h3 className="font-bold text-[13px] md:text-2xl text-gray-900 leading-tight">
                {faqs[3].q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 md:w-6 md:h-6 text-brand-green flex-shrink-0 transition-transform duration-300 ${
                  openFaq === 3 ? 'rotate-90' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-[11px] md:text-base text-gray-700 leading-snug md:leading-relaxed">
                {faqs[3].a}
              </p>
            </div>
          </BentoCard>
        </div>

        {/* CTA Card */}
        <div className="reveal delay-250">
          <BentoCard className="p-2 md:p-6 bg-gradient-to-br from-brand-green/10 to-transparent hover:bg-white transition-colors h-full flex flex-col items-center justify-center text-center">
            <p className="text-[11px] md:text-base font-bold text-gray-900 mb-2 md:mb-3">
              Имаш други въпроси?
            </p>
            <a
              href="mailto:support@testograph.eu"
              className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-brand-green text-white font-bold text-[10px] md:text-sm rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-brand-green/20 hover:bg-brand-dark"
            >
              Свържи се
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </BentoCard>
        </div>

        {/* FAQ 5 - Full Width (3 cols) */}
        <div className="md:col-span-3 reveal delay-300">
          <BentoCard
            className={`p-3 md:p-8 cursor-pointer transition-all duration-300 ${
              openFaq === 4 ? 'border md:border-2 border-brand-green bg-white' : 'hover:bg-white'
            }`}
            onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
          >
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-2 md:mb-4">
              <h3 className="font-bold text-[13px] md:text-2xl text-gray-900 leading-tight">
                {faqs[4].q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 md:w-6 md:h-6 text-brand-green flex-shrink-0 transition-transform duration-300 ${
                  openFaq === 4 ? 'rotate-90' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-[11px] md:text-base text-gray-700 leading-snug md:leading-relaxed">
                {faqs[4].a}
              </p>
            </div>
          </BentoCard>
        </div>

      </div>

    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="py-6 md:py-12 text-center text-[10px] md:text-sm text-gray-400 border-t border-gray-200 bg-white/50 backdrop-blur-sm px-3 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-4 md:mb-6">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-green rounded-full" />
          <span className="font-display font-bold text-brand-dark text-[11px] md:text-base">TESTOGRAPH</span>
        </div>

        {/* Learn Section Links - SEO Internal Links */}
        <div className="mb-4 md:mb-6">
          <p className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Научи повече</p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <Link href="/learn" className="hover:text-brand-green transition-colors">Всички статии</Link>
            <Link href="/learn/testosterone/testosteron-guide-za-mizhe" className="hover:text-brand-green transition-colors">Тестостерон Гайд</Link>
            <Link href="/learn/potency/mazhka-potentnost-libido-seksualno-zdrave" className="hover:text-brand-green transition-colors">Потенция и Либидо</Link>
            <Link href="/learn/testosterone/kakvo-e-testosteron-i-kak-raboti" className="hover:text-brand-green transition-colors">Какво е Тестостерон</Link>
          </div>
        </div>

        <p>&copy; 2025 Testograph EU. Научно обоснована формула.</p>
        <div className="flex justify-center gap-3 md:gap-6 mt-2 md:mt-4">
          <Link href="/terms" className="hover:text-brand-green">Условия</Link>
          <Link href="/privacy" className="hover:text-brand-green">Политика</Link>
          <a href="mailto:support@testograph.eu" className="hover:text-brand-green">Контакти</a>
        </div>
      </div>
    </footer>
  );
}
