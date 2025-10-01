import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { ProtocolDashboardMockup } from "./ProtocolDashboardMockup";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface Step4TheOfferProps {
  onDecline: () => void;
  userData?: UserData;
}

export const Step4TheOffer = ({ onDecline, userData }: Step4TheOfferProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [showStickyButton, setShowStickyButton] = useState(false);

  // Countdown timer
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

  // Sticky button on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 600;
      setShowStickyButton(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    "30-дневна гаранция за връщане на пари",
    "Над 3,247 доволни клиенти в България",
    "Научно базиран протокол (не магия)",
    "100% естествени съставки"
  ];

  const CTAButton = ({ variant = "default" }: { variant?: "default" | "compact" }) => (
    <Button
      size={variant === "compact" ? "default" : "lg"}
      className={`w-full ${variant === "compact" ? "text-base py-5" : "text-xl py-6"} bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl hover:shadow-2xl transition-all`}
      asChild
    >
      <a href="https://www.shop.testograph.eu" target="_blank" rel="noopener noreferrer">
        🚀 ПОРЪЧАЙ СЕГА - 97 ЛВ
      </a>
    </Button>
  );

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

        {/* CTA #1 - Top */}
        <CTAButton />

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

        {/* CTA #2 - Middle */}
        <CTAButton variant="compact" />

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

        {/* CTA #3 - Bottom */}
        <div className="space-y-4">
          <CTAButton />

          {/* Money-Back Guarantee Badge */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border-2 border-green-500 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center text-3xl mb-2">
              ✓
            </div>
            <h3 className="text-xl font-bold text-foreground">30-ДНЕВНА ГАРАНЦИЯ</h3>
            <p className="text-muted-foreground">
              Не сте доволни? Връщаме ви парите. Без въпроси.
            </p>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              100% Risk-Free
            </p>
          </div>

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

          {/* Payment Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
              <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="2" fill="#1434CB"/>
                <path d="M13.8 14.5h4.4l2.8-9h-4.4l-2.8 9z" fill="#fff"/>
              </svg>
              <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="2" fill="#EB001B"/>
                <circle cx="12" cy="10" r="6" fill="#F79E1B" fillOpacity="0.7"/>
              </svg>
              <span className="text-xs font-medium">Visa/Mastercard</span>
            </div>
            <div className="px-4 py-2 bg-card rounded-lg border">
              <span className="text-xs font-medium">🔒 SSL Secure</span>
            </div>
            <div className="px-4 py-2 bg-card rounded-lg border">
              <span className="text-xs font-medium">🇧🇬 Доставка от България</span>
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

      {/* Sticky CTA Button (Mobile) */}
      {showStickyButton && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-violet-600 p-4 shadow-2xl border-t-2 border-primary animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-white text-xs font-medium">ЕКСКЛУЗИВНА ОФЕРТА</p>
              <p className="text-white text-lg font-bold">97 ЛВ</p>
            </div>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              asChild
            >
              <a href="https://www.shop.testograph.eu" target="_blank" rel="noopener noreferrer">
                ПОРЪЧАЙ СЕГА
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
