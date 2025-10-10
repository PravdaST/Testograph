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

interface Step4TheOfferProps {
  onDecline: () => void;
  onSkipToFree?: () => void;
  userData?: UserData;
}

export const Step4TheOffer = ({ onDecline, onSkipToFree, userData }: Step4TheOfferProps) => {
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
      title: "1× TESTO UP бутилка",
      value: "67 лв",
      description: "Най-силната естествена добавка на пазара. 30-дневен запас. Достатъчно за да видиш как работи.",
    },
    {
      title: "TESTOGRAPH PRO интерактивен план",
      value: "197 лв",
      description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко. Пълния план.",
    },
    {
      title: "24/7 Хормонален Експерт поддръжка",
      value: "Включена",
      description: "Винаги до теб в плана. Питай каквото искаш.",
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
              Колко дълго още<br />ще се правиш че всичко е наред?
            </h1>

            <div className="text-lg md:text-xl text-muted-foreground space-y-4 text-left">
              <p>Разбирам. 197 лв е много.</p>
              <p>Но знаеш какво е наистина скъпо?</p>
              <p>Още една година да гледаш как животът ти минава, без да си мъжът, който искаш да бъдеш.</p>
            </div>

            <p className="text-xl md:text-2xl font-bold text-primary">
              Слушай, не искам да те изгубя като клиент.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 md:p-8 border-2 border-primary/30 text-left space-y-4">
              <p className="text-lg md:text-xl font-bold text-foreground">
                Ето какво ще направим:
              </p>
              <ul className="space-y-3 text-base md:text-lg text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Една бутилка TESTO UP - 30 дни за да видиш как тялото ти се променя</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Целият TESTOGRAPH PRO план - точно какво да правиш</span>
                </li>
              </ul>
              <p className="text-base md:text-lg text-foreground pt-4 border-t border-border">
                Само 97 лв - толкова струва.
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                Повече от достатъчно, за да видиш че наистина работи.
              </p>
            </div>

            <p className="text-lg md:text-xl text-foreground">
              След 30 дни ще се върнеш за повече - не защото аз ти казвам, а защото тялото ти ще ти каже.
            </p>

            <p className="text-base md:text-lg text-muted-foreground">
              Виждал съм го стотици пъти. Започват с една бутилка. След месец искат три.
            </p>
          </div>

          {/* Real Results Stats */}
          <RealResultsStats />

          {/* Success Stories Carousel */}
          <SuccessStoriesWall />

          {/* Main CTA */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a href="https://shop.testograph.eu?tier=single" target="_blank" rel="noopener noreferrer" className="block">
              Вземи го за 97 лв
            </a>
          </Button>

          {/* Product Images */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-3xl"></div>
              <Image
                src="/funnel/regular-offer-hero.webp"
                alt="TESTOGRAPH - 1 бутилка TestoUP + Интерактивен план"
                width={600}
                height={600}
                className="object-contain drop-shadow-[0_20px_60px_rgba(139,92,246,0.3)] relative z-10 hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            <div className="rounded-lg overflow-hidden min-h-[300px]">
              <ProtocolDashboardMockup />
            </div>
          </div>

          {/* Success Moments - Viber Chats - MOVED BEFORE PRICING */}
          <SuccessMomentsViber tier="regular" />

          {/* VALUE STACK - HORMOZI STYLE */}
          <ValueStackVisual
            items={[
              {
                name: "1× TESTO UP бутилка",
                value: 67,
                description: "Най-силната естествена добавка на пазара. 30-дневен запас. Достатъчно за да видиш как работи.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TESTOGRAPH PRO интерактивен план",
                value: 197,
                description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко. Пълния план.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Винаги до теб в плана. Питай каквото искаш.",
                icon: "🤝",
                highlight: true
              }
            ]}
            totalValue={264}
            discountedPrice={97}
            savings={167}
            spotsLeft={15}
            tier="regular"
          />

          {/* Final Message */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              97 лв. Пробвай.
            </p>
          </div>

          {/* What Happens Next Timeline */}
          <WhatHappensNextTimeline tier="regular" />

          {/* Qualification Section */}
          <QualificationSection tier="regular" />

          {/* FAQ Section */}
          <FAQSection tier="regular" />

          {/* CTA Again */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a href="https://shop.testograph.eu?tier=single" target="_blank" rel="noopener noreferrer" className="block">
              Вземи го за 97 лв
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
          <div className="pt-4 space-y-3">
            <button
              onClick={onDecline}
              className="w-full py-3 text-sm md:text-base font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground transition-colors"
            >
              Все още е скъпо, покажи ми най-евтината опция →
            </button>

            {/* Free Plan Link */}
            {onSkipToFree && (
              <p className="text-center text-xs md:text-sm text-muted-foreground">
                Не си готов да купуваш?{" "}
                <button
                  onClick={onSkipToFree}
                  className="text-primary hover:underline font-medium"
                >
                  Вземи безплатния 7-дневен план →
                </button>
              </p>
            )}
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
