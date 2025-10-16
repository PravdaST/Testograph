"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Truck, CheckCircle } from "lucide-react";
import Image from "next/image";

export function FinalCTA() {
  const [spotsLeft, setSpotsLeft] = useState(8);
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
    // Maximum package product page URL
    window.location.href = "https://shop.testograph.eu/products/maximum";
  };

  return (
    <section id="final-cta" className="py-12 md:py-20 px-4 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5">
      <div className="max-w-5xl mx-auto">
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-700 rounded-xl p-4 mb-8 text-white text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Clock className="w-6 h-6" />
            <p className="font-bold">
              ОФЕРТАТА ИЗТИЧА СЛЕД: {formatTime(timeLeft)}
            </p>
            <span>•</span>
            <p className="font-bold">САМО {spotsLeft} ПАКЕТА ОСТАНАЛИ</p>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-6 md:p-10 shadow-2xl border-2 border-orange-600">
          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Готов си? Вземи МАКС пакета сега и започни утре
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              4 месеца пълна трансформация в един пакет
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            {/* Product Image */}
            <div className="relative">
              <Image
                src="/funnel/premium-offer-hero.webp"
                alt="МАКС пакет"
                width={400}
                height={400}
                className="object-contain mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Pricing & CTA */}
            <div className="space-y-6">
              {/* Price */}
              <div className="bg-muted/50 rounded-xl p-6">
                <div className="flex items-baseline justify-center gap-3 mb-4">
                  <span className="text-5xl md:text-6xl font-black">267</span>
                  <div>
                    <span className="text-2xl font-bold">лв</span>
                    <p className="line-through text-muted-foreground">629.90 лв</p>
                  </div>
                </div>
                <p className="text-center text-green-600 font-bold text-xl">
                  Спести 362.90 лв днес
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {[
                  "✓ 4x TestoUP бутилки (120 дни)",
                  "✓ Безплатна доставка",
                  "✓ VIP 24/7 поддръжка",
                  "✓ 30-дневна гаранция",
                  "✓ 3 VIP бонуса",
                ].map((benefit, index) => (
                  <p key={index} className="flex items-center gap-2 text-sm md:text-base">
                    {benefit}
                  </p>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-2xl transition-all hover:scale-105"
              >
                Поръчай МАКС пакет за 267 лв →
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>SSL Secure</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>30-day guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold">
              🔥 Николай от Варна купи преди 15 минути • Владимир от София купи преди 23 минути
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
