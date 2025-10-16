"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function BulkPricing() {
  const options = [
    {
      quantity: 1,
      price: 67,
      pricePerBottle: 67,
      savings: 0,
      popular: false,
      url: "https://shop.testograph.eu/cart/58692136730973:1",
    },
    {
      quantity: 2,
      price: 120,
      pricePerBottle: 60,
      savings: 14,
      popular: true,
      url: "https://shop.testograph.eu/cart/58692136730973:2",
    },
    {
      quantity: 3,
      price: 167,
      pricePerBottle: 55.67,
      savings: 34,
      popular: false,
      url: "https://shop.testograph.eu/cart/58692136730973:3",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Спести с количествена отстъпка
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Колкото повече купиш, толкова повече спестяваш
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {options.map((option, index) => (
            <div
              key={index}
              className={`relative bg-background rounded-xl p-6 md:p-8 shadow-xl border-4 ${
                option.popular ? "border-primary scale-105" : "border-border"
              } transition-all`}
            >
              {option.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-violet-600 text-white px-4 py-1 font-bold">
                  НАЙ-ПОПУЛЯРЕН
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{option.quantity}x TestoUP</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ({option.quantity * 30} дни запас)
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl md:text-5xl font-black">{option.price}</span>
                  <span className="text-lg text-muted-foreground">лв</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.pricePerBottle.toFixed(2)} лв / бутилка
                </p>
                {option.savings > 0 && (
                  <p className="text-green-600 font-bold mt-2">
                    Спести {option.savings} лв
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Безплатна доставка</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">30-дневна гаранция</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Плащане при доставка</span>
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
                Поръчай {option.quantity}x за {option.price} лв
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-primary/10 rounded-xl p-6">
          <p className="text-lg font-semibold">
            💡 Съвет: Оптималните резултати се виждат след 60-90 дни постоянна употреба
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Затова препоръчваме 2x или 3x пакет за видими и трайни резултати
          </p>
        </div>
      </div>
    </section>
  );
}
