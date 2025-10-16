"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Truck, CheckCircle } from "lucide-react";
import Image from "next/image";

export function FinalCTA() {
  const [spotsLeft, setSpotsLeft] = useState(23);
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

  const pricingOptions = [
    {
      quantity: 1,
      price: 67,
      url: "https://shop.testograph.eu/cart/58692136730973:1",
      popular: false,
    },
    {
      quantity: 2,
      price: 120,
      url: "https://shop.testograph.eu/cart/58692136730973:2",
      popular: true,
      savings: 14,
    },
    {
      quantity: 3,
      price: 167,
      url: "https://shop.testograph.eu/cart/58692136730973:3",
      popular: false,
      savings: 34,
    },
  ];

  return (
    <section id="final-cta" className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <div className="max-w-5xl mx-auto">
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-8 text-white text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Clock className="w-6 h-6" />
            <p className="font-bold">
              ОФЕРТАТА ИЗТИЧА СЛЕД: {formatTime(timeLeft)}
            </p>
            <span>•</span>
            <p className="font-bold">САМО {spotsLeft} БУТИЛКИ ОСТАНАЛИ</p>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-6 md:p-10 shadow-2xl border-2 border-primary">
          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Готов си? Поръчай TestoUP сега
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Избери своя пакет
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            {/* Product Image */}
            <div className="relative">
              <Image
                src="/funnel/regular-offer-hero.webp"
                alt="TestoUP"
                width={400}
                height={400}
                className="object-contain mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Pricing Options */}
            <div className="space-y-4">
              {pricingOptions.map((option) => (
                <div
                  key={option.quantity}
                  className={`relative bg-muted/50 rounded-xl p-4 border-2 ${
                    option.popular ? "border-primary" : "border-transparent"
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      НАЙ-ПОПУЛЯРЕН
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">
                        {option.quantity}x TestoUP
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ({option.quantity * 30} дни запас)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black">{option.price} лв</p>
                      {option.savings && (
                        <p className="text-sm text-green-600 font-bold">
                          Спести {option.savings} лв
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className={`w-full ${
                      option.popular
                        ? "bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                        : ""
                    }`}
                    variant={option.popular ? "default" : "outline"}
                    onClick={() => {
                      window.location.href = option.url;
                    }}
                  >
                    Поръчай за {option.price} лв →
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>30-дневна гаранция</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <span>Безплатна доставка</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Плащане при доставка</span>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold">
              🔥 Калоян от София купи преди 7 минути • Любомир от Варна купи преди 13 минути
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
