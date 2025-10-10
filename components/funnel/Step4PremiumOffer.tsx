import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { ProtocolDashboardMockup } from "./ProtocolDashboardMockup";
import { RealResultsStats } from "./RealResultsStats";
import { SuccessMomentsViber } from "./SuccessMomentsViber";
import { WhatHappensNextTimeline } from "./WhatHappensNextTimeline";
import { ValueStackVisual } from "./ValueStackVisual";
import { QualificationSection } from "./QualificationSection";
import { FAQSection } from "./FAQSection";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface Step4PremiumOfferProps {
  onDecline: () => void;
  userData?: UserData;
}

export const Step4PremiumOffer = ({ onDecline, userData }: Step4PremiumOfferProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Countdown timer
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

  // Scroll progress tracking + sticky timer detection
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercent, 100));

      // Show sticky timer after scrolling 200px
      setIsScrolled(scrollTop > 200);
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
      title: "3× TESTO UP бутилки",
      value: "201 лв",
      description: "Най-силната естествена добавка на пазара. 3 месеца запас. Мултивитамин на стероиди - всичко от което тялото ти се нуждае за да произвежда тестостерон бързо.",
      isCoreProduct: true
    },
    {
      title: "TESTOGRAPH PRO интерактивен план",
      value: "197 лв",
      description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко. Направен за 100% гарантиран успех ако го следваш докрай.",
      isCoreProduct: true
    },
    {
      title: "24/7 Хормонален Експерт поддръжка",
      value: "Включена",
      description: "Винаги до теб в плана. Питай каквото искаш. Никога не си сам.",
      isCoreProduct: true
    },
    {
      title: "БОНУС: Smart App за Планиране на Хранителен Режим",
      value: "28 лв",
      description: "Точно какво да ядеш и кога. Нищо сложно. Просто следваш.",
      isBonus: true
    },
    {
      title: "БОНУС: Протокол за Сън",
      value: "29 лв",
      description: "Как да спиш за максимално възстановяване и тестостерон.",
      isBonus: true
    },
    {
      title: "БОНУС: Времеви График",
      value: "24 лв",
      description: "Кога точно да вземеш какво за максимален ефект.",
      isBonus: true
    },
    {
      title: "БОНУС: Ръководство за Упражнения",
      value: "24 лв",
      description: "Упражненията които вдигат тестостерона. Без излишни неща.",
      isBonus: true
    },
    {
      title: "БОНУС: Ръководство за Лабораторни Изследвания",
      value: "59 лв",
      description: "Как да тестваш хормоните си правилно. Да знаеш къде си.",
      isBonus: true
    }
  ];

  return (
    <>
      {/* Sticky Timer - Shows when scrolled */}
      {isScrolled && (
        <div className={`fixed top-0 left-0 right-0 z-[90] shadow-2xl transition-all duration-300 ${
          timeLeft <= 60
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
            : 'bg-gradient-to-r from-red-400 to-orange-500'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
              <p className="text-xs md:text-sm font-black text-white uppercase">
                {timeLeft <= 60 ? '⚠️ ПОСЛЕДЕН ШАНС!' : '🔥 ОФЕРТАТА ИЗТИЧА!'}
              </p>
              <p className="text-xl md:text-2xl font-black text-white tabular-nums">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[80vh] px-4 py-12 md:py-16 pt-20 md:pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Timer - URGENT COMPACT */}
          <div className={`relative rounded-xl p-4 md:p-5 border-4 shadow-2xl transition-all duration-300 ${
            timeLeft <= 60
              ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-700 animate-pulse'
              : 'bg-gradient-to-r from-red-400 to-orange-500 border-red-600'
          }`}>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              {/* Urgency Icon */}
              <div className="relative flex-shrink-0">
                <Clock className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                {timeLeft <= 60 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>

              {/* Timer Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm md:text-base font-black text-white uppercase tracking-wide">
                  {timeLeft <= 60 ? '⚠️ ПОСЛЕДЕН ШАНС!' : '🔥 ОФЕРТАТА ИЗТИЧА!'}
                </p>
                <div className="flex items-baseline gap-2 justify-center md:justify-start mt-1">
                  <p className="text-4xl md:text-5xl font-black text-white tabular-nums">
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-white/90">
                    {timeLeft <= 60 ? 'сек' : 'мин'}
                  </p>
                </div>
              </div>

              {/* Urgency Pulse Effect */}
              {timeLeft <= 60 && (
                <div className="hidden md:block flex-shrink-0">
                  <div className="text-3xl animate-bounce">⏰</div>
                </div>
              )}
            </div>
          </div>

          {/* Header - NEW COPY */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Колко време още<br />ще се правиш че всичко е наред?
            </h1>

            <div className="text-lg md:text-xl text-muted-foreground space-y-4 text-left">
              <p>Не говоря за усещането "добре съм".</p>
              <p>Говоря за чувството, че си способен на всичко - енергия, сила, увереност.</p>
            </div>

            <p className="text-xl md:text-2xl font-bold text-foreground">
              Ако не можеш да си го спомниш, разбирам те напълно.
            </p>

            <div className="text-lg md:text-xl text-muted-foreground space-y-4 text-left">
              <p>Тялото ти те издаде. Енергията ти е на нулата - нито в залата можеш, нито на работа.</p>
              <p>Всичко е по-трудно и просто не си мъжът, който искаш да бъдеш.</p>
            </div>

            <p className="text-xl md:text-2xl font-bold text-primary">
              На една стъпка си от промяната.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 md:p-8 border-2 border-primary/30 text-left space-y-4">
              <p className="text-lg md:text-xl font-bold text-foreground">
                Ето как излязох от този капан:
              </p>
              <ul className="space-y-3 text-base md:text-lg text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Най-силната естествена добавка на пазара - 3 месеца запас за да видиш ИСТИНСКА промяна</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Точен план какво да правиш всеки ден - няма място за грешка</span>
                </li>
              </ul>
              <p className="text-base md:text-lg text-foreground pt-4 border-t border-border">
                Всичко е просто и ясно.
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                Направи го. След 2 седмици ще усетиш как тялото ти се събужда.
              </p>
            </div>

            <p className="text-lg md:text-xl text-foreground">
              Всеки ден на чакане е още един изгубен ден.
            </p>
          </div>

          {/* Real Results Stats */}
          <RealResultsStats />

          {/* Success Stories Carousel */}
          <SuccessStoriesWall />

          {/* Main CTA */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a href="https://www.shop.testograph.eu?tier=premium" target="_blank" rel="noopener noreferrer" className="block">
              Вземи го за 197 лв
            </a>
          </Button>

          {/* Product Images */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 blur-3xl"></div>
              <Image
                src="/funnel/premium-offer-hero.webp"
                alt="TESTOGRAPH Premium - 3 бутилки TestoUP + Интерактивен план"
                width={600}
                height={600}
                className="object-contain drop-shadow-[0_20px_60px_rgba(249,115,22,0.3)] relative z-10 hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            <div className="rounded-lg overflow-hidden min-h-[300px]">
              <ProtocolDashboardMockup />
            </div>
          </div>

          {/* Success Moments - Viber Chats - MOVED BEFORE PRICING */}
          <SuccessMomentsViber tier="premium" />

          {/* VALUE STACK - HORMOZI STYLE */}
          <ValueStackVisual
            items={[
              {
                name: "3× TESTO UP бутилки",
                value: 201,
                description: "Най-силната естествена добавка на пазара. 3 месеца запас. Мултивитамин на стероиди - всичко от което тялото ти се нуждае за да произвежда тестостерон бързо.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TESTOGRAPH PRO интерактивен план",
                value: 197,
                description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко. Направен за 100% гарантиран успех ако го следваш докрай.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Винаги до теб в плана. Питай каквото искаш. Никога не си сам.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "Smart App за Планиране на Хранителен Режим",
                value: 28,
                description: "Точно какво да ядеш и кога. Нищо сложно. Просто следваш.",
                icon: "🍴",
                isBonus: true
              },
              {
                name: "Протокол за Сън",
                value: 29,
                description: "Как да спиш за максимално възстановяване и тестостерон.",
                icon: "😴",
                isBonus: true
              },
              {
                name: "Времеви График",
                value: 24,
                description: "Кога точно да вземеш какво за максимален ефект.",
                icon: "⏰",
                isBonus: true
              },
              {
                name: "Ръководство за Упражнения",
                value: 24,
                description: "Упражненията които вдигат тестостерона. Без излишни неща.",
                icon: "💪",
                isBonus: true
              },
              {
                name: "Ръководство за Лабораторни Изследвания",
                value: 59,
                description: "Как да тестваш хормоните си правилно. Да знаеш къде си.",
                icon: "🔬",
                isBonus: true
              }
            ]}
            totalValue={562}
            discountedPrice={197}
            savings={365}
            spotsLeft={15}
            tier="premium"
          />

          {/* Final Message */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              197 лв. Това е.
            </p>
            <p className="text-base md:text-lg text-muted-foreground">
              30-дневна гаранция при следване на протокола.<br />
              Гарантирам ти - ще проработи.
            </p>
            <p className="text-lg md:text-xl font-semibold text-primary">
              Кога за последен път се почувства като истински мъж?
            </p>
            <p className="text-base text-muted-foreground">
              Реши СЕГА. За себе си.
            </p>
          </div>

          {/* What Happens Next Timeline */}
          <WhatHappensNextTimeline tier="premium" />

          {/* Qualification Section */}
          <QualificationSection tier="premium" />

          {/* FAQ Section */}
          <FAQSection tier="premium" />

          {/* CTA Again */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a href="https://www.shop.testograph.eu?tier=premium" target="_blank" rel="noopener noreferrer" className="block">
              Вземи го за 197 лв
            </a>
          </Button>

          {/* Guarantee - PROMINENT */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl p-6 md:p-8 border-4 border-yellow-500 shadow-2xl text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center text-5xl mb-2 shadow-lg">
              🛡️
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">30-ДНЕВНА ГАРАНЦИЯ</h3>
            <p className="text-lg md:text-xl font-bold text-gray-800">
              Ако тестостеронът ти не се повиши при следване на протокола - връщаме ти парите.
            </p>
          </div>

          {/* Decline Button */}
          <div className="pt-4">
            <button
              onClick={onDecline}
              className="w-full py-3 text-sm md:text-base font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground transition-colors"
            >
              Не, покажи ми по-евтина опция →
            </button>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              ⚠️ Тази информация не е предназначена като медицински съвет и не заменя консултация с лекар.
              Продуктите не са лекарства и не са предназначени за диагностика, лечение или профилактика на заболявания.
              При здравословни проблеми или прием на медикаменти, консултирайте се с Вашия лекар преди употреба.
              Резултатите са индивидуални и могат да варират.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
