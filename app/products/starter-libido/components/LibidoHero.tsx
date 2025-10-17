"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, TrendingUp, Users, Star, Shield } from "lucide-react";

export function LibidoHero() {
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

      {/* Enhanced Animated Background with SVG Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl animate-hero-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-3xl animate-hero-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 to-violet-500/10 rounded-full blur-3xl animate-hero-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* SVG Background Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hero-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hero-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hero-gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Flowing waves */}
          <path
            d="M -100 250 Q 300 180, 700 280 T 1500 220"
            stroke="url(#hero-gradient1)"
            strokeWidth="3"
            fill="none"
            className="animate-hero-drift"
          />

          <path
            d="M 1600 450 Q 1200 380, 800 480 T -100 420"
            stroke="url(#hero-gradient2)"
            strokeWidth="3"
            fill="none"
            className="animate-hero-drift-reverse"
          />

          <path
            d="M -50 650 Q 400 720, 800 620 T 1600 700"
            stroke="url(#hero-gradient3)"
            strokeWidth="2"
            fill="none"
            className="animate-hero-drift"
          />

          {/* Circles */}
          <circle
            cx="250"
            cy="350"
            r="120"
            stroke="url(#hero-gradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />

          <circle
            cx="1200"
            cy="600"
            r="140"
            stroke="url(#hero-gradient2)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Vertical wave */}
          <path
            d="M 800 -50 Q 750 300, 850 600 T 800 1000"
            stroke="url(#hero-gradient3)"
            strokeWidth="2"
            fill="none"
            className="animate-hero-float-slow"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className={`space-y-6 md:space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Trust Badge - Enhanced */}
            <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-full px-5 py-2.5 backdrop-blur-sm shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
              {/* Animated glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 relative z-10">
                3,247+ мъже го върнаха за под 30 дни
              </span>
            </div>

            {/* Headline - Enhanced & Mobile Optimized */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
              От 0 желание за секс
              <br />
              <span className="relative inline-block mt-1 sm:mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 animate-hero-pulse-glow">
                  до желание като преди за 21-30 дни
                </span>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-full shadow-lg blur-sm animate-pulse" />
                {/* Secondary underline for depth */}
                <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-600/50 rounded-full blur-md" />
              </span>
            </h1>

            {/* Subheadline - Mobile Optimized */}
            <div className="space-y-3 md:space-y-4">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Тя излиза от банята. Красива. Преди 3 години се случваше автоматично.
                Сега? Мозъкът казва "да". Тялото казва "не".
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Проблемът не е в главата. Проблемът е тестостеронът ти - спаднал с 40%.
              </p>
            </div>

            {/* CTAs - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4">
              <button
                onClick={() => scrollToSection('value-stack')}
                className="group relative px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 active:scale-95 sm:hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Покажи ми как работи за 30 дни →
                  <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                onClick={() => scrollToSection('testimonials')}
                className="px-6 sm:px-8 py-4 sm:py-5 border-2 border-primary/30 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm active:scale-95"
              >
                Как 3,247 мъже го върнаха за 30 дни
              </button>
            </div>

            {/* Stats Bar - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 md:pt-6 border-t-2 border-gradient-to-r from-primary/30 via-accent/30 to-primary/30">
              {[
                { icon: Users, label: "Мъже с резултати", value: "3,247+", gradient: "from-green-500 to-emerald-600", glowColor: "green-500/20" },
                { icon: Star, label: "Рейтинг", value: "4.8/5", gradient: "from-yellow-500 to-amber-600", glowColor: "yellow-500/20" },
                { icon: Shield, label: "Гаранция", value: "30 дни", gradient: "from-blue-500 to-indigo-600", glowColor: "blue-500/20" }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  {/* Glow effect */}
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

            {/* Trust Indicators - Enhanced */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {["Без рецепта", "Безплатна доставка", "Естествени съставки"].map((item, i) => (
                <div key={i} className="group flex items-center gap-2 hover:scale-105 transition-transform">
                  <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm" />
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 blur-3xl opacity-50" />

            {/* Main Image Container */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/30 hover:scale-105 transition-transform duration-700">
                <Image
                  src="/funnel/regular-offer-hero.webp"
                  alt="TestoUP product - Natural testosterone boost"
                  width={600}
                  height={600}
                  className="object-cover"
                  priority
                  quality={90}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Floating Stats Card 1 - Top Right - Mobile Optimized */}
              <div className="group absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 bg-card/95 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-2xl border-2 border-green-500/30 hover:scale-110 transition-all duration-300 hover:shadow-green-500/20 animate-hero-float-slow">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-xl md:rounded-2xl -z-10" />

                <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">+47%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold whitespace-nowrap">
                      Либидо за 30 дни
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Card 2 - Bottom Left - Mobile Optimized */}
              <div className="group absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-card/95 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-2xl border-2 border-primary/30 hover:scale-110 transition-all duration-300 hover:shadow-primary/20 animate-hero-float-slow" style={{ animationDelay: '0.5s' }}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-xl md:rounded-2xl -z-10" />

                <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">94%</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold whitespace-nowrap">
                      Успешни резултати
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Top Left - Mobile Optimized */}
              <div className="group absolute -top-2 -left-2 sm:-top-3 sm:-left-3 md:-top-4 md:-left-4 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white rounded-xl md:rounded-2xl px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 shadow-2xl rotate-[-8deg] hover:rotate-0 transition-all duration-300 hover:shadow-orange-500/50 animate-hero-pulse-glow border-2 border-white/20">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-xl md:rounded-2xl" />

                <div className="relative z-10">
                  <div className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wide drop-shadow">Спести</div>
                  <div className="text-base sm:text-lg md:text-2xl font-black drop-shadow-lg">245 лв</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
