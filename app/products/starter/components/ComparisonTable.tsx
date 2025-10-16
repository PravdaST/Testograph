"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export function ComparisonTable() {
  const tiers = [
    {
      name: "ДИГИТАЛЕН",
      price: 47,
      popular: false,
      features: {
        testoUpBottles: 0,
        protocolDays: 30,
        support: "Само имейл",
        community: false,
        bonuses: 0,
      },
      color: "border-gray-300",
      url: "https://shop.testograph.eu/cart/58678183657821:1?discount=LIMITEDOFFER",
    },
    {
      name: "СТАРТ",
      price: 97,
      popular: true,
      features: {
        testoUpBottles: 1,
        protocolDays: 30,
        support: "24/7 имейл",
        community: true,
        bonuses: 1,
      },
      color: "border-primary",
      url: "#final-cta",
    },
    {
      name: "ВИП",
      price: 197,
      popular: false,
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
      name: "МАКС",
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
            Избери пакета, който ти пасва
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Всички пакети имат 30-дневна гаранция
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-background rounded-xl p-6 md:p-8 shadow-xl border-4 ${tier.color} ${
                tier.popular ? "scale-105 md:scale-110" : ""
              } transition-all`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-violet-600 text-white px-4 py-1 font-bold">
                  ПРЕПОРЪЧАН
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-black">{tier.price}</span>
                  <span className="text-lg text-muted-foreground">лв</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">TestoUP бутилки</span>
                  <span className="font-bold">
                    {tier.features.testoUpBottles > 0 ? `${tier.features.testoUpBottles}x` : <X className="w-5 h-5 text-red-500" />}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">Протокол</span>
                  <span className="font-bold">{tier.features.protocolDays} дни</span>
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
                className={`w-full ${tier.popular ? "bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90" : ""}`}
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
                {tier.popular ? "Вземи СТАРТ пакета" : `Виж ${tier.name} пакет`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
