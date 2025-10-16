"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Clock, TrendingUp, Zap } from "lucide-react";
import { useCountdownTimer } from "@/lib/useCountdownTimer";
import Image from "next/image";

interface ValueStackItem {
  name: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  isBonus?: boolean;
}

interface ValueStackGridProps {
  items: ValueStackItem[];
  totalValue: number;
  discountedPrice: number;
  savings: number;
  spotsLeft?: number;
  tier?: string;
}

export function ValueStackGrid({
  items,
  totalValue,
  discountedPrice,
  savings,
  spotsLeft = 12,
  tier = "regular"
}: ValueStackGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [priceRevealed, setPriceRevealed] = useState(false);
  const timeLeft = useCountdownTimer();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setPriceRevealed(true), 800);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById("value-stack");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const coreItems = items.filter((item) => !item.isBonus);
  const bonusItems = items.filter((item) => item.isBonus);
  const perDayCost = (discountedPrice / 30).toFixed(2);

  const scrollToCheckout = () => {
    const element = document.getElementById("final-cta");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      id="value-stack"
      className="relative py-16 md:py-24 px-4 overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Countdown Timer - Urgent */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white p-6 md:p-8 rounded-2xl border-4 border-red-400/50 shadow-2xl overflow-hidden">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ animationDuration: '2s' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 md:gap-3">
                <Clock className="w-6 h-6 md:w-8 md:h-8 animate-bounce" />
                <span className="text-lg md:text-2xl font-black uppercase tracking-tight">
                  Офертата изтича след:
                </span>
              </div>

              {/* Countdown boxes */}
              <div className="flex gap-2 md:gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[56px] md:min-w-[70px] text-center border-2 border-white/30">
                  <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase font-bold mt-1">Часа</div>
                </div>
                <span className="text-2xl md:text-4xl font-black self-center">:</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[56px] md:min-w-[70px] text-center border-2 border-white/30">
                  <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase font-bold mt-1">Мин</div>
                </div>
                <span className="text-2xl md:text-4xl font-black self-center">:</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 min-w-[56px] md:min-w-[70px] text-center border-2 border-white/30">
                  <div className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase font-bold mt-1">Сек</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 bg-orange-500/10 border-2 border-orange-500/30 rounded-full px-5 py-2 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-sm font-bold text-orange-500">
              Само {spotsLeft} места останаха днес
            </span>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-black transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Какво получаваш в{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              СТАРТ пакета?
            </span>
          </h2>
        </div>

        {/* Product Hero Section with Split Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Product Visualization - Full STARTER Pack */}
          <div className="flex justify-center md:justify-end">
            <div
              className={`relative transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 -rotate-6"
              }`}
            >
              {/* Glow Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl opacity-50 animate-pulse" />

              {/* STARTER Pack Image */}
              <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] z-10">
                <Image
                  src="/product/STARTER .webp"
                  alt="СТАРТ пакет - Пълен комплект"
                  fill
                  className="object-contain drop-shadow-2xl filter hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-2xl animate-bounce z-20">
                <div className="text-center">
                  <div className="text-2xl font-black">СТАРТ</div>
                  <div className="text-xs uppercase">Пакет</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-2xl z-20">
                Всичко в едно
              </div>
            </div>
          </div>

          {/* Right: Quick Benefits */}
          <div
            className={`space-y-4 transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Клинични дозировки</h4>
                  <p className="text-sm text-muted-foreground">Всяка съставка в доказана ефективна доза</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Произведено в ЕС</h4>
                  <p className="text-sm text-muted-foreground">GMP сертифициран производител</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Без скрити смеси</h4>
                  <p className="text-sm text-muted-foreground">100% прозрачност на всички съставки</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Items Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {coreItems.map((item, index) => {
            // First item gets special product visualization
            const isFirstItem = index === 0;

            return (
              <div
                key={index}
                className={`group relative bg-card/50 backdrop-blur-sm border-2 ${
                  isFirstItem ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5' : 'border-border/50'
                } rounded-2xl p-6 hover:border-primary/50 hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                {/* Highlight Badge */}
                {item.highlight && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-black px-4 py-2 rounded-full shadow-lg rotate-6 group-hover:rotate-0 transition-transform">
                    ВКЛЮЧЕНО
                  </div>
                )}

                {/* Special treatment for first item (product) */}
                {isFirstItem ? (
                  <div className="relative mb-4">
                    <div className="w-full h-32 relative">
                      <Image
                        src="/product/testoup-bottle_v1.webp"
                        alt="TestoUP"
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* Icon for other items */
                  <div className="w-16 h-16 mb-4 text-5xl flex items-center justify-center bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 leading-tight">
                  {item.name}
                </h3>

                {/* Value */}
                <div className="mb-3">
                  {typeof item.value === "number" ? (
                    <span className="text-2xl font-black text-primary">
                      {item.value} лв
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-green-500">
                      {item.value}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Checkmark */}
                <div className="absolute bottom-6 right-6 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <Check className="w-5 h-5 text-green-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bonus Section */}
        {bonusItems.length > 0 && (
          <div
            className={`relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/30 rounded-3xl p-8 mb-8 overflow-hidden transition-all duration-700 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Sparkle Animation */}
            <div className="absolute top-6 right-6">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-black text-yellow-600 uppercase tracking-wide">
                  Специални бонуси
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black">
                + Получаваш безплатно:
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {bonusItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-yellow-500/50 transition-all hover:scale-105"
                >
                  <div className="text-3xl flex-shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1 text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    {typeof item.value === "number" && (
                      <span className="text-sm font-black text-yellow-600">
                        Стойност: {item.value} лв
                      </span>
                    )}
                  </div>
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Reveal Section */}
        <div
          className={`relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-2 border-primary/30 rounded-3xl p-8 md:p-12 text-center overflow-hidden transition-all duration-700 delay-900 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient" />

          <div className="relative z-10">
            {/* Total Value */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Обща стойност на всичко
              </p>
              <div className="text-4xl md:text-5xl font-black text-muted-foreground line-through decoration-red-500 decoration-4">
                {totalValue} лв
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <TrendingUp className="w-6 h-6 text-primary" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Special Price */}
            <div className="mb-6">
              <p className="text-lg md:text-xl text-muted-foreground mb-3">
                Твоята цена днес:
              </p>
              <div
                className={`transition-all duration-1000 ${
                  priceRevealed
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-50"
                }`}
              >
                <div className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mb-4">
                  {discountedPrice} лв
                </div>
                <div className="inline-flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 rounded-full px-6 py-3 mb-4">
                  <span className="text-xl md:text-2xl font-black text-red-500">
                    Спестяваш {savings} лв
                  </span>
                </div>
              </div>
            </div>

            {/* Per Day Cost */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                Това са само:
              </p>
              <div className="text-2xl md:text-3xl font-bold">
                {perDayCost} лв на ден
                <span className="text-muted-foreground ml-2">
                  (цената на едно кафе)
                </span>
              </div>
            </div>

            {/* CTA Button with Product */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Small product image next to CTA */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 hidden md:block">
                <Image
                  src="/product/testoup-bottle.webp"
                  alt="TestoUP"
                  fill
                  className="object-contain drop-shadow-2xl animate-float"
                />
              </div>

              <button
                onClick={scrollToCheckout}
                className="group relative w-full md:w-auto px-12 py-6 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Вземи СТАРТ пакета за {discountedPrice} лв
                  <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Trust Badges - Redesigned */}
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  "Безплатна доставка над 100 лв",
                  "Експертна поддръжка 24/7",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                * 30-дневна гаранция при следване на протокола
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
