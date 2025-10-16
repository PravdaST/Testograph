"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export function ComparisonTable() {
  const tiers = [
    {
      name: "TestoUP Single",
      price: 67,
      popular: false,
      features: {
        testoUpBottles: 1,
        protocolDays: 0,
        support: "Имейл",
        community: false,
        bonuses: 0,
      },
      color: "border-green-500",
      url: "#final-cta",
    },
    {
      name: "СТАРТ",
      price: 97,
      popular: false,
      features: {
        testoUpBottles: 1,
        protocolDays: 30,
        support: "24/7 имейл",
        community: true,
        bonuses: 1,
      },
      color: "border-primary",
      url: "/products/starter",
    },
    {
      name: "ПРЕМИУМ",
      price: 197,
      popular: true,
      features: {
        testoUpBottles: 3,
        protocolDays: 90,
        support: "24/7 всички канали",
        community: true,
        bonuses: 2,
      },
      color: "border-violet-600",
      url: "/products/premium",
    },
    {
      name: "МАКСИМУМ",
      price: 267,
      popular: false,
      features: {
        testoUpBottles: 4,
        protocolDays: 120,
        support: "VIP 24/7 всички канали",
        community: true,
        bonuses: 3,
      },
      color: "border-orange-600",
      url: "/products/maximum",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Искаш повече от само добавката?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Вземи пълен пакет с протокол и поддръжка
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-background rounded-xl p-6 shadow-xl border-4 ${tier.color} ${
                tier.popular ? "scale-105 md:scale-110" : ""
              } transition-all`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 font-bold">
                  НАЙ-ПОПУЛЯРЕН
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl md:text-4xl font-black">{tier.price}</span>
                  <span className="text-lg text-muted-foreground">лв</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">TestoUP бутилки</span>
                  <span className="font-bold">{tier.features.testoUpBottles}x</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">Протокол</span>
                  <span className="font-bold">
                    {tier.features.protocolDays > 0 ? `${tier.features.protocolDays} дни` : <X className="w-5 h-5 text-red-500" />}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">Поддръжка</span>
                  <span className="font-bold text-xs">{tier.features.support}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">VIP общност</span>
                  {tier.features.community ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Бонуси</span>
                  <span className="font-bold">{tier.features.bonuses}</span>
                </div>
              </div>

              <Button
                className={`w-full ${tier.popular ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700" : ""}`}
                variant={tier.popular ? "default" : "outline"}
                onClick={() => {
                  if (tier.url.startsWith("#")) {
                    const el = document.getElementById(tier.url.slice(1));
                    el?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = tier.url;
                  }
                }}
              >
                {tier.popular ? `Вземи ${tier.name}` : `Виж ${tier.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
