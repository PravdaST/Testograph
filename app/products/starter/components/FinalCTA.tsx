"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, Truck, CheckCircle } from "lucide-react";
import Image from "next/image";

export function FinalCTA() {
  const [spotsLeft, setSpotsLeft] = useState(12);
  const [timeLeft, setTimeLeft] = useState(14400);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 14400 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCTAClick = () => {
    window.location.href = "https://shop.testograph.eu/cart/58692129620317:1";
  };

  return (
    <section id="final-cta" className="py-8 md:py-12 lg:py-16 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto">
        {/* Urgency Banner - Mobile Optimized */}
        <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl md:rounded-2xl p-3 md:p-5 mb-6 md:mb-10 text-white text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm md:text-base lg:text-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              <p className="font-black tracking-tight">
                ОФЕРТАТА ИЗТИЧА СЛЕД: {formatTime(timeLeft)}
              </p>
            </div>
            <span className="hidden md:inline">•</span>
            <p className="font-black tracking-tight">
              САМО {spotsLeft} ПАКЕТА ОСТАНАЛИ
            </p>
          </div>
        </div>

        {/* Main CTA Card - Mobile Optimized */}
        <div className="relative bg-gradient-to-br from-card via-card to-card/80 rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12 shadow-2xl border-2 border-primary/30 overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-violet-500/10 to-primary/10 rounded-full blur-3xl -z-10" />

          {/* Headline - Mobile Optimized */}
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text px-2">
              Готов си? Вземи СТАРТ пакета сега и започни утре
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-2">
              Всичко от което се нуждаеш в един пакет
            </p>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 items-center mb-6 md:mb-10">
            {/* Product Image - Mobile Friendly */}
            <div className="relative flex items-center justify-center w-full h-[280px] sm:h-[320px] md:min-h-[500px] lg:min-h-[600px]">
              {/* Product glow effect - Scaled for mobile */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-purple-500/40 via-violet-500/40 to-fuchsia-500/40 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
                <div className="absolute w-[220px] h-[220px] sm:w-[270px] sm:h-[270px] md:w-[350px] md:h-[350px] lg:w-[450px] lg:h-[450px] bg-gradient-to-tr from-primary/30 via-accent/30 to-violet-600/30 rounded-full blur-[50px] md:blur-[80px]" />
              </div>
              <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px]">
                <Image
                  src="/product/STARTER.webp"
                  alt="СТАРТ пакет"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Pricing & CTA - Mobile Optimized */}
            <div className="space-y-4 md:space-y-6 w-full">
              {/* Price - Mobile Friendly */}
              <div className="relative bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl md:rounded-2xl p-5 md:p-8 border-2 border-primary/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-baseline justify-center gap-2 md:gap-3 mb-3 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">97</span>
                      <span className="text-2xl sm:text-3xl font-bold">лв</span>
                    </div>
                    <p className="line-through text-xl sm:text-2xl md:text-3xl text-muted-foreground font-bold">264 лв</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 md:px-4 py-1.5 md:py-2 mx-auto w-fit">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-600 font-black text-base md:text-lg">
                      Спести 167 лв днес
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits - Compact on Mobile */}
              <div className="space-y-2 md:space-y-3">
                {[
                  "Безплатна доставка над 100 лв",
                  "Плащане при доставка",
                  "30-дневна гаранция",
                  "24/7 поддръжка",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3 bg-muted/30 rounded-lg p-2.5 md:p-3 border border-border/50">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm md:text-base font-semibold">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Prominent on Mobile */}
              <Button
                onClick={handleCTAClick}
                className="w-full text-lg sm:text-xl md:text-2xl py-6 md:py-7 lg:py-8 bg-gradient-to-r from-primary via-violet-600 to-primary hover:from-primary/90 hover:via-violet-600/90 hover:to-primary/90 text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 rounded-xl relative overflow-hidden group"
              >
                <span className="relative z-10 leading-tight">Поръчай СТАРТ пакет за 97 лв →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </Button>

              {/* Trust Badges - Mobile Friendly */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <span className="font-semibold">SSL Secure</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <span className="font-semibold">30-day guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Purchases - Mobile Friendly */}
          <div className="relative bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-orange-500/20">
            <p className="text-xs sm:text-sm md:text-base font-bold leading-relaxed">
              🔥 Георги от Варна купи преди 8 минути • Мартин от София купи преди 12 минути
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
