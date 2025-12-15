'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, Check, Star, TrendingUp, Zap, Activity, ChevronRight, ChevronLeft, Award, Users, Lock, Truck, ShoppingCart, Smartphone, Package, Brain, UtensilsCrossed, Dumbbell, LineChart, Sparkles, Target, Gift, Moon, ArrowRight, Pill, MessageCircle, Utensils } from "lucide-react";
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

// ============================================
// PHONE CAROUSEL WITH INTERACTIVE TABS
// ============================================
const appScreens = [
  { id: 'dashboard', label: 'Dashboard', icon: LineChart, src: '/app/app-dashboard.png' },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell, src: '/app/app-trenirovka.png' },
  { id: 'food', label: 'Хранене', icon: UtensilsCrossed, src: '/app/app-food.png' },
  { id: 'sleep', label: 'Сън', icon: Moon, src: '/app/app-sleep.png' },
  { id: 'testoup', label: 'TestoUP', icon: Sparkles, src: '/app/app-testopup.png' },
];

function PhoneCarouselSection({ isVisible }: { isVisible: boolean }) {
  const [activeScreen, setActiveScreen] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pause auto-play on manual selection, resume after 10s
  const handleTabClick = (index: number) => {
    setActiveScreen(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className={`relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 md:p-8 overflow-hidden border border-gray-100 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex flex-col items-center">

        {/* Tab Buttons - Above Phone */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {appScreens.map((screen, idx) => {
            const Icon = screen.icon;
            const isActive = activeScreen === idx;
            return (
              <button
                key={screen.id}
                onClick={() => handleTabClick(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{screen.label}</span>
              </button>
            );
          })}
        </div>

        {/* Large Phone with Sliding Images */}
        <div className="relative mb-6">
          <div className="relative w-[220px] md:w-[280px] h-[440px] md:h-[560px] bg-gray-900 rounded-[32px] md:rounded-[40px] p-2 md:p-2.5 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[28px] md:rounded-[36px] overflow-hidden relative">
              {/* Sliding carousel */}
              <div
                className="w-full h-full flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeScreen * 100}%)` }}
              >
                {appScreens.map((screen, idx) => (
                  <div key={screen.id} className="w-full h-full flex-shrink-0 overflow-hidden">
                    <img
                      src={screen.src}
                      alt={screen.label}
                      className="w-full h-[140%] object-cover object-top animate-[phoneScroll_8s_ease-in-out_infinite]"
                      style={{ animationDelay: `${idx * 0.5}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-24 h-4 md:h-5 bg-gray-900 rounded-b-xl z-10" />
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white shadow-lg rounded-full p-2.5 animate-[float_4s_ease-in-out_infinite]">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-white shadow-lg rounded-full p-2.5 animate-[float_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 mb-4">
          {appScreens.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeScreen === idx
                  ? 'w-6 bg-brand-green'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* App Info */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 rounded-full px-3 py-1 mb-3">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-brand-green">АКТИВНО 24/7</span>
          </div>

          <h3 className="font-display font-bold text-xl md:text-2xl text-gray-900 mb-2">
            Твоят джобен треньор
          </h3>
          <p className="text-gray-600 text-sm md:text-base max-w-md">
            Персонализирани тренировки, хранителни планове и AI асистент - всичко в едно приложение.
          </p>
        </div>
      </div>
    </div>
  );
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

      {/* Did You Know Section */}
      <DidYouKnowSection />

      {/* 12 Ingredients Detail Section */}
      <IngredientsDetailSection />

      {/* How It Works - Day 7/30/90 Timeline */}
      <HowItWorksSection />

      {/* Testograph V2 App Section - Безплатно приложение */}
      <TestographV2Section />

      {/* Quote Testimonials - Какво казват мъжете + 30-дневна гаранция */}
      <QuoteTestimonialsSection />

      {/* What You Get Section - Order benefits */}
      <WhatYouGetSection />

      {/* Video Testimonials Section - Реални Истории */}
      <VideoTestimonialsSection />

      {/* Member Testimonials Grid */}
      <MemberTestimonialsSection />

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
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 left-[10%] w-72 h-72 md:w-96 md:h-96 bg-brand-green/15 rounded-full blur-[100px] animate-[blob_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 right-[5%] w-64 h-64 md:w-80 md:h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-[blob_10s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-10 left-[20%] w-56 h-56 md:w-72 md:h-72 bg-teal-300/10 rounded-full blur-[90px] animate-[blob_12s_ease-in-out_infinite_4s]" />
        <div className="absolute top-1/3 left-1/2 w-48 h-48 md:w-64 md:h-64 bg-green-200/15 rounded-full blur-[70px] animate-[blob_9s_ease-in-out_infinite_1s]" />

        {/* Floating particles */}
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-brand-green/30 rounded-full animate-[floatParticle_6s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[20%] w-3 h-3 bg-emerald-400/20 rounded-full animate-[floatParticle_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-[30%] left-[30%] w-2 h-2 bg-teal-400/25 rounded-full animate-[floatParticle_7s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[60%] right-[35%] w-1.5 h-1.5 bg-brand-green/20 rounded-full animate-[floatParticle_9s_ease-in-out_infinite_3s]" />
        <div className="absolute top-[15%] right-[40%] w-2.5 h-2.5 bg-emerald-300/25 rounded-full animate-[floatParticle_10s_ease-in-out_infinite_0.5s]" />

        {/* Decorative product images */}
        <img
          src="/product/Sample.png"
          alt=""
          className="hidden lg:block absolute -left-20 bottom-10 w-48 h-48 object-contain opacity-[0.08] rotate-[-15deg] animate-[float_10s_ease-in-out_infinite]"
        />
        <img
          src="/product/STARTER_12.webp"
          alt=""
          className="hidden lg:block absolute -right-10 top-20 w-64 h-64 object-contain opacity-[0.06] rotate-[10deg] animate-[float_12s_ease-in-out_infinite_2s]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 md:pt-32 pb-6 md:pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-16">

          {/* Product Image - Mobile: First, Desktop: Second */}
          <div className="order-1 lg:order-2 lg:flex-1 flex justify-center">
            <div className="relative">
              {/* Glow effect behind bottle */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green/30 to-transparent rounded-full blur-3xl scale-75" />

              {/* Product bottle */}
              <img
                src="/product/testoup-3.png"
                alt="TestoUP"
                className="relative w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-contain drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
              />

              {/* Floating badge - 12 ingredients */}
              <div className="absolute -right-2 md:right-0 top-8 md:top-12 bg-white shadow-lg rounded-xl px-3 py-2 border border-gray-100 animate-[float_4s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-xs font-bold">12 съставки</p>
                    <p className="text-gray-500 text-[10px]">в една капсула</p>
                  </div>
                </div>
              </div>

              {/* Floating badge - Rating */}
              <div className="absolute -left-2 md:left-0 bottom-8 md:bottom-12 bg-white shadow-lg rounded-xl px-3 py-2 border border-gray-100 animate-[float_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-900 text-xs font-bold">4.9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Mobile: Second, Desktop: First */}
          <div className="order-2 lg:order-1 lg:flex-1 text-center lg:text-left">
            {/* Title */}
            <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-7xl text-gray-900 mb-3 md:mb-6 leading-tight">
              TestoUP <span className="text-brand-green">№1</span> добавка
              <br />
              <span className="text-brand-green italic">САМО за МЪЖЕ</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-sm md:text-xl mb-5 md:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Либидо. Енергия. Мускулна маса. Възстановяване.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start mb-5 md:mb-8">
              <a
                href="https://shop.testograph.eu/products/testoup"
                className="group relative inline-flex items-center justify-center gap-3 bg-brand-green hover:bg-emerald-600 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg transition-all duration-300 shadow-lg shadow-brand-green/30 hover:shadow-xl hover:shadow-brand-green/40 hover:scale-105"
              >
                <span>Поръчай сега</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg transition-all duration-300 border border-gray-200"
              >
                <span>Виж как работи</span>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm"><span className="text-gray-900 font-bold">1300+</span> клиенти</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">30 дни гаранция</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">Безплатна доставка</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      </section>
  );
}

// ============================================
// TRUST BADGES BENTO
// ============================================
function TrustBadgesBento() {
  const certificates = [
    { src: "/certificates/babh.png", alt: "БАБХ", label: "Одобрено от БАБХ" },
    { src: "/certificates/hhcp.png", alt: "HACCP", label: "HACCP Сертифицирано" },
    { src: "/certificates/GMP.png", alt: "GMP", label: "GMP Quality" },
    { src: "/certificates/MADEEU.png", alt: "Made in EU", label: "Произведено в ЕС" },
  ];

  return (
    <section className="py-3 md:py-5 px-3 md:px-6 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {certificates.map((cert, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={cert.src}
                alt={cert.alt}
                className="h-10 md:h-14 w-auto object-contain mb-1 md:mb-2"
              />
              <p className="text-[8px] md:text-xs text-brand-dark/60 leading-tight">
                {cert.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// DID YOU KNOW SECTION - Testosterone Facts (2025 Modern Design)
// ============================================
function DidYouKnowSection() {
  const problems = [
    {
      text: "Намалено либидо",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      text: "Повишена телесна мазнина",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      text: "Намалена мотивация",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    {
      text: "Проблеми със съня",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    {
      text: "Хронична умора - умствена и физическа",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-10 md:py-24 px-3 md:px-6 bg-brand-dark overflow-hidden reveal">
      <div className="max-w-6xl mx-auto">
        {/* Section Badge */}
        <div className="text-center mb-6 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs md:text-base font-medium">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            Знаете ли, че...
          </span>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* Main Statement Card - Spans 7 columns */}
          <div className="md:col-span-7 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 h-full">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6">
                    С напредването на възрастта мъжкият организъм постепенно произвежда по-малко тестостерон.
                  </p>
                  <p className="text-base md:text-lg text-white/70 leading-relaxed">
                    Той е отговорен за <span className="text-brand-green font-semibold">мускулната маса</span>. За <span className="text-brand-green font-semibold">плътността на костите</span>. За <span className="text-brand-green font-semibold">либидото</span>. За <span className="text-brand-green font-semibold">енергийните нива</span>.
                  </p>
                </div>
                {/* Animated Testosterone Decline Chart */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-xs uppercase tracking-wider">Ниво на тестостерон</span>
                    <span className="text-red-400 text-xs font-medium">-1% / година след 30</span>
                  </div>
                  <div className="relative h-24 w-full">
                    <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="white" strokeOpacity="0.05" />
                      <line x1="0" y1="40" x2="300" y2="40" stroke="white" strokeOpacity="0.05" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="white" strokeOpacity="0.05" />

                      {/* Area under the curve */}
                      <path
                        d="M0,15 Q75,18 150,35 T300,65 L300,80 L0,80 Z"
                        fill="url(#areaGradient)"
                        className="animate-pulse"
                        style={{ animationDuration: '3s' }}
                      />

                      {/* Main decline line */}
                      <path
                        d="M0,15 Q75,18 150,35 T300,65"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        style={{
                          strokeDasharray: 400,
                          strokeDashoffset: 400,
                          animation: 'drawLine 2s ease-out forwards'
                        }}
                      />

                      {/* Animated dot at current position */}
                      <circle
                        cx="300"
                        cy="65"
                        r="5"
                        fill="#ef4444"
                        className="animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                      >
                        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                      </circle>

                      {/* Start dot */}
                      <circle cx="0" cy="15" r="4" fill="#22c55e" className="drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    </svg>

                    {/* Age labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/30">
                      <span>30г</span>
                      <span>40г</span>
                      <span>50г</span>
                      <span>60г+</span>
                    </div>
                  </div>
                </div>

                {/* Problems Section - Inside the same card */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-base md:text-lg text-white font-semibold mb-4">
                    Когато спада, започват проблемите:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {problems.map((problem, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-colors"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                          {problem.icon}
                        </div>
                        <span className="text-white/70 text-sm">{problem.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tired Man Image Card - Spans 5 columns */}
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-0 bg-red-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-all" />
            <div className="relative h-64 md:h-full min-h-[280px] rounded-3xl overflow-hidden border border-white/10">
              <img
                src="https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/did-you-know/tired-man.png"
                alt="Симптоми на нисък тестостерон"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/80 backdrop-blur-sm text-white text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Нисък тестостерон
                </span>
              </div>
            </div>
          </div>

          {/* Animated Transition - Problem to Solution */}
          <div className="md:col-span-12 py-8 md:py-12 relative">
            {/* Gradient Line Transition */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Central Badge */}
            <div className="relative flex justify-center">
              <div className="relative group/badge">
                {/* Animated glow rings */}
                <div className="absolute inset-0 -m-4 rounded-full bg-brand-green/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 -m-2 rounded-full bg-brand-green/30 animate-pulse" />

                {/* Main badge */}
                <div className="relative flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-brand-green to-emerald-500 shadow-lg shadow-brand-green/30">
                  {/* Animated checkmark */}
                  <div className="relative">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                        style={{
                          strokeDasharray: 30,
                          strokeDashoffset: 30,
                          animation: 'drawLine 0.5s ease-out forwards 0.3s'
                        }}
                      />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    Решението
                  </span>
                </div>

                {/* Decorative arrows pointing down */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                  <svg className="w-4 h-4 text-brand-green animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Side decorative elements */}
            <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-8 md:w-16 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
            </div>
            <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-8 md:w-16 h-px bg-gradient-to-l from-brand-green/50 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-brand-green/50 animate-pulse" />
            </div>
          </div>

          {/* Solution Card - Full width */}
          <div className="md:col-span-7 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/30 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/5 backdrop-blur-md border border-brand-green/30 rounded-3xl p-6 md:p-8 h-full overflow-hidden">
              {/* Background Product Image - Mysterious */}
              <div className="absolute -right-8 -bottom-8 w-64 h-64 md:w-80 md:h-80 opacity-[0.08] pointer-events-none">
                <img
                  src="/product/testoup-3.png"
                  alt=""
                  className="w-full h-full object-contain filter blur-[1px] grayscale-[30%]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-green/10 rounded-3xl pointer-events-none" />
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-4">
                Затова създадохме <span className="text-brand-green font-bold text-xl md:text-2xl">TestoUP</span> - формула с 12 съставки, която адресира всички тези фактори едновременно.
              </p>

              {/* 12 Ingredients Grid */}
              <div className="mb-6">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">12 активни съставки:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { name: "Ашваганда", dose: "400мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/ashwagandha.png" },
                    { name: "Витамин D3", dose: "2400 МЕ", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-d3.png" },
                    { name: "Цинк", dose: "50мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/zinc.png" },
                    { name: "Селен", dose: "100мкг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/selenium.png" },
                    { name: "Витамин B12", dose: "10мкг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-b12.png" },
                    { name: "Витамин E", dose: "30мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-e.png" },
                    { name: "Трибулус", dose: "500мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/tribulus.png" },
                    { name: "Магнезий", dose: "400мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/magnesium.png" },
                    { name: "Витамин K2", dose: "100мкг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-k2.png" },
                    { name: "Витамин B6", dose: "5мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-b6.png" },
                    { name: "Фолат B9", dose: "400мкг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/folate-b9.png" },
                    { name: "Витамин C", dose: "200мг", img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-c.png" }
                  ].map((ing, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-green/40 hover:bg-white/10 transition-all cursor-default"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden mb-1.5 ring-1 ring-white/10 group-hover:ring-brand-green/30 transition-all">
                        <img
                          src={ing.img}
                          alt={ing.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-white/80 text-[10px] md:text-xs font-medium text-center leading-tight">{ing.name}</span>
                      <span className="text-brand-green/70 text-[9px] md:text-[10px] font-semibold">{ing.dose}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="https://shop.testograph.eu"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-brand-green text-white font-semibold rounded-full hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/25 hover:shadow-xl hover:shadow-brand-green/30 group/btn"
              >
                Виж TestoUP
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Energetic Man Image Card */}
          <div className="md:col-span-5 relative group mt-4">
            <div className="absolute inset-0 bg-brand-green/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-all" />
            <div className="relative h-64 md:h-full min-h-[280px] rounded-3xl overflow-hidden border border-brand-green/30">
              <img
                src="https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/did-you-know/energetic-man.png?v=2"
                alt="Оптимални нива на тестостерон с TestoUP"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/80 backdrop-blur-sm text-white text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  С TestoUP
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ============================================
// INGREDIENTS DETAIL SECTION - 12 Active Ingredients
// ============================================
function IngredientsDetailSection() {
  const ingredients = [
    {
      name: "Tribulus Terrestris",
      dose: "600мг",
      description: "Повишава либидото и мъжката жизненост. Натурален стимулант, използван от хиляди години.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/tribulus.png",
      color: "lime"
    },
    {
      name: "Ашваганда",
      dose: "400мг",
      description: "Намалява кортизола (хормона на стреса), подобрява възстановяването и издръжливостта. Доказан адаптоген.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/ashwagandha.png",
      color: "green"
    },
    {
      name: "Цинк цитрат",
      dose: "50мг",
      description: "Ключов за мъжкото здраве и либидо. 5x повече от аптечните добавки. Тялото не го складира - трябва ти всеки ден.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/zinc.png",
      color: "blue"
    },
    {
      name: "Магнезий бисглицинат",
      dose: "400мг",
      description: "Най-усвоимата форма. За дълбок сън, мускулна функция и възстановяване след тренировка.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/magnesium.png",
      color: "cyan"
    },
    {
      name: "Витамин D3",
      dose: "2400 МЕ",
      description: "90% от българите имат дефицит. Директно влияе на енергията, настроението и мъжкото здраве.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-d3.png",
      color: "orange"
    },
    {
      name: "Витамин E",
      dose: "300мг",
      description: "Мощен антиоксидант. Подкрепя кръвообращението и клетъчната защита.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-e.png",
      color: "amber"
    },
    {
      name: "Витамин C",
      dose: "200мг",
      description: "Имунна система, възстановяване, намалява оксидативния стрес от тренировки.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-c.png",
      color: "yellow"
    },
    {
      name: "Витамин K2-MK7",
      dose: "200мкг",
      description: "Насочва калция към костите, не към артериите. Работи в синергия с D3.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-k2.png",
      color: "indigo"
    },
    {
      name: "Витамин B6",
      dose: "10мг",
      description: "Регулира хормоналния баланс, подобрява енергийния метаболизъм.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-b6.png",
      color: "pink"
    },
    {
      name: "Витамин B12",
      dose: "600мкг",
      description: "За нервна система, енергия и ментална яснота. Много мъже имат дефицит без да знаят.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/vitamin-b12.png",
      color: "red"
    },
    {
      name: "Витамин B9 (Фолат)",
      dose: "400мкг",
      description: "Подкрепя клетъчното делене и здравето на сперматозоидите.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/folate-b9.png",
      color: "rose"
    },
    {
      name: "Селенометионин",
      dose: "200мкг",
      description: "Антиоксидант, подкрепя имунната система и щитовидната жлеза.",
      img: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/ingredients/selenium.png",
      color: "purple"
    }
  ];

  return (
    <section className="py-10 md:py-24 px-3 md:px-6 bg-white overflow-hidden reveal">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-brand-green/10 text-brand-green text-xs md:text-sm font-medium mb-3 md:mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Научна формула
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-brand-dark mb-2 md:mb-4">
            Какво има в TestoUP?
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
            12 активни съставки в максимални дози
          </p>
        </div>

        {/* Auto-Scrolling Carousel */}
        <div className="relative -mx-4 md:mx-0">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* CSS for infinite scroll animation */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes ingredients-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes ingredients-scroll-reverse {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-ingredients-scroll {
              animation: ingredients-scroll 40s linear infinite;
            }
            .animate-ingredients-scroll-reverse {
              animation: ingredients-scroll-reverse 45s linear infinite;
            }
            .animate-ingredients-scroll:hover,
            .animate-ingredients-scroll-reverse:hover {
              animation-play-state: paused;
            }
          `}} />

          {/* Row 1: First 6 ingredients - Scrolling Left */}
          <div className="overflow-hidden pb-4">
            <div className="flex gap-4 px-4 md:px-0 animate-ingredients-scroll" style={{ width: 'max-content' }}>
              {/* First 6 ingredients */}
              {ingredients.slice(0, 6).map((ing, idx) => (
                <div
                  key={idx}
                  className="group w-[220px] md:w-[320px] flex-shrink-0 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden ring-2 ring-${ing.color}-500/20 group-hover:ring-${ing.color}-500/40 transition-all flex-shrink-0`}>
                      <img src={ing.img} alt={ing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark text-sm md:text-lg leading-tight mb-1">{ing.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-${ing.color}-500/10 text-${ing.color}-600 text-xs md:text-sm font-semibold`}>{ing.dose}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{ing.description}</p>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {ingredients.slice(0, 6).map((ing, idx) => (
                <div
                  key={`dup-${idx}`}
                  className="group w-[220px] md:w-[320px] flex-shrink-0 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden ring-2 ring-${ing.color}-500/20 group-hover:ring-${ing.color}-500/40 transition-all flex-shrink-0`}>
                      <img src={ing.img} alt={ing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark text-sm md:text-lg leading-tight mb-1">{ing.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-${ing.color}-500/10 text-${ing.color}-600 text-xs md:text-sm font-semibold`}>{ing.dose}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{ing.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Last 6 ingredients - Scrolling Right (Reverse) */}
          <div className="overflow-hidden pb-4 mt-4">
            <div className="flex gap-4 px-4 md:px-0 animate-ingredients-scroll-reverse" style={{ width: 'max-content' }}>
              {/* Last 6 ingredients */}
              {ingredients.slice(6, 12).map((ing, idx) => (
                <div
                  key={`rev-${idx}`}
                  className="group w-[220px] md:w-[320px] flex-shrink-0 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden ring-2 ring-${ing.color}-500/20 group-hover:ring-${ing.color}-500/40 transition-all flex-shrink-0`}>
                      <img src={ing.img} alt={ing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark text-sm md:text-lg leading-tight mb-1">{ing.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-${ing.color}-500/10 text-${ing.color}-600 text-xs md:text-sm font-semibold`}>{ing.dose}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{ing.description}</p>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {ingredients.slice(6, 12).map((ing, idx) => (
                <div
                  key={`rev-dup-${idx}`}
                  className="group w-[220px] md:w-[320px] flex-shrink-0 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden ring-2 ring-${ing.color}-500/20 group-hover:ring-${ing.color}-500/40 transition-all flex-shrink-0`}>
                      <img src={ing.img} alt={ing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark text-sm md:text-lg leading-tight mb-1">{ing.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-${ing.color}-500/10 text-${ing.color}-600 text-xs md:text-sm font-semibold`}>{ing.dose}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{ing.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Hint */}
          <div className="flex justify-center mt-4 gap-2">
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Задръж за пауза
            </span>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-brand-green/5 border border-brand-green/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-brand-dark font-medium">Всяка съставка е подбрана с конкретна цел</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-brand-green/20" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-brand-dark font-medium">Максимални дози за реален ефект</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS - DAY 7/30/90 TIMELINE
// ============================================
function HowItWorksSection() {
  const timelineImages = {
    "day-7": "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/timeline/day-7.png?v=2",
    "day-30": "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/timeline/day-30.png?v=2",
    "day-90": "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/timeline/day-90.png?v=2",
  };

  const milestones = [
    {
      day: 7,
      label: "Ден 7",
      title: "Първите промени",
      points: [
        "Либидото се връща.",
        "Настроението се подобрява.",
        "Енергията е стабилна през целия ден."
      ],
      image: timelineImages["day-7"],
      gradient: "from-lime-400 to-lime-600",
      bgGradient: "from-lime-500/10 to-lime-500/5",
      ringColor: "ring-lime-400/30",
      accentColor: "lime"
    },
    {
      day: 30,
      label: "Ден 30",
      title: "Реална разлика",
      points: [
        "Забележима сила в залата.",
        "Постоянно високо либидо.",
        "Увереност, която личи."
      ],
      image: timelineImages["day-30"],
      gradient: "from-emerald-400 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-500/5",
      ringColor: "ring-emerald-400/30",
      accentColor: "emerald"
    },
    {
      day: 90,
      label: "Ден 90",
      title: "Пълна трансформация",
      points: [
        "Мускулна твърдост.",
        "Постоянна мотивация и енергия.",
        "Всички около теб забелязват разликата."
      ],
      image: timelineImages["day-90"],
      gradient: "from-brand-green to-emerald-600",
      bgGradient: "from-brand-green/10 to-brand-green/5",
      ringColor: "ring-brand-green/30",
      accentColor: "brand-green"
    }
  ];

  return (
    <section id="how-it-works" className="py-10 md:py-24 px-3 md:px-6 bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-hidden reveal relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Particles Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes count-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float-up {
          animation: float-up 15s linear infinite;
        }
        .animate-progress-glow {
          animation: progress-glow 2s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
      `}} />

      {/* Floating Particles - Fixed positions to avoid hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 5, delay: 0, duration: 18 },
          { left: 12, delay: 3, duration: 20 },
          { left: 20, delay: 7, duration: 16 },
          { left: 28, delay: 2, duration: 22 },
          { left: 35, delay: 9, duration: 17 },
          { left: 45, delay: 5, duration: 19 },
          { left: 52, delay: 11, duration: 21 },
          { left: 60, delay: 1, duration: 18 },
          { left: 68, delay: 8, duration: 23 },
          { left: 75, delay: 4, duration: 17 },
          { left: 82, delay: 12, duration: 20 },
          { left: 88, delay: 6, duration: 16 },
          { left: 93, delay: 10, duration: 19 },
          { left: 97, delay: 14, duration: 22 },
          { left: 3, delay: 13, duration: 18 }
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-brand-green/30 rounded-full animate-float-up"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-20">
          <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-brand-green/20 text-brand-green text-xs md:text-sm font-medium mb-3 md:mb-4 backdrop-blur-sm border border-brand-green/20">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Твоят път към резултати
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-display font-bold text-white mb-3 md:mb-4">
            Как работи <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-brand-green">TestoUP?</span>
          </h2>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
            Научно разработена формула с доказан ефект във времето
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:block relative max-w-4xl mx-auto mb-16">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lime-400 via-emerald-500 to-brand-green rounded-full animate-progress-glow" style={{ width: '100%' }} />
          </div>
          {/* Progress Markers */}
          <div className="absolute top-1/2 left-0 w-full flex justify-between transform -translate-y-1/2">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex flex-col items-center" style={{ left: idx === 0 ? '0%' : idx === 1 ? '0%' : '0%' }}>
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${m.gradient} ring-4 ring-gray-900 flex items-center justify-center`}>
                  <div className="absolute w-10 h-10 rounded-full bg-current opacity-20 animate-pulse-ring" style={{ color: idx === 0 ? '#84cc16' : idx === 1 ? '#10b981' : '#22c55e' }} />
                </div>
                <span className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Ден {m.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {milestones.map((milestone, idx) => (
            <div
              key={milestone.day}
              className="group relative"
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${milestone.bgGradient} backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2`}>
                {/* Image Container */}
                <div className="relative h-40 md:h-56 overflow-hidden">
                  <img
                    src={milestone.image}
                    alt={milestone.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                  {/* Day Badge - Floating */}
                  <div className={`absolute top-3 right-3 md:top-4 md:right-4 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${milestone.gradient} flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="text-center text-white">
                      <div className="text-lg md:text-2xl font-black leading-none">{milestone.day}</div>
                      <div className="text-[7px] md:text-[9px] uppercase tracking-widest opacity-80 font-medium">ден</div>
                    </div>
                  </div>

                  {/* Animated Ring Effect */}
                  <div className={`absolute top-3 right-3 md:top-4 md:right-4 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ring-2 ${milestone.ringColor} animate-pulse-ring`} />
                </div>

                {/* Content */}
                <div className="p-4 md:p-8">
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                    <span className={`w-1.5 md:w-2 h-6 md:h-8 rounded-full bg-gradient-to-b ${milestone.gradient}`} />
                    {milestone.title}
                  </h3>

                  {/* Points */}
                  <ul className="space-y-2 md:space-y-3">
                    {milestone.points.map((point, pointIdx) => (
                      <li
                        key={pointIdx}
                        className="flex items-start gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{ transitionDelay: `${pointIdx * 100}ms`, opacity: 1 }}
                      >
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br ${milestone.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300 text-xs md:text-base leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Progress Indicator */}
                  <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500">
                      <span>Напредък</span>
                      <span className="text-brand-green font-semibold">{Math.round((idx + 1) / 3 * 100)}%</span>
                    </div>
                    <div className="mt-1.5 md:mt-2 h-1 md:h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${milestone.gradient} rounded-full transition-all duration-1000`}
                        style={{ width: `${(idx + 1) / 3 * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${milestone.gradient} blur-3xl -z-10`} style={{ opacity: 0.1 }} />
              </div>

              {/* Mobile Connector */}
              {idx < milestones.length - 1 && (
                <div className="md:hidden flex justify-center py-4">
                  <div className={`w-0.5 h-8 bg-gradient-to-b ${milestone.gradient}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 md:mt-10 text-center">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-brand-green to-emerald-600 text-white font-bold text-base md:text-lg rounded-full hover:shadow-2xl hover:shadow-brand-green/30 transition-all duration-300 hover:scale-105 group"
          >
            <span>Започни трансформацията</span>
            <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="mt-3 md:mt-4 text-gray-500 text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            30-дневна гаранция за връщане на парите
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// VIDEO TESTIMONIALS SECTION
// ============================================
function VideoTestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const videos = [
    { src: "/testimonials/TestoUp - Libido 1.mp4", title: "Подобрено либидо след 2 седмици", tag: "ЛИБИДО" },
    { src: "/testimonials/TestoUP - LIBIDO 2.mp4", title: "Връщане на сексуалната енергия", tag: "ЛИБИДО" },
    { src: "/testimonials/TestoUP - Libido 3.mp4", title: "По-силно желание и увереност", tag: "ЛИБИДО" },
    { src: "/testimonials/TestoUp - Pregmant 1.mp4", title: "Успешна бременност след години опити", tag: "ФЕРТИЛНОСТ" },
    { src: "/testimonials/TestoUp - Pregmant 2.mp4", title: "Подобрени параметри и зачатие", tag: "ФЕРТИЛНОСТ" },
    { src: "/testimonials/TestoUp - Pregmant 3.mp4", title: "Реална промяна в качеството", tag: "ФЕРТИЛНОСТ" }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(videos.length - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, videos.length]);

  const scrollTo = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'next') {
      setCurrentSlide((prev) => Math.min(prev + 1, videos.length - 3));
    } else {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <section className="py-10 md:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-green/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Floating elements */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-brand-green/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-emerald-500/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-3 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12 reveal">
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-brand-green/10 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-green rounded-full animate-pulse" />
            <span className="text-xs md:text-sm font-semibold text-brand-green">ВИДЕО ОТЗИВИ</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-2 md:mb-3">
            Реални Истории от Клиенти
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Вижте как TestoUP промени живота на мъже в България
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollTo('prev')}
            disabled={currentSlide === 0}
            className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => scrollTo('next')}
            disabled={currentSlide >= videos.length - 3}
            className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden rounded-2xl mx-6 md:mx-8">
            <div
              className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * (100 / 3 + 2)}%)` }}
            >
              {videos.map((video, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)]"
                >
                  <div className="group relative transition-all duration-500 hover:-translate-y-2">
                    {/* Phone Frame */}
                    <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
                      {/* Phone Outer Shell */}
                      <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[2.5rem] md:rounded-[3rem] p-1.5 md:p-2 shadow-2xl shadow-black/40">
                        {/* Phone Inner Bezel */}
                        <div className="relative bg-black rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                          {/* Dynamic Island / Notch */}
                          <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 z-20 w-20 md:w-24 h-5 md:h-6 bg-black rounded-full flex items-center justify-center gap-2">
                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                          </div>

                          {/* Screen Content */}
                          <div className="relative aspect-[9/19] bg-gradient-to-br from-gray-900 to-black">
                            {/* Video Container - positioned to account for notch */}
                            <div className="absolute inset-0 pt-8 md:pt-10">
                              <div className="relative h-full">
                                <video
                                  className="w-full h-full object-cover"
                                  controls
                                  preload="metadata"
                                  onPlay={() => setIsAutoPlaying(false)}
                                  onPause={() => setTimeout(() => setIsAutoPlaying(true), 3000)}
                                >
                                  <source src={video.src} type="video/mp4" />
                                </video>

                                {/* Play overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>

                            {/* Tag Badge */}
                            <div className="absolute top-10 left-2 md:top-12 md:left-3 z-10">
                              <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg ${
                                video.tag === 'ЛИБИДО'
                                  ? 'bg-brand-green/90 text-white'
                                  : 'bg-purple-500/90 text-white'
                              }`}>
                                {video.tag}
                              </span>
                            </div>

                            {/* Verified badge */}
                            <div className="absolute top-10 right-2 md:top-12 md:right-3 z-10">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-brand-green" />
                              </div>
                            </div>
                          </div>

                          {/* Home Indicator */}
                          <div className="absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 w-24 md:w-28 h-1 bg-white/30 rounded-full" />
                        </div>

                        {/* Phone Side Buttons - Left */}
                        <div className="absolute left-0 top-20 md:top-24 w-0.5 h-6 md:h-8 bg-gray-700 rounded-l-sm" />
                        <div className="absolute left-0 top-32 md:top-36 w-0.5 h-10 md:h-12 bg-gray-700 rounded-l-sm" />
                        <div className="absolute left-0 top-44 md:top-52 w-0.5 h-10 md:h-12 bg-gray-700 rounded-l-sm" />

                        {/* Phone Side Buttons - Right */}
                        <div className="absolute right-0 top-28 md:top-32 w-0.5 h-12 md:h-16 bg-gray-700 rounded-r-sm" />
                      </div>

                      {/* Reflection/Shine effect */}
                      <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                      {/* Hover glow effect */}
                      <div className="absolute -inset-1 rounded-[3rem] md:rounded-[3.5rem] bg-brand-green/0 group-hover:bg-brand-green/10 blur-xl transition-all duration-500 pointer-events-none" />
                    </div>

                    {/* Title below phone */}
                    <div className="mt-3 md:mt-4 text-center px-2">
                      <h3 className="font-bold text-xs md:text-sm text-gray-900 line-clamp-2 group-hover:text-brand-green transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-brand-green" />
                        Потвърден клиент
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {Array.from({ length: Math.ceil(videos.length - 2) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 8000);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2 bg-brand-green'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4 md:gap-12 reveal">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-brand-green">50+</p>
            <p className="text-xs md:text-sm text-gray-500">видео отзива</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-brand-green">98%</p>
            <p className="text-xs md:text-sm text-gray-500">доволни клиенти</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-brand-green">4.9/5</p>
            <p className="text-xs md:text-sm text-gray-500">средна оценка</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTOGRAPH V2 APP SECTION - FREE WITH TESTOUP
// ============================================
function TestographV2Section() {
  const [isVisible, setIsVisible] = useState(false);
  const [countedValue, setCountedValue] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Animate counter from 0 to 450
    const duration = 2000;
    const steps = 60;
    const increment = 450 / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 450) {
        setCountedValue(450);
        clearInterval(timer);
      } else {
        setCountedValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Dumbbell,
      title: "Персонализирани тренировки",
      desc: "5,000+ упражнения с видео",
      color: "from-purple-500 to-indigo-600",
      bg: "bg-purple-50",
      delay: "0ms"
    },
    {
      icon: UtensilsCrossed,
      title: "Хранителни планове",
      desc: "Точни макроси за тестостерон",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      delay: "100ms"
    },
    {
      icon: Moon,
      title: "Сън и възстановяване",
      desc: "Протоколи за оптимална почивка",
      color: "from-blue-500 to-cyan-600",
      bg: "bg-blue-50",
      delay: "200ms"
    },
    {
      icon: Brain,
      title: "24/7 достъп до асистент",
      desc: "",
      color: "from-orange-500 to-amber-600",
      bg: "bg-orange-50",
      delay: "300ms"
    }
  ];

  return (
    <section className="relative py-10 md:py-28 px-3 md:px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-brand-green/30 rounded-full animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header with Animation */}
        <div className={`text-center mb-8 md:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-brand-green/20 to-emerald-100 backdrop-blur-sm text-brand-green px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6 shadow-lg shadow-brand-green/10 border border-brand-green/20">
            <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" />
            <span>БЕЗПЛАТНО С TESTOUP</span>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-green rounded-full animate-pulse" />
          </div>

          <h2 className="font-display font-bold text-2xl md:text-5xl lg:text-6xl text-brand-dark mb-4 md:mb-6 leading-tight">
            Всичко това получаваш{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-600">безплатно</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 2 150 2 198 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" className="animate-[drawLine_1s_ease-out_forwards]" style={{ strokeDasharray: 200, strokeDashoffset: 200 }} />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Не ти трябва личен треньор, диетолог или рехабилитатор.
            <span className="font-semibold text-gray-900"> Всичко е в едно приложение.</span>
          </p>
        </div>

        {/* Main Content - Bento Style */}
        <div className="relative grid lg:grid-cols-2 gap-4 md:gap-8 items-start">

          {/* Left - Receipt Value Card */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative flex items-start justify-center bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100">
              <img
                src="/app/labble-app.webp"
                alt="Testograph App стойност - спестяваш 450 лв месечно"
                className="w-full max-w-[340px] h-auto drop-shadow-2xl rounded-xl"
              />
            </div>
          </div>

          {/* Connector Arrow - Desktop Only */}
          <div className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center gap-2 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            {/* Animated flowing dots */}
            <div className="relative w-24 h-12 flex items-center justify-center">
              {/* Background pill */}
              <div className="absolute inset-0 bg-white rounded-full shadow-lg border border-gray-100" />

              {/* Flowing dots animation */}
              <div className="relative flex items-center gap-1.5">
                <div className="w-2 h-2 bg-brand-green rounded-full animate-[flowRight_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-brand-green/70 rounded-full animate-[flowRight_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-brand-green/50 rounded-full animate-[flowRight_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                <ArrowRight className="w-5 h-5 text-brand-green ml-1" />
              </div>
            </div>

            {/* Label */}
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider bg-white px-2 py-0.5 rounded-full shadow-sm border border-brand-green/20">
              Безплатно
            </span>
          </div>

          {/* Right Side - Phone Carousel */}
          <div>
            <PhoneCarouselSection isVisible={isVisible} />
          </div>
        </div>

        {/* Compact 2x2 Features Grid - Below Both */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-brand-green/30"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-4 h-4" style={{ color: feature.color.includes('purple') ? '#8b5cf6' : feature.color.includes('emerald') ? '#10b981' : feature.color.includes('blue') ? '#3b82f6' : '#f97316' }} />
                </div>
                <div className="flex items-center">
                  <h4 className="font-bold text-gray-900 text-xs md:text-sm leading-tight">{feature.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-8 md:mt-16 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-r from-brand-dark via-gray-900 to-brand-dark rounded-2xl md:rounded-3xl p-5 md:p-12 overflow-hidden">
            {/* Animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green/20 via-transparent to-brand-green/20 animate-[shimmer_3s_ease-in-out_infinite]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="text-center md:text-left">
                <p className="text-brand-green font-bold text-xs md:text-sm mb-1 md:mb-2 uppercase tracking-wider">Включено в покупката</p>
                <h3 className="font-display font-bold text-xl md:text-3xl text-white mb-1 md:mb-2">
                  Стойност над 450 лв/месец - <span className="text-brand-green">твоя безплатно</span>
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  При покупка на TestoUP получаваш достъп за колкото дни имаш капсули
                </p>
              </div>

              <a
                href="https://shop.testograph.eu/products/testoup"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-brand-green text-white font-bold text-base md:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-brand-green/30 overflow-hidden whitespace-nowrap"
              >
                <span className="relative z-10">Вземи TestoUP + App</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-emerald-500 to-brand-green bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
              </a>
            </div>

            {/* Trust row */}
            <div className="relative z-10 mt-5 pt-5 md:mt-8 md:pt-8 border-t border-white/10 flex flex-wrap justify-center gap-3 md:gap-12">
              <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">30-дневна гаранция</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                <Truck className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">Безплатна доставка</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">Сигурно плащане</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-brand-green" />
                <span className="text-xs md:text-sm">4.9/5 рейтинг</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
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
// HOW TO ORDER SECTION (Old "How It Works")
// ============================================
function HowToOrderSection() {
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
              <span className="font-bold text-[11px] md:text-lg text-gray-900">Над 1300+ доволни клиенти в България</span>
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
    { text: "TestoUP е най-добрият тестостерон бустер на пазара. Тестостеронови бустери мнения потвърждават това. Силно препоръчвам за мъжко здраве.", author: "Валентин Д.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/resizing_type:fill/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/ea730c03-1fda-4bb2-b073-a5a4d77d1977.jpeg" },
    { text: "Страдах от липса на енергия и постоянна умора. TestoUP ми върна жизнеността. Сега се чувствам пълен с енергия всеки ден.", author: "Теодор Р.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/resizing_type:fill/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/782b0d5f-c721-45b1-b151-af563a50a005.jpeg" },
    { text: "Хормоналният дисбаланс ми причиняваше много симптоми. TestoUP балансира хормоните естествено. Сега имам енергия и добро настроение.", author: "Тихомир Г.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/resizing_type:fill/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/9d29cee2-fff8-449c-b2ac-de5dcc29944a.jpeg" },
    { text: "Ниското самочувствие и липса на увереност ме ограничаваха. TestoUP ми даде нова енергия и увереност. Чувствам се като нов човек.", author: "Камен И.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/resizing_type:fill/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/0f0bae8a-a34e-4323-8941-0931ba143559.jpeg" },
    { text: "TestoUP съдържа цинк и магнезий, които са есенциални за тестостерона. Усетих повече енергия и по-добър сън. Силно препоръчвам.", author: "Боян С.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/45b0b02e-bf82-43d9-9f2b-5d7de6d5907c.jpeg" },
    { text: "Правя HIIT тренировки и TestoUP подобри издръжливостта ми. Възстановяването след тренировка е по-бързо.", author: "Огнян П.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/4d4dec2d-aa8a-4ded-9c7b-78b351d93472.jpeg" },
    { text: "Правих изследване на тестостерон преди и след TestoUP. Нивата ми се повишиха значително за 6 седмици. Продуктът работи!", author: "Росен С.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/b1bb7cb0-4e71-4176-90a1-f760d2eb852f.jpeg" },
    { text: "Хроничната умора и отпадналост бяха мой ежедневен спътник. TestoUP ми даде нова енергия за живот. Вече нямам нужда от следобеден сън.", author: "Ивайло Д.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/672b4e91-6baa-4081-9a69-bad8d341c285.jpeg" },
    { text: "TestoUP стана част от здравословния ми начин на живот. Добавки за енергия като тази са незаменими за мъжкото здраве.", author: "Здравко М.", avatar: "https://reviews-media.services.klaviyo.com/abc/width:600/height:600/plain/https://klaviyo.s3.amazonaws.com/reviews/images/TZ2ckD/e5c0f6eb-743b-431b-996e-1e08d531db0f.jpeg" }
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
// QUOTE TESTIMONIALS - Carousel with auto-play
// ============================================
function QuoteTestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const quotes = [
    {
      text: "На четвъртия ден се събудих с енергия, каквато не съм имал от месеци. Либидото се върна. После видях че има планове в апа. След 6 седмици съм друг човек.",
      name: "Иван",
      age: "32г.",
      avatar: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/avatars/ivan-32.png",
      rating: 5,
      verified: true
    },
    {
      text: "Не очаквах толкова много неща да са включени. Добавката, апликацията, плановете... Всичко на едно място. Разликата в либидото се усети още първата седмица.",
      name: "Димитър",
      age: "41г.",
      avatar: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/avatars/dimitar-41.png",
      rating: 5,
      verified: true
    },
    {
      text: "Жена ми казва че съм по-присъстващ, по-жив. Комбинацията от хапчетата и системата направи огромна разлика. Либидото е като преди 10 години.",
      name: "Стоян",
      age: "38г.",
      avatar: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/avatars/stoyan-38.png",
      rating: 5,
      verified: true
    },
    {
      text: "Пробвал съм три добавки преди това. Нищо. С TestoUP разликата беше очевидна още първата седмица. Енергията, желанието - всичко се върна.",
      name: "Георги",
      age: "45г.",
      avatar: "https://mrpsaqtmucxpawajfxfn.supabase.co/storage/v1/object/public/blog-images/avatars/georgi-45.png",
      rating: 5,
      verified: true
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, quotes.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % quotes.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + quotes.length) % quotes.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-10 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-green/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Product background images - subtle */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left bottle */}
        <div className="absolute -left-20 top-1/4 opacity-[0.06] hidden lg:block">
          <img
            src="/product/testoup-bottle_v2.webp"
            alt=""
            className="w-64 h-auto -rotate-12 blur-[1px]"
          />
        </div>
        {/* Right bottle */}
        <div className="absolute -right-16 top-1/3 opacity-[0.06] hidden lg:block">
          <img
            src="/product/testoup-bottle_v1.webp"
            alt=""
            className="w-56 h-auto rotate-12 blur-[1px]"
          />
        </div>
        {/* Bottom center product */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 opacity-[0.04] hidden md:block">
          <img
            src="/product/testoup-3.png"
            alt=""
            className="w-80 h-auto blur-[2px]"
          />
        </div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-3 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-green/20 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4 reveal">
            <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-brand-green tracking-wide">РЕАЛНИ РЕЗУЛТАТИ</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 reveal">
            Какво казват мъжете
          </h2>
          <p className="text-base md:text-lg text-gray-400 reveal">
            които вече пробваха TestoUP
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-2xl mx-auto relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-brand-green/30 hover:border-brand-green/50 transition-all duration-300 group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-brand-green/30 hover:border-brand-green/50 transition-all duration-300 group"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {quotes.map((quote, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-3 md:px-6">
                  {/* Card with glassmorphism */}
                  <div className="relative bg-white/[0.05] backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/10">
                    {/* Quote icon */}
                    <div className="absolute top-4 right-4">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-brand-green/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Stars Rating */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(quote.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Quote Text */}
                    <p className="text-white text-sm md:text-base leading-relaxed mb-4 relative z-10">
                      "{quote.text}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10 relative z-10">
                      {/* Avatar with ring */}
                      <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-brand-green via-emerald-500 to-teal-500 p-[2px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                            <img
                              src={quote.avatar}
                              alt={quote.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-green to-emerald-600 text-white font-bold text-base">${quote.name[0]}</div>`;
                              }}
                            />
                          </div>
                        </div>
                        {/* Verified badge */}
                        {quote.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center border-2 border-gray-900">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-white text-sm md:text-base">{quote.name}</p>
                        <p className="text-gray-400 text-xs md:text-sm">{quote.age}</p>
                      </div>

                      {/* Verified text */}
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Потвърдена покупка</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-5">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2 bg-brand-green'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats & CTA with Sample Product */}
        <div className="mt-8 md:mt-10 reveal">
          <div className="max-w-xl mx-auto">
            {/* Sample Product Card */}
            <div className="relative bg-white/[0.05] backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 hover:border-brand-green/30 transition-all duration-300">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-green/20 via-transparent to-emerald-500/20 rounded-2xl blur-xl opacity-50" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 md:gap-5">
                {/* Sample Image */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-brand-green/20 rounded-full blur-2xl" />
                  <img
                    src="/product/Sample.png"
                    alt="TestoUP безплатна проба"
                    className="relative w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
                  />
                  {/* Free badge */}
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-green to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    БЕЗПЛАТНО
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    Пробвай безплатно
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    7-дневна опаковка - плащаш само доставката
                  </p>

                  {/* Stats */}
                  <p className="text-xs md:text-sm text-gray-300 mb-4">
                    <span className="text-brand-green font-bold">1300+</span> мъже вече използват системата. <span className="text-brand-green font-bold">91%</span> поръчват отново.
                  </p>

                  {/* CTA Button */}
                  <a
                    href="https://shop.testograph.eu/products/testoup-sample-7"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-emerald-600 hover:to-brand-green text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-brand-green/30 hover:shadow-brand-green/50 hover:scale-105 text-sm md:text-base"
                  >
                    <span>ПОРЪЧАЙ БЕЗПЛАТНА ПРОБА</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Guarantee Card */}
        <div className="max-w-2xl mx-auto mt-8 md:mt-10 reveal">
          <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-brand-green/30">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-green/10 via-transparent to-emerald-500/10" />

            <div className="relative z-10">
              {/* Header with shield */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white">30-дневна гаранция</h3>
              </div>

              {/* Guarantee text */}
              <p className="text-gray-300 text-center text-sm md:text-base leading-relaxed mb-2">
                Ако след 30 дни не видиш резултат при стриктно следване на програмата и прием на TestoUP - <span className="text-brand-green font-semibold">връщаме парите.</span> <span className="text-white font-bold">Без въпроси.</span>
              </p>

              {/* Trust indicators row */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Lock className="w-4 h-4 text-brand-green" />
                  <span className="text-xs">Сигурно плащане</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Truck className="w-4 h-4 text-brand-green" />
                  <span className="text-xs">Безплатна доставка</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Users className="w-4 h-4 text-brand-green" />
                  <span className="text-xs">1300+ доволни клиенти</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// WHAT YOU GET SECTION - Order benefits (2025 Modern)
// ============================================
function WhatYouGetSection() {
  const benefits = [
    { icon: Pill, text: 'TestoUP формула', sub: '12 съставки, 30-дневен запас' },
    { icon: Smartphone, text: 'Testograph апликация', sub: 'безплатен достъп' },
    { icon: MessageCircle, text: '24/7 хормонален експерт', sub: 'в апликацията' },
    { icon: Utensils, text: 'Хранителни планове', sub: '+ тренировъчна програма' },
    { icon: Shield, text: '30-дневна гаранция', sub: 'при следване на програмата' },
    { icon: Truck, text: 'Безплатна доставка', sub: 'над 100 лв' },
  ];

  return (
    <section className="py-10 md:py-24 bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-teal-300/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Animated floating shapes */}
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-brand-green/30 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 left-20 w-3 h-3 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 right-20 w-5 h-5 bg-teal-400/30 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-brand-green/50 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />

        {/* Gradient lines */}
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-brand-green/20 to-transparent" />
        <div className="absolute bottom-0 right-1/3 w-px h-40 bg-gradient-to-t from-transparent via-emerald-500/20 to-transparent" />
      </div>

      <div className="container mx-auto px-3 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-brand-green/10 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4 reveal">
            <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-green" />
            <span className="text-xs md:text-sm font-semibold text-brand-green">ВСИЧКО В ЕДИН ПАКЕТ</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 reveal">
            Какво получаваш с всяка поръчка
          </h2>
        </div>

        {/* Main Content - Split Layout */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center">

          {/* Left - Product Image with animations */}
          <div className="relative order-2 lg:order-1 reveal">
            {/* Glow behind product */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-brand-green/20 via-emerald-400/15 to-teal-300/10 rounded-full blur-[60px] animate-pulse" />
            </div>

            {/* Rotating ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-72 h-72 md:w-96 md:h-96 border-2 border-dashed border-brand-green/20 rounded-full"
                style={{ animation: 'spin 30s linear infinite' }}
              />
            </div>

            {/* Product image */}
            <div className="relative z-10 flex items-center justify-center py-8">
              <img
                src="/product/STARTER_12.webp"
                alt="TestoUP пакет"
                className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating benefit badges around product */}
            <div className="absolute top-5 left-5 md:top-10 md:left-0 bg-white rounded-full px-3 py-1.5 shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: '4s' }}>
              <span className="text-xs font-semibold text-gray-700">12 съставки</span>
            </div>
            <div className="absolute top-1/4 right-0 md:right-5 bg-white rounded-full px-3 py-1.5 shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
              <span className="text-xs font-semibold text-brand-green">30 дни</span>
            </div>
            <div className="absolute bottom-10 left-0 md:left-5 bg-white rounded-full px-3 py-1.5 shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
              <span className="text-xs font-semibold text-gray-700">GMP сертификат</span>
            </div>
          </div>

          {/* Right - Benefits List */}
          <div className="order-1 lg:order-2 space-y-3 md:space-y-4">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-brand-green/5 rounded-xl md:rounded-2xl border border-gray-100 hover:border-brand-green/30 transition-all duration-300 reveal"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-green/20 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-gray-900 font-bold text-sm md:text-lg">{item.text}</p>
                  <p className="text-gray-500 text-xs md:text-sm">{item.sub}</p>
                </div>

                {/* Checkmark */}
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-brand-green/10 flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-green group-hover:text-white" />
                </div>
              </div>
            ))}

            {/* CTA Button */}
            <div className="pt-4 md:pt-6 reveal">
              <a
                href="https://shop.testograph.eu/products/testoup"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-emerald-600 hover:to-brand-green text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full transition-all duration-300 shadow-xl shadow-brand-green/30 hover:shadow-brand-green/50 hover:scale-105 text-base md:text-lg"
              >
                <span>ПОРЪЧАЙ TESTOUP</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
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
