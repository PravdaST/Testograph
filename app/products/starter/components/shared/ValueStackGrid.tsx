"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Clock } from "lucide-react";
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
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

  const bonusItems = items.filter((item) => item.isBonus);

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

        {/* Product Hero Section - Mobile Friendly */}
        <div className="mb-16 space-y-8">
          {/* Product Visualization - Full STARTER Pack - Centered on Mobile */}
          <div className="flex justify-center">
            <div
              className={`relative transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 -rotate-6"
              }`}
            >
              {/* Glow Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl opacity-50 animate-pulse" />

              {/* STARTER Pack Image */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] z-10">
                <Image
                  src="/product/STARTER.webp"
                  alt="СТАРТ пакет - Пълен комплект"
                  fill
                  className="object-contain drop-shadow-2xl filter hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black shadow-2xl animate-bounce z-20">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-black">СТАРТ</div>
                  <div className="text-[10px] sm:text-xs uppercase">Пакет</div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black shadow-2xl z-20">
                Всичко в едно
              </div>
            </div>
          </div>

          {/* Package Contents Preview - Vertical Stack on Mobile */}
          <div
            className={`space-y-4 max-w-2xl mx-auto transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* TestoUP Product */}
            <div className="relative bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-4 sm:p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-primary to-accent text-white text-[10px] sm:text-xs font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                ВКЛЮЧЕНО
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                  <Image
                    src="/product/testoup-bottle_v1.webp"
                    alt="TestoUP"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base sm:text-lg mb-1">TestoUP бутилка</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">60 капсули за 30 дни</p>
                </div>
              </div>
            </div>

            {/* TestographPRO Protocol */}
            <div className="relative bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-4 sm:p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-primary to-accent text-white text-[10px] sm:text-xs font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                ВКЛЮЧЕНО
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                  <Image
                    src="/product/STARTER - TestographPRO.webp"
                    alt="TestographPRO"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base sm:text-lg mb-1">TestographPRO протокол</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">30-дневен план за резултати</p>
                </div>
              </div>
            </div>

            {/* 24/7 Expert Support */}
            <div className="relative bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-4 sm:p-6 hover:border-primary/60 transition-all hover:scale-105">
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-primary to-accent text-white text-[10px] sm:text-xs font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                ВКЛЮЧЕНО
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base sm:text-lg mb-1">24/7 Хормонален Експерт</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Винаги до теб с отговори</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Section */}
        <div className="text-center px-4">
          <button
            onClick={scrollToCheckout}
            className="group relative w-full md:w-auto px-8 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-2xl font-black text-lg sm:text-xl md:text-2xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              <span className="leading-tight">Вземи СТАРТ пакета за {discountedPrice} лв</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Безплатна доставка над 100 лв</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Експертна поддръжка 24/7</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * 30-дневна гаранция при следване на протокола
          </p>
        </div>
      </div>
    </section>
  );
}
