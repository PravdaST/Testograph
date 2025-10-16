"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Clock, TrendingUp, Zap } from "lucide-react";

interface ValueStackItem {
  name: string;
  value: number | string;
  description: string;
  icon: string;
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
            className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Какво получаваш в{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              СТАРТ пакета?
            </span>
          </h2>

          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Всичко което ти трябва за да върнеш либидото си за 30 дни.
          </p>
        </div>

        {/* Core Items Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {coreItems.map((item, index) => (
            <div
              key={index}
              className={`group relative bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-6 hover:border-primary/50 hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 ${
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

              {/* Icon */}
              <div className="w-16 h-16 mb-4 text-5xl flex items-center justify-center bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

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
          ))}
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

            {/* CTA Button */}
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

            {/* Trust Line */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {[
                "Безплатна доставка над 100 лв",
                "30-дневна гаранция",
                "Експертна поддръжка 24/7",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Urgency Footer */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                <Clock className="inline w-4 h-4 mr-2 text-orange-500" />
                Само <span className="font-bold text-orange-500">{spotsLeft} места</span> останаха на тази цена днес
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
