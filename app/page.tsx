'use client'

import { useState, useEffect, useCallback } from "react";
import { Activity, Target, Shield, Sparkles, ChevronDown, Instagram, Facebook, Youtube, TrendingUp, Zap, Clock, FileText, CheckCircle2, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from 'embla-carousel-react';
import TForecastFormMultiStep from "@/components/TForecastFormMultiStep";
import ResultsDisplay from "@/components/ResultsDisplay";
import ChatAssistant from "@/components/ChatAssistant";
import { Features } from "@/components/ui/features-8";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { ScarcityBanner } from "@/components/ui/scarcity-banner";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { StatComparison } from "@/components/ui/stat-comparison";
import { ValueStack } from "@/components/ui/value-stack";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WaitingRoomFunnel } from "@/components/funnel/WaitingRoomFunnel";
import { LiveActivityNotifications } from "@/components/ui/LiveActivityNotifications";
import { SpotCounter } from "@/components/ui/SpotCounter";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ViberProofGrid } from "@/components/ui/ViberProof";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";

// Testimonials Carousel Component
const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const testimonials = [
    {
      name: "Мартин",
      age: 34,
      city: "София, IT специалист",
      quote: "Преди 6 месеца бях на дъното. Жена ми ме гледаше като брат, не като мъж. Testograph ми показа че тестостеронът ми е на 9.7. Сега съм на 23.2. Всичко се промени.",
      beforeStat: "9.7",
      afterStat: "23.2",
      statLabel: "Тестостерон (nmol/L)"
    },
    {
      name: "Георги",
      age: 41,
      city: "Пловдив, Архитект",
      quote: "Тренирах 5 пъти седмично. Нищо. Безплатният анализ ми показа че спя 5 часа и кортизолът ми убива тестостерона. 3 месеца по протокола - пробих плато от 2 години.",
      beforeStat: "120",
      afterStat: "180",
      statLabel: "Килограми на лост (кг)"
    },
    {
      name: "Емил",
      age: 48,
      city: "Варна, 20 г. женен",
      quote: "Разбрах, че проблемът е на път да разруши семейството ми. Срам, не срам, направих анализа. Най-доброто решение, което съм взел. Връзката ни се върна.",
      beforeStat: "2/10",
      afterStat: "9/10",
      statLabel: "Либидо скор"
    },
    {
      name: "Димитър",
      age: 37,
      city: "Бургас, Предприемач",
      quote: "Бизнесът ми отиваше добре, но аз бях мъртъв отвътре. Нулева енергия, нулева мотивация. PDF-ът ми показа че имам дефицит на витамин D и ниски нива на цинк. 2 месеца - съм друг човек.",
      beforeStat: "4/10",
      afterStat: "9/10",
      statLabel: "Енергия"
    },
    {
      name: "Стоян",
      age: 29,
      city: "Пловдив, Треньор",
      quote: "Мислех че съм млад и всичко е ОК. Оказа се тестостеронът ми е на 10.7. За 29 години? AI чатът ми обясни всичко - стрес, алкохол, лош сън. Сега съм на 20.1 и се чувствам ЖИВ.",
      beforeStat: "10.7",
      afterStat: "20.1",
      statLabel: "Тестостерон (nmol/L)"
    },
    {
      name: "Петър",
      age: 52,
      city: "Варна, Лекар",
      quote: "Иронията - аз съм лекар, но никога не си проверих хормоните. Тест показа ниски нива. Започнах протокола от PDF-а. За 3 месеца загубих 8кг мазнини и спечелих 4кг мускули. На 52 години!",
      beforeStat: "24%",
      afterStat: "16%",
      statLabel: "Телесни мазнини"
    }
  ];

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Carousel container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
              <TestimonialCard
                name={testimonial.name}
                age={testimonial.age}
                city={testimonial.city}
                quote={testimonial.quote}
                beforeStat={testimonial.beforeStat}
                afterStat={testimonial.afterStat}
                statLabel={testimonial.statLabel}
                verified={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>

        {/* Dots indicator */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
      </div>

      {/* Counter */}
      <p className="text-center mt-4 text-sm text-muted-foreground">
        {selectedIndex + 1} / {testimonials.length}
      </p>
    </div>
  );
};

const Index = () => {
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [showScarcityBanner, setShowScarcityBanner] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();

  // Show scarcity banner after scrolling down on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScarcityBanner(true);
      } else {
        setShowScarcityBanner(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleResult = (data: any) => {
    if (data.type === 'funnel') {
      // Trigger funnel flow
      setUserData(data.userData);
      setShowFunnel(true);
      setFormModalOpen(false);
      // Scroll to top when funnel starts
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Standard results display
      setResult(data);
      setShowResults(true);
      // Scroll to top when results are shown
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  const resetForm = () => {
    setResult(null);
    setShowResults(false);
    setShowFunnel(false);
    setUserData(null);
  };

  // If funnel should be shown, render only the funnel
  if (showFunnel) {
    return <WaitingRoomFunnel userData={userData} />;
  }
  return <div className="min-h-screen transition-none relative bg-gray-900">
      {/* Animated Purple Wave Background - Full Page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/40 to-purple-800/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/30 to-indigo-700/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-2"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-700/35 to-violet-600/35 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-4"></div>
          <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-gradient-to-tl from-purple-400/25 to-indigo-600/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-1"></div>
        </div>
        
        {/* Wave Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-800/10"></div>
      </div>
      {/* Floating Sticky Header */}
      <header className={`sticky top-4 z-50 relative transition-transform duration-300 ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4">
          <div className="bg-background/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 px-4 py-3 rounded-full backdrop-saturate-150">
            <div className="flex items-center justify-between gap-4">
              {/* Logo + Brand */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl">
                  <img src="/testograph-logo.png" alt="Testograph Logo" className="h-11 w-auto max-w-11 rounded-xl object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Testograph
                  </h1>
                  <p className="text-xs text-muted-foreground">Инструмент за оценка на тестостерон</p>
                </div>
              </div>

              {/* Social Proof Badge - Hidden on small screens */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-xs font-semibold text-primary">3,247+ мъже</span>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-2">
                {/* Trust Badge - Desktop only */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-semibold text-success">100% дискретно</span>
                </div>

                {/* CTA Button - Always visible */}
                {!showResults ? (
                  <button
                    onClick={() => setFormModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/30 hover:shadow-primary/50"
                  >
                    <span className="hidden sm:inline">Започни безплатен анализ</span>
                    <span className="sm:hidden">Анализ</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Нов анализ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width */}
      {!showResults && <section className="relative mb-8 -mt-4 min-h-[65vh] flex items-center">
          {/* Floating Images - Desktop Only */}
          <div className="hidden xl:block absolute inset-0 pointer-events-none">
            {/* Floating DNA/Molecule icons */}
            <div className="absolute top-20 left-10 w-8 h-8 opacity-20 animate-float">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-violet-600 rounded-full blur-sm"></div>
            </div>
            <div className="absolute top-40 right-16 w-6 h-6 opacity-30 animate-float-delay-1">
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 rounded-full blur-sm"></div>
            </div>
            <div className="absolute bottom-32 left-20 w-10 h-10 opacity-15 animate-float-delay-2">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-sm"></div>
            </div>
            <div className="absolute top-60 left-1/4 w-4 h-4 opacity-25 animate-float-delay-3">
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-sm"></div>
            </div>
            <div className="absolute bottom-48 right-1/4 w-7 h-7 opacity-20 animate-float">
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-400 rounded-full blur-sm"></div>
            </div>
            <div className="absolute top-32 right-1/3 w-5 h-5 opacity-35 animate-float-delay-2">
              <div className="w-full h-full bg-gradient-to-br from-purple-300 to-violet-700 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Grid Texture Background */}
          <div className="absolute inset-0">
            <div className="w-full h-full" style={{
          backgroundColor: 'transparent',
          backgroundImage: `
                  linear-gradient(
                    0deg,
                    transparent 24%,
                    hsl(var(--border) / 0.4) 25%,
                    hsl(var(--border) / 0.4) 26%,
                    transparent 27%,
                    transparent 74%,
                    hsl(var(--border) / 0.4) 75%,
                    hsl(var(--border) / 0.4) 76%,
                    transparent 77%,
                    transparent
                  ),
                  linear-gradient(
                    90deg,
                    transparent 24%,
                    hsl(var(--border) / 0.4) 25%,
                    hsl(var(--border) / 0.4) 26%,
                    transparent 27%,
                    transparent 74%,
                    hsl(var(--border) / 0.4) 75%,
                    hsl(var(--border) / 0.4) 76%,
                    transparent 77%,
                    transparent
                  )
                `,
          backgroundSize: '55px 55px',
          maskImage: `radial-gradient(ellipse at center, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(ellipse at center, black 30%, transparent 80%)`
        }} />
          </div>
          {/* Content Grid */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-[1200px] py-14 md:py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-8 xl:gap-10">
              {/* Left Content */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center h-full">
                {/* Badge - Lead Magnet Focus */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Безплатен доклад за теб
                </div>

                {/* Main Headline - TRANSFORMATION FOCUSED */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-white leading-[1.1]">
                  Върни се към мъжа,
                  <br />
                  който беше преди 10 години
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                    (за 2 минути + безплатно)
                  </span>
                </h1>

                {/* Sub-headline - Benefits focused */}
                <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                  Енергия. Сила. Либидо. Ментална острота. Разбери защо ги загуби и как да ги върнеш.
                </p>

                {/* Social Proof Numbers - Compact */}
                <div className="bg-card/30 backdrop-blur-sm border border-primary/20 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">3,247+</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Мъже</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">2 мин</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PDF</p>
                    </div>
                    <SpotCounter totalSpots={50} />
                  </div>
                </div>
              </div>

              {/* Right Content - Animated Visual Proof - Desktop Only */}
              <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 lg:justify-self-end w-full max-w-[360px] xl:max-w-[400px] items-center flex-col">
                <div className="relative w-full">
                  {/* Background Glow - Animated Continuously */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                  {/* Floating Particles */}
                  <div className="absolute top-10 -left-4 w-3 h-3 bg-success/40 rounded-full animate-float-particle-1"></div>
                  <div className="absolute top-20 -right-4 w-2 h-2 bg-primary/40 rounded-full animate-float-particle-2"></div>
                  <div className="absolute bottom-20 -left-3 w-2.5 h-2.5 bg-accent/40 rounded-full animate-float-particle-3"></div>

                  {/* Main Circular Comparison */}
                  <div className="relative aspect-square w-full">
                    {/* Split Circle Design - Animated entrance + hover effect */}
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl animate-fade-in hover:scale-105 transition-transform duration-500 hover:border-primary/50">
                      {/* Left Half - Before (Red) - Slide in from left + continuous subtle pulse */}
                      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-destructive/80 to-destructive/40 flex flex-col items-center justify-center animate-slide-in-left">
                        <p className="text-white/60 text-[10px] uppercase font-semibold mb-1 animate-fade-pulse">Преди</p>
                        <p className="text-white font-bold text-4xl animate-count-up">9.7</p>
                        <p className="text-white/80 text-[10px] mt-0.5">nmol/L</p>
                        <div className="mt-2 text-white/60 animate-pulse-slow">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Right Half - After (Green) - Slide in from right + glow pulse */}
                      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-bl from-success/80 to-success/40 flex flex-col items-center justify-center animate-slide-in-right">
                        <p className="text-white/60 text-[10px] uppercase font-semibold mb-1 animate-fade-pulse-delayed">След</p>
                        <p className="text-white font-bold text-4xl animate-count-up-delayed">23.2</p>
                        <p className="text-white/80 text-[10px] mt-0.5">nmol/L</p>
                        <div className="mt-2 text-white/80 animate-bounce-subtle">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Center Divider Line - Shimmer effect */}
                      <div className="absolute left-1/2 top-0 w-1 h-full bg-white/20 transform -translate-x-1/2 animate-fade-in-delay">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>

                      {/* Center Arrow - Enhanced pulsing + rotation hint */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-card rounded-full border-4 border-primary flex items-center justify-center shadow-xl z-10 animate-scale-pulse-glow">
                        <svg className="w-6 h-6 text-primary animate-arrow-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Label - Animated + glow */}
                    <div className="absolute -bottom-6 left-0 right-0 text-center animate-fade-in-up">
                      <p className="text-success font-bold text-xl drop-shadow-lg animate-glow-pulse">+139% подобрение</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button Below Circle */}
                <div className="w-full mt-12 text-center animate-fade-in-up-delay">
                  <button onClick={() => setFormModalOpen(true)} className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-green-500/40 w-full justify-center">
                    <Activity className="h-5 w-5" />
                    <span>Започни безплатния анализ</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Before/After Visual - Compact Version */}
            <div className="lg:hidden w-full max-w-sm mx-auto mt-8 animate-fade-in">
              <div className="relative bg-card/30 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-center flex-1">
                    <p className="text-xs text-white/60 uppercase font-semibold mb-2">Преди</p>
                    <p className="text-destructive font-bold text-4xl mb-1">9.7</p>
                    <p className="text-xs text-muted-foreground">nmol/L</p>
                  </div>
                  <div className="px-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-white/60 uppercase font-semibold mb-2">След</p>
                    <p className="text-success font-bold text-4xl mb-1">23.2</p>
                    <p className="text-xs text-muted-foreground">nmol/L</p>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-success font-bold text-xl">+139% подобрение</p>
                  <p className="text-xs text-muted-foreground mt-1">Реален резултат за 3 месеца</p>
                </div>
                <button onClick={() => setFormModalOpen(true)} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Започни безплатния анализ</span>
                </button>
              </div>
            </div>
          </div>
        </section>}

      <main className="container mx-auto px-4 md:px-6 py-4 max-w-[1200px] relative z-20">
        {!showResults ? <>
            {/* Scroll Down Arrow */}
            <div className="flex justify-center mb-4 -mt-8 animate-bounce-slow">
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => {
            const whatYouGetSection = document.querySelector('#what-you-get');
            whatYouGetSection?.scrollIntoView({
              behavior: 'smooth'
            });
          }}>
                <div className="p-3 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 group-hover:bg-purple-500/30 transition-all duration-300 group-hover:scale-110">
                  <ChevronDown className="h-6 w-6 text-purple-300 group-hover:text-purple-200" />
                </div>
              </div>
            </div>

            {/* What You Get - MOVED HERE FOR BETTER CONVERSION */}
            <section id="what-you-get" className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Какво получаваш{' '}
                    <span className="text-primary">безплатно</span>?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Само 4 въпроса. PDF на имейл. Готово за 2 минути.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* PDF Report Card */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl rounded-xl border border-primary/30 p-5 hover:border-primary/50 transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        PDF доклад
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Оценка на тестостерон + персонален анализ
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>2 минути на имейл</span>
                    </div>
                  </div>

                  {/* AI Chat Assistant Card */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-xl rounded-xl border border-accent/30 p-5 hover:border-accent/50 transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        AI Чат Асистент
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Експерт 24/7 - питай каквото искаш
                    </p>
                    <div className="flex items-center gap-2 text-xs text-accent font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Неограничени въпроси</span>
                    </div>
                  </div>

                  {/* Personalized Action Plan */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-success/5 backdrop-blur-xl rounded-xl border border-success/30 p-5 hover:border-success/50 transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        7-дневен план
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Храна, тренировки, навици - ден по ден
                    </p>
                    <div className="flex items-center gap-2 text-xs text-success font-medium">
                      <Target className="w-3.5 h-3.5" />
                      <span>Готов от утре</span>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-muted/5 backdrop-blur-xl rounded-xl border border-border/50 p-5 hover:border-border transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        100% Дискретно
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Криптирани данни - никой няма да научи
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Без спам</span>
                    </div>
                  </div>
                </div>

                {/* CTA to Form */}
                <div className="mt-12 text-center">
                  <p className="text-muted-foreground mb-6">
                    Готов си? Започни сега и получи доклада си за 2 минути 👇
                  </p>
                  <button onClick={() => {
                    const formSection = document.getElementById('assessment-form');
                    formSection?.scrollIntoView({
                      behavior: 'smooth'
                    });
                  }} className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/30">
                    <Activity className="h-6 w-6" />
                    <span>Започни безплатния анализ</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
            </section>

            {/* Stats Visualization - Before/After - CONDENSED */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Реални резултати.{' '}
                  <span className="text-primary">Не маркетинг приказки.</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Вижте какво се случва когато следваш протокола
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <StatComparison
                  label="Тестостерон"
                  beforeValue={9.7}
                  afterValue={23.2}
                  unit=" nmol/L"
                  normalRange="8.6-29"
                  isHigherBetter={true}
                  maxValue={35}
                />
                <StatComparison
                  label="Либидо скор"
                  beforeValue={2}
                  afterValue={9}
                  unit="/10"
                  normalRange="7-10"
                  isHigherBetter={true}
                  maxValue={10}
                />
              </div>
            </section>

            {/* Success Stories Wall */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Реални трансформации.{' '}
                  <span className="text-primary">Реални резултати.</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Естествени промени. Без химия. Само протокол.
                </p>
              </div>
              <SuccessStoriesWall />
            </section>

            {/* Social Proof - Testimonials Carousel */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Не вярваш?{' '}
                  <span className="text-primary">Ето доказателствата.</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Реални хора. Реални резултати. Реални истории.
                </p>
              </div>

              <TestimonialsCarousel />

            </section>

            {/* Viber Chat Proofs Section */}
            <section className="mb-20 w-full max-w-full overflow-hidden">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Какво си пишат{' '}
                  <span className="text-primary">нашите клиенти</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Реални разговори. Реални резултати. Без филтри.
                </p>
              </div>

              <ViberProofGrid />
            </section>

            {/* Assessment Form - MOVED HERE - After Testimonials */}
            <section id="assessment-form" className="mb-20">
              {/* Countdown Timer */}
              <div className="flex justify-center mb-8">
                <div className="bg-card/40 backdrop-blur-sm border border-destructive/30 rounded-xl px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Офертата изтича след:</span>
                    <CountdownTimer size="large" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full mb-3">
                  <FileText className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-semibold text-success uppercase tracking-wide">
                    Безплатен PDF
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-bold mb-3">
                  Отговори на{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                    4 прости въпроса
                  </span>
                </h2>

                <p className="text-base text-muted-foreground mb-5">
                  Получи анализ на имейл + достъп до AI асистент
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">2 мин</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-muted-foreground">Безплатно</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-muted-foreground">PDF веднага</span>
                  </div>
                </div>
              </div>

              <TForecastFormMultiStep onResult={handleResult} />
            </section>

            {/* Problem Agitation Section - MOVED AFTER FORM */}
            <section className="mb-20">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                      Познати симптоми?
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                    Разбираме <span className="text-primary">какво преживяваш</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Ако поне 2 от тези ти звучат познато, нивата на тестостерон може да са причината.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Bullet 1 - Performance */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border-2 border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Прогресът в залата спря</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Тренираш редовно, но резултатите просто не идват. Силата и мускулната маса са на едно място от месеци.
                    </p>
                  </div>

                  {/* Bullet 2 - Energy */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border-2 border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] shadow-xl">
                    <div className="absolute top-4 right-4 text-5xl opacity-5 group-hover:opacity-10 transition-opacity">😴</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Енергията е ниска</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Сутринта се будиш уморен. През деня енергията ти е ниска. Кафето помага само за кратко време.
                    </p>
                  </div>

                  {/* Bullet 3 - Libido */}
                  <div className="group relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border-2 border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] shadow-xl">
                    <div className="absolute top-4 right-4 text-5xl opacity-5 group-hover:opacity-10 transition-opacity">💜</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Интимността отслабна</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Либидото ти намаля. Интересът към интимност вече не е какъвто беше преди няколко години.
                    </p>
                  </div>
                </div>

                {/* Empathy + CTA */}
                <div className="mt-16 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/30 p-10 text-center shadow-2xl">
                  <p className="text-2xl md:text-3xl text-foreground font-bold mb-4">
                    Добрата новина? <span className="text-primary">Има решение</span>.
                  </p>
                  <p className="text-lg text-muted-foreground mb-2">
                    Нивата на тестостерон естествено спадат с възрастта - с 1-2% годишно след 30.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    Но с правилния подход можеш да направиш нещо по въпроса.
                  </p>

                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
                    <p className="text-primary font-bold text-xl mb-2">💡 Първата стъпка</p>
                    <p className="text-foreground">
                      Разбери къде си точно сега. Нашият безплатен анализ ще ти даде ясна картина
                      <br />
                      за нивата ти на тестостерон + персонални препоръки.
                    </p>
                  </div>

                  <button onClick={() => {
                    const formSection = document.getElementById('assessment-form');
                    formSection?.scrollIntoView({
                      behavior: 'smooth'
                    });
                  }} className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold text-xl rounded-full transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/30">
                    <Activity className="h-7 w-7 group-hover:scale-110 transition-transform" />
                    <span>Получи безплатния анализ сега</span>
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <p className="mt-6 text-sm text-muted-foreground">
                    ✓ 100% Безплатно • ✓ Само 2 минути • ✓ PDF на имейл веднага
                  </p>
                </div>
            </section>

            {/* FAQ Section - CONDENSED */}
            <section className="mt-20 mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Въпроси, които вероятно имаш
              </h2>

              <div className="space-y-4">
                  {/* FAQ Item 1 */}
                  <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                    <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                      <span className="text-lg font-medium text-foreground">
                        Наистина ли е безплатно?
                      </span>
                      <svg className="w-5 h-5 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      Да, 100%. Не искаме кредитна карта, няма скрити такси. Безплатният доклад е нашата инвестиция в теб. Точка.
                    </div>
                  </details>

                  {/* FAQ Item 2 */}
                  <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                    <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                      <span className="text-lg font-medium text-foreground">
                        Колко време ще ми отнеме?
                      </span>
                      <svg className="w-5 h-5 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      Буквално минута и половина за 4-те въпроса. Докладът пристига на имейла ти веднага след това.
                    </div>
                  </details>

                  {/* FAQ Item 3 */}
                  <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                    <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                      <span className="text-lg font-medium text-foreground">
                        Дискретно ли е? Никой няма да разбере?
                      </span>
                      <svg className="w-5 h-5 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      Абсолютно. Данните ти са криптирани. Дори ако поръчаш нещо след това, доставката идва в неутрална опаковка. Никой няма да научи.
                    </div>
                  </details>

                  {/* FAQ Item 4 */}
                  <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                    <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                      <span className="text-lg font-medium text-foreground">
                        Какво точно ще науча от доклада?
                      </span>
                      <svg className="w-5 h-5 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      Текущото ти ниво на тестостерон, защо имаш симптомите които описваш, и персонализиран план какво да направиш по въпроса.
                    </div>
                  </details>
                </div>
            </section>
          </> : (/* Results Section */
      <section>
            <ResultsDisplay result={result} />
          </section>)}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 pb-20 relative z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            {/* Social Media Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-foreground mb-3">Последвай ни в социалните мрежи</h3>
              <div className="flex justify-center gap-6">
                <a href="https://www.instagram.com/testograph.eu/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-200 hover:scale-110" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61581045640912" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-200 hover:scale-110" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@testograph.eu" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-200 hover:scale-110" aria-label="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@testograph" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-200 hover:scale-110" aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="mb-4 flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Политика за поверителност
              </Link>
              <span className="text-border">|</span>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Политика за бисквитки
              </Link>
              <span className="text-border">|</span>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Общи условия
              </Link>
            </div>

            <p className="mb-2">Testograph © 2025. Образователен инструмент за оценка на тестостерон.</p>
            <p>
              Не е предназначен като медицински съвет. Консултирайте се с медицински специалисти за медицинско ръководство.
            </p>
          </div>
        </div>
      </footer>

      {/* Scarcity Banner - Sticky at bottom, shows before form submission */}
      {/* On mobile: appears after scroll with animation. On desktop: always visible */}
      {!showResults && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ${
          showScarcityBanner ? 'translate-y-0' : 'lg:translate-y-0 translate-y-full'
        }`}>
          <ScarcityBanner />
        </div>
      )}

      {/* Live Activity Notifications */}
      {!showResults && <LiveActivityNotifications />}

      {/* Chat Assistant */}
      <ChatAssistant />

      {/* Modal Form Dialog */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Безплатен тестостерон анализ - 4 въпроса
            </DialogTitle>
          </DialogHeader>
          <TForecastFormMultiStep onResult={handleResult} />
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;