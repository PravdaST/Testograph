import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { ProtocolDashboardMockup } from "./ProtocolDashboardMockup";
import { OfferProgressBar } from "./OfferProgressBar";
import { RealResultsStats } from "./RealResultsStats";
import { SuccessMomentsViber } from "./SuccessMomentsViber";
import { WhatHappensNextTimeline } from "./WhatHappensNextTimeline";
import { ValueStackVisual } from "./ValueStackVisual";
import { QualificationSection } from "./QualificationSection";
import { FAQSection } from "./FAQSection";
import { trackButtonClick, trackOfferView } from "@/lib/analytics/funnel-tracker";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface Step4DigitalOfferProps {
  onDecline: () => void;
  onSkipToFree?: () => void;
  userData?: UserData;
}

export const Step4DigitalOffer = ({ onDecline, onSkipToFree, userData }: Step4DigitalOfferProps) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track offer view on mount
  useEffect(() => {
    trackOfferView(8, 'digital');
  }, []);

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

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercent, 100));
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
      title: "TESTOGRAPH PRO интерактивен план",
      value: "197 лв",
      description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко. Пълния план.",
    },
    {
      title: "24/7 Хормонален Експерт поддръжка",
      value: "Включена",
      description: "Винаги до теб в плана. Питай каквото искаш.",
    },
    {
      title: "Персонален Tracker",
      value: "Включен",
      description: "Следи напредъка си. Виж как тялото ти се трансформира.",
    }
  ];

  return (
    <>
      {/* Progress Bar - Top */}
      <OfferProgressBar price="47 лв" discount="76%" tier="digital" scrollProgress={scrollProgress} />

      <div className="min-h-[80vh] px-4 py-12 md:py-16 pt-20 md:pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Timer - URGENT COMPACT */}
          <div className={`relative rounded-xl p-4 md:p-5 border-4 shadow-2xl transition-all duration-300 ${
            timeLeft <= 90
              ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-800 animate-pulse'
              : 'bg-gradient-to-r from-red-500 to-orange-600 border-red-700'
          }`}>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              {/* Urgency Icon */}
              <div className="relative flex-shrink-0">
                <Clock className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                {timeLeft <= 90 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>

              {/* Timer Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm md:text-base font-black text-white uppercase tracking-wide">
                  {timeLeft <= 90 ? '🚨 АБСОЛЮТНО ПОСЛЕДЕН ШАНС!' : '⚠️ ПОСЛЕДЕН ШАНС!'}
                </p>
                <div className="flex items-baseline gap-2 justify-center md:justify-start mt-1">
                  <p className="text-4xl md:text-5xl font-black text-white tabular-nums">
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-white/90">
                    {timeLeft <= 90 ? 'сек' : 'мин'}
                  </p>
                </div>
              </div>

              {/* Urgency Pulse Effect */}
              {timeLeft <= 90 && (
                <div className="hidden md:block flex-shrink-0">
                  <div className="text-3xl animate-bounce">⏰</div>
                </div>
              )}
            </div>
          </div>

          {/* Header - NEW COPY */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Колко време още имаш?
            </h1>

            <div className="text-lg md:text-xl text-muted-foreground space-y-4 text-left">
              <p>На 30 беше по-лесно, на 35 - още по-трудно.</p>
              <p>А сега всеки месец, в който чакаш, става още по-тежко.</p>
              <p>Нито тялото, нито времето те чакат.</p>
            </div>

            <p className="text-xl md:text-2xl font-bold text-primary">
              Добре, нека да започнем само с плана.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 md:p-8 border-2 border-primary/30 text-left space-y-4">
              <p className="text-base md:text-lg text-foreground">
                Без добавки. Само точният план какво да правиш.
              </p>
              <ul className="space-y-2 text-base md:text-lg text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Точно какво да ядеш и кога</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Как да тренираш за тестостерон</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Как да спиш за да се възстановяваш</span>
                </li>
              </ul>
              <p className="text-base md:text-lg text-foreground pt-4 border-t border-border">
                Ако го следваш стриктно - и имам предвид наистина стриктно - ще проработи.
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                Само 47 лв. Реалната стойност е 197 лв, но искам да започнеш ДНЕС.
              </p>
            </div>

            <p className="text-lg md:text-xl font-semibold text-foreground">
              Това е последният път когато питам.
            </p>

            <p className="text-base text-muted-foreground">
              След това си тръгваш без нищо и продължаваш да живееш така.<br />
              Или започваш промяната. Твой е изборът.
            </p>
          </div>

          {/* Real Results Stats */}
          <RealResultsStats />

          {/* Main CTA */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a
              href="https://shop.testograph.eu/cart/58678183657821:1?discount=LIMITEDOFFER"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackButtonClick(8, 'CTA: Вземи го за 47 лв', { offerTier: 'digital', position: 'top' })}
            >
              Вземи го за 47 лв
            </a>
          </Button>

          {/* Product Hero Image */}
          <div className="relative flex items-center justify-center min-h-[400px] -mx-4 md:mx-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 blur-3xl"></div>
            <Image
              src="/funnel/digital-offer-hero.webp"
              alt="TESTOGRAPH Digital - Интерактивен план"
              width={700}
              height={700}
              className="object-contain drop-shadow-[0_20px_60px_rgba(139,92,246,0.3)] relative z-10 hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>

          {/* Success Moments - Viber Chats - MOVED BEFORE PRICING */}
          <SuccessMomentsViber tier="digital" />

          {/* VALUE STACK - HORMOZI STYLE */}
          <ValueStackVisual
            items={[
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
              },
              {
                name: "Персонален Tracker",
                value: "Включен",
                description: "Следи напредъка си. Виж как тялото ти се трансформира.",
                icon: "📊",
                highlight: true
              }
            ]}
            totalValue={197}
            discountedPrice={47}
            savings={150}
            spotsLeft={15}
            tier="digital"
          />

          {/* What Happens Next Timeline */}
          <WhatHappensNextTimeline tier="digital" />

          {/* Qualification Section */}
          <QualificationSection tier="digital" />

          {/* FAQ Section */}
          <FAQSection tier="digital" />

          {/* CTA Again */}
          <Button
            size="lg"
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all"
            asChild
          >
            <a
              href="https://shop.testograph.eu/cart/58678183657821:1?discount=LIMITEDOFFER"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackButtonClick(8, 'CTA: Вземи го за 47 лв', { offerTier: 'digital', position: 'bottom' })}
            >
              Вземи го за 47 лв
            </a>
          </Button>

          {/* Guarantee - PROMINENT */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl p-6 md:p-8 border-4 border-yellow-500 shadow-2xl text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center text-5xl mb-2 shadow-lg">
              🛡️
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">30-ДНЕВНА ГАРАНЦИЯ</h3>
            <p className="text-lg md:text-xl font-bold text-gray-800">
              Не си доволен? Връщаме ти парите.
            </p>
            <p className="text-base font-semibold text-gray-700">
              Без въпроси. Без оправдания. 100% връщане.
            </p>
          </div>

          {/* Decline Button */}
          <div className="pt-4 mb-16 space-y-3">
            <button
              onClick={onDecline}
              className="w-full py-3 text-sm md:text-base font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground transition-colors"
            >
              Не благодаря →
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
        </div>
      </div>
    </>
  );
};
