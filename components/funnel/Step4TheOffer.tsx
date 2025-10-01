import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { ProtocolDashboardMockup } from "./ProtocolDashboardMockup";

interface Step4TheOfferProps {
  onDecline: () => void;
}

export const Step4TheOffer = ({ onDecline }: Step4TheOfferProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const features = [
    {
      title: "30-дневен интерактивен web протокол",
      description: "Ден-по-ден план за хранене, тренировки, добавки. Персонален tracker за проследяване на напредъка",
      value: "197 лв"
    },
    {
      title: "TestoUP Premium добавка (30 дни)",
      description: "40% Протодиосцин Трибулус - 5x по-мощен от пазара. Адаптогени + витамини за хормонален баланс",
      value: "67 лв"
    },
    {
      title: "AI Тестостеронов Експерт (НОВ!)",
      description: "Персонален асистент 24/7 за адаптиране на протокола. Отговаря на всички въпроси за тренировки, храна, добавки",
      value: "99 лв"
    },
    {
      title: "Meal Planner + Food Tracker App (НОВ!)",
      description: "Автоматично планиране на храни според протокола. Персонализирани рецепти с български продукти",
      value: "79 лв"
    },
    {
      title: "Telegram VIP общност",
      description: "Ежедневни съвети от експерти. Директна подкрепа + мотивация",
      value: "Безценно"
    }
  ];

  const guarantees = [
    "Над 3,247 доволни клиенти в България",
    "Научно базиран протокол (не магия)",
    "100% естествени съставки",
    "Дискретна доставка до 24 часа"
  ];

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Timer Section */}
        <div className="bg-orange-100 dark:bg-orange-950/30 border-2 border-orange-500 rounded-lg p-4 flex items-center justify-center gap-3">
          <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
          <div className="text-center">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
              ⏰ ОФЕРТАТА ИЗТИЧА СЛЕД:
            </p>
            <p className="text-3xl font-bold text-orange-600">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
            <span className="text-primary font-bold">⚡ ЕКСКЛУЗИВНА ОФЕРТА</span>
          </div>
          <p className="text-sm text-muted-foreground">
            (Валидна само докато се зарежда докладът)
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🎯 ПЪЛНАТА TESTOGRAPH PRO СИСТЕМА
          </h1>
          <p className="text-lg text-muted-foreground">
            Вашият безплатен доклад Ви показва КЪДЕ сте. Но как да стигнете ДО ВЪРХА?
          </p>
        </div>

        {/* Product Images */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/funnel/testoup-bottle.webp"
                alt="TestoUP Premium добавка"
                width={250}
                height={350}
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="rounded-lg overflow-hidden min-h-[300px]">
            <ProtocolDashboardMockup />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-center text-foreground mb-4">
            Това което получавате ДНЕС:
          </h2>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                ({feature.value})
              </span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-card backdrop-blur-md rounded-lg p-8 space-y-4 border-2 border-primary">
          <div className="flex items-center justify-between text-xl">
            <span className="text-muted-foreground">ОБЩА СТОЙНОСТ:</span>
            <span className="font-bold line-through text-muted-foreground">442 лв</span>
          </div>
          <div className="flex items-center justify-between text-3xl">
            <span className="font-bold text-foreground">ДНЕС ПЛАТЕТЕ:</span>
            <span className="font-bold text-primary">97 лв</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span className="text-muted-foreground">СПЕСТЯВАТЕ:</span>
            <span className="font-bold text-green-600">345 лв (78% отстъпка)</span>
          </div>
          <p className="text-center text-sm text-muted-foreground pt-2">
            По-малко от 2 кафета дневно за пълна трансформация.
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full text-xl py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            asChild
          >
            <a href="https://buy.stripe.com/test_PLACEHOLDER" target="_blank" rel="noopener noreferrer">
              🚀 ПОРЪЧАЙ СЕГА - 97 ЛВ
            </a>
          </Button>

          {/* Guarantees */}
          <div className="bg-primary/5 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-bold text-center text-foreground">
              ✅ ЗАЩО ДА НИ ВЯРВАТЕ:
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {guarantees.map((guarantee, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{guarantee}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decline Button */}
          <div className="text-center pt-4">
            <button
              onClick={onDecline}
              className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Не, благодаря
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
