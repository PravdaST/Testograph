"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, Users, Star, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { skepticCopy } from "../copy/skeptic-copy";

export function SkepticHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background py-12 md:py-16 lg:py-24 xl:py-32 px-4 sm:px-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes hero-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(40px) translateY(-30px); }
        }
        @keyframes hero-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-40px) translateY(30px); }
        }
        @keyframes hero-float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-35px) scale(1.05); }
        }
        @keyframes hero-pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-hero-drift { animation: hero-drift 30s ease-in-out infinite; }
        .animate-hero-drift-reverse { animation: hero-drift-reverse 35s ease-in-out infinite; }
        .animate-hero-float-slow { animation: hero-float-slow 20s ease-in-out infinite; }
        .animate-hero-pulse-glow { animation: hero-pulse-glow 4s ease-in-out infinite; }
      `}} />

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Orbs - Professional colors */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 rounded-full blur-3xl animate-hero-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-teal-500/15 to-cyan-500/10 rounded-full blur-3xl animate-hero-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-slate-500/10 to-gray-500/8 rounded-full blur-3xl animate-hero-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* SVG Background Lines - Professional */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hero-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hero-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(100, 116, 139)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(71, 85, 105)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Flowing data waves */}
          <path
            d="M -100 250 Q 300 180, 700 280 T 1500 220"
            stroke="url(#hero-gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-hero-drift"
          />

          <path
            d="M 1600 450 Q 1200 380, 800 480 T -100 420"
            stroke="url(#hero-gradient2)"
            strokeWidth="2"
            fill="none"
            className="animate-hero-drift-reverse"
          />

          {/* Data points */}
          <circle cx="250" cy="350" r="3" fill="url(#hero-gradient1)" className="animate-pulse" />
          <circle cx="1200" cy="600" r="3" fill="url(#hero-gradient2)" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className={`space-y-6 md:space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Pre-Headline Badge */}
            <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-slate-500/10 to-gray-500/10 border-2 border-slate-400/30 rounded-full px-5 py-2.5 backdrop-blur-sm shadow-lg hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-slate-500 rounded-full" />
              </div>
              <span className="text-sm md:text-base font-bold text-muted-foreground relative z-10">
                {skepticCopy.hero.preHeadline}
              </span>
            </div>

            {/* Headline - Skeptic Angle */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="text-foreground">
                99% от Тестостероновите Добавки
              </span>
              <br />
              <span className="relative inline-block mt-1 sm:mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-600">
                  Са Загуба на Пари
                </span>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-600 rounded-full shadow-lg blur-sm" />
              </span>
              <br />
              <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 block">
                Прав Си Да Си Скептичен.
              </span>
            </h1>

            {/* Subheadline */}
            <div className="space-y-3 md:space-y-4">
              <p className="text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed font-semibold">
                Ето защо ние направихме обратното на "магическо хапче":
              </p>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                <span className="text-teal-600 dark:text-teal-400 font-bold">80% научно доказани протоколи</span>
                {" + "}
                <span className="text-blue-600 dark:text-blue-400 font-bold">20% калибрирана добавка</span>
                {" = "}
                <span className="text-green-600 dark:text-green-400 font-bold">Пълна система</span>
              </p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                Не магия. Система. Не обещания. Протоколи.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4">
              <button
                onClick={() => scrollToSection('value-stack')}
                className="group relative px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 active:scale-95 sm:hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {skepticCopy.hero.ctaPrimary}
                  <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                onClick={() => scrollToSection('proof')}
                className="px-6 sm:px-8 py-4 sm:py-5 border-2 border-slate-400/30 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-slate-500/5 hover:border-slate-400/50 transition-all duration-300 backdrop-blur-sm active:scale-95"
              >
                {skepticCopy.hero.ctaSecondary}
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 md:pt-6 border-t-2 border-gradient-to-r from-slate-400/30 via-teal-400/30 to-slate-400/30">
              {[
                { icon: Users, label: "Бивши скептици", value: "987", gradient: "from-teal-500 to-cyan-600", glowColor: "teal-500/20" },
                { icon: TrendingUp, label: "Успеваемост", value: "94%", gradient: "from-green-500 to-emerald-600", glowColor: "green-500/20" },
                { icon: Shield, label: "Гаранция", value: "30 дни", gradient: "from-blue-500 to-indigo-600", glowColor: "blue-500/20" }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${stat.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-xl -z-10`} />

                  <div className="relative space-y-1.5 sm:space-y-2 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-card/50 to-card/30 border border-border/50 backdrop-blur-sm hover:scale-105 hover:shadow-xl transition-all duration-300">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {skepticCopy.hero.trustIndicators.map((item, i) => (
                <div key={i} className="group flex items-center gap-2 hover:scale-105 transition-transform">
                  <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 shadow-sm" />
                    <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 80/20 Visual Comparison */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-blue-500/20 blur-3xl opacity-50" />

            {/* Main Comparison Card */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/30 p-6 md:p-8 space-y-6">

                {/* Failed Approach (Crossed Out) */}
                <div className="relative opacity-60">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-red-500 rounded-full rotate-[-15deg] shadow-lg"></div>
                  </div>
                  <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-6 h-6 text-red-500" />
                      <h3 className="font-black text-lg text-red-600 dark:text-red-400">Типична Добавка</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      100% добавка + 0% протоколи
                    </p>
                    <div className="h-3 bg-red-500/20 rounded-full overflow-hidden">
                      <div className="h-full w-[20%] bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      = 20-50 ng/dL макс.
                    </p>
                  </div>
                </div>

                {/* Success Approach (Highlighted) */}
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-1 text-sm font-black shadow-lg animate-pulse">
                    94% Успех
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border-2 border-teal-500/50 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-teal-500" />
                      <h3 className="font-black text-lg text-teal-600 dark:text-teal-400">TESTOGRAPH Система</h3>
                    </div>

                    {/* 80% Protocols */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">80% Протоколи</p>
                        <p className="text-xs font-mono text-teal-600 dark:text-teal-400">+420 ng/dL</p>
                      </div>
                      <div className="h-4 bg-teal-500/20 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* 20% Supplement */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">20% Добавка</p>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400">+50 ng/dL</p>
                      </div>
                      <div className="h-4 bg-blue-500/20 rounded-full overflow-hidden">
                        <div className="h-full w-[20%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Total Result */}
                    <div className="pt-3 border-t-2 border-teal-500/30">
                      <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                        = 450-500 ng/dL boost
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Устойчиви, измерими резултати
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proof Badge */}
                <div className="text-center pt-2">
                  <p className="text-sm font-bold text-muted-foreground">
                    987 мъже тествахме системата
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Star className="w-3 h-3 inline fill-yellow-500 text-yellow-500" /> 4.8/5 рейтинг | &lt;6% refund rate
                  </p>
                </div>
              </div>

              {/* Floating Discount Badge */}
              <div className="group absolute -top-4 -left-4 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white rounded-xl md:rounded-2xl px-4 py-2 sm:px-5 sm:py-3 shadow-2xl rotate-[-8deg] hover:rotate-0 transition-all duration-300 hover:shadow-orange-500/50 border-2 border-white/20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-xl md:rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-xs font-black uppercase tracking-wide drop-shadow">Спести</div>
                  <div className="text-xl sm:text-2xl font-black drop-shadow-lg">147 лв</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
