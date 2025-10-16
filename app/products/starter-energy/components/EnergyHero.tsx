"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, TrendingUp, Users, Star, Shield, Zap, Coffee } from "lucide-react";

export function EnergyHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background py-16 md:py-24 lg:py-32 px-4">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-green-500/10 border-2 border-green-500/30 rounded-full px-5 py-2.5 backdrop-blur-sm">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-sm md:text-base font-bold text-green-400">
                1,450+ мъже се събудиха от енергийния кошмар
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
              От зомби в 7 сутринта
              <br />
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500">
                  до 5км бягане преди работа.
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-full blur-sm" />
              </span>
            </h1>

            {/* Subheadline */}
            <div className="space-y-4">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Будилникът. Снуз. Още 10 минути. 3 кафета до обяд. Заспиваш на бюрото. Вкъщи си мъртъв.
              </p>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                Децата питат "тате защо винаги си уморен?"
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => scrollToSection('value-stack')}
                className="group relative px-8 py-5 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Виж как работи
                  <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button
                onClick={() => scrollToSection('testimonials')}
                className="px-8 py-5 border-2 border-yellow-500/30 rounded-2xl font-semibold text-lg hover:bg-yellow-500/5 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                Прочети истории
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/50">
              {[
                { icon: Users, label: "Доволни клиенти", value: "1,450+", color: "text-green-500" },
                { icon: Star, label: "Средна оценка", value: "4.8/5", color: "text-yellow-500" },
                { icon: Shield, label: "Гаранция", value: "30 дни", color: "text-blue-500" }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="space-y-2 group hover:scale-105 transition-transform"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-2xl md:text-3xl font-black text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
              {["Без рецепта", "Безплатна доставка", "Естествени съставки"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 via-transparent to-orange-500/30 blur-3xl opacity-50" />

            {/* Main Image Container */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/30 hover:scale-105 transition-transform duration-700">
                <Image
                  src="/funnel/regular-offer-hero.webp"
                  alt="TestoUP product - Natural energy boost"
                  width={600}
                  height={600}
                  className="object-cover"
                  priority
                  quality={90}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Floating Stats Card 1 - Top Right */}
              <div className="absolute -top-6 -right-6 bg-card/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-yellow-500/30 hover:scale-110 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-yellow-500">+68%</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Енергия за 14 дни
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Card 2 - Bottom Left */}
              <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-orange-500/30 hover:scale-110 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-orange-500">-75%</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      По-малко кафе
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Top Left */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl px-6 py-3 shadow-2xl rotate-[-8deg] hover:rotate-0 transition-transform">
                <div className="text-xs font-black uppercase tracking-wide">Спести</div>
                <div className="text-2xl font-black">245 лв</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
