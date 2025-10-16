"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Shield, Truck } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
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

  const scrollToCTA = () => {
    const ctaElement = document.getElementById("final-cta");
    if (ctaElement) {
      ctaElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="relative pt-20 pb-12 md:pt-28 md:pb-20 px-4 overflow-hidden">
      {/* Background Gradient - Orange/Red theme for premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Countdown Timer - Prominent */}
        <div className={`mx-auto max-w-2xl mb-8 rounded-xl p-4 md:p-5 border-4 shadow-2xl transition-all duration-300 ${
          timeLeft <= 3600
            ? "bg-gradient-to-r from-red-600 to-red-700 border-red-800 animate-pulse"
            : "bg-gradient-to-r from-orange-600 to-red-600 border-red-700"
        }`}>
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
            <div className="text-center">
              <p className="text-xs md:text-sm font-black text-white uppercase tracking-wide">
                {timeLeft <= 3600 ? "⚠️ ПОСЛЕДЕН ШАНС!" : "🔥 ОФЕРТАТА ИЗТИЧА СЛЕД"}
              </p>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums mt-1">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Copy */}
          <div className="space-y-6">
            {/* Headline */}
            <div className="space-y-4">
              <Badge variant="default" className="bg-orange-600 text-white px-4 py-1 text-sm font-bold">
                ✓ МАКС ПАКЕТ - ЗА СЕРИОЗНИ РЕЗУЛТАТИ
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Пълна 4-месечна <span className="text-orange-600">ТРАНСФОРМАЦИЯ</span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                за <span className="text-foreground font-black">267 лв</span>{" "}
                <span className="line-through text-muted-foreground/60">629.90 лв</span>
              </p>
            </div>

            {/* Value Prop */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 md:p-6 space-y-3 border-2 border-orange-500/30">
              <p className="font-semibold text-lg">
                Най-комплектния пакет за максимални резултати:
              </p>
              <ul className="space-y-2">
                {[
                  "✅ 4x TestoUP бутилки (120 дни запас)",
                  "✅ Пълен 120-дневен протокол",
                  "✅ VIP 24/7 експерт поддръжка",
                  "✅ Напреднал тренировъчен план",
                  "✅ 50+ хранителни рецепти",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-base md:text-lg font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-6 h-6 text-orange-600" />
                <p className="text-xs font-semibold">30-дневна гаранция</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-6 h-6 text-orange-600" />
                <p className="text-xs font-semibold">Безплатна доставка</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                <p className="text-xs font-semibold">487 отзива (4.8/5)</p>
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              size="lg"
              onClick={scrollToCTA}
              className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-2xl transition-all hover:scale-105"
            >
              Вземи МАКС пакета за 267 лв →
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Спести 362.90 лв днес • Безплатна доставка • 30-дневна гаранция
            </p>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-red-500/20 blur-3xl" />
            <div className="relative">
              <Image
                src="/funnel/premium-offer-hero.webp"
                alt="Testograph МАКС Пакет - 4x TestoUP бутилки"
                width={600}
                height={600}
                className="object-contain drop-shadow-[0_20px_60px_rgba(234,88,12,0.5)] hover:scale-105 transition-transform duration-500"
                priority
              />
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-full px-6 py-3 shadow-2xl rotate-12 transform hover:rotate-0 transition-transform">
                <p className="text-sm font-black">СПЕСТИ</p>
                <p className="text-2xl font-black">362.90 лв</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
