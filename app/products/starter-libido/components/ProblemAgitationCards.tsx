"use client";

import { useState, useEffect } from "react";
import { AlertCircle, TrendingDown, Heart, Zap } from "lucide-react";
import Image from "next/image";

interface PainPoint {
  emoji: string;
  title: string;
  description: string;
  icon: typeof AlertCircle;
  color: string;
  image: string;
}

export function ProblemAgitationCards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("problem-section");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const painPoints: PainPoint[] = [
    {
      emoji: "😶",
      title: "Гледаш я. Нищо.",
      description:
        "Преди 2-3 години беше различно. Виждаше я и... искаше. Автоматично. Инстинктивно. Сега? Тя излиза от банята, красива, и ти... нищо. Като че ли си изключен. Казваш си: 'Просто съм уморен. Утре ще е различно.' Но утре е същото. И вдругиден. И след 6 месеца...",
      icon: Heart,
      color: "text-red-500",
      image: "/landing/Гледаш я нищо.webp",
    },
    {
      emoji: "😰",
      title: "Тялото не реагира",
      description:
        "Опитваш се. Но тялото не реагира както преди. Тя започва да пита 'всичко ли е наред?'. Казваш 'уморен съм'. Но вътре знаеш - това не е умора.",
      icon: AlertCircle,
      color: "text-orange-500",
      image: "/landing/тялото не реагира.webp",
    },
    {
      emoji: "💔",
      title: "Дистанцията расте. Всеки ден.",
      description:
        "Вечер. Лягате си. Тя се притиска до теб... и ти се обръщаш на другата страна. 'Уморен съм', казваш. Тя въздиша. Разстоянието между вас в леглото става 20 сантиметра. После 50. После... тя спира да се опитва. И най-страшното? Ти си облекчен. Защото не трябва да се страхуваш, че тялото ти няма да реагира.",
      icon: TrendingDown,
      color: "text-purple-500",
      image: "/landing/Загубена Близост.webp",
    },
    {
      emoji: "😔",
      title: "Загубена увереност",
      description:
        "Не е в нея. Не е в теб като личност. Проблемът е в хормоните ти. Тестостеронът е спаднал. От стрес. От възраст. От лош сън.",
      icon: Zap,
      color: "text-yellow-500",
      image: "/landing/Загубена увереност.webp",
    },
  ];

  return (
    <section id="problem-section" className="py-12 md:py-16 lg:py-24 px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes problem-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-25px); }
        }
        @keyframes problem-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-30px) translateY(25px); }
        }
        @keyframes problem-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-problem-drift { animation: problem-drift 26s ease-in-out infinite; }
        .animate-problem-drift-reverse { animation: problem-drift-reverse 30s ease-in-out infinite; }
        .animate-problem-float { animation: problem-float 22s ease-in-out infinite; }
      `}} />

      {/* Animated SVG Background Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="problem-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="problem-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="problem-gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Wave 1 - Top */}
        <path
          d="M -100 200 Q 300 150, 600 220 T 1300 180"
          stroke="url(#problem-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-problem-drift"
        />

        {/* Wave 2 - Middle */}
        <path
          d="M 1400 400 Q 1000 350, 700 430 T 0 380"
          stroke="url(#problem-gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-problem-drift-reverse"
        />

        {/* Wave 3 - Bottom */}
        <path
          d="M -50 650 Q 350 700, 700 620 T 1450 680"
          stroke="url(#problem-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-problem-drift"
        />

        {/* Circle accent 1 */}
        <circle
          cx="200"
          cy="300"
          r="100"
          stroke="url(#problem-gradient3)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Circle accent 2 */}
        <circle
          cx="1100"
          cy="550"
          r="120"
          stroke="url(#problem-gradient2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Vertical wave */}
        <path
          d="M 700 -50 Q 650 250, 750 500 T 700 850"
          stroke="url(#problem-gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-problem-float"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div
            className={`inline-flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 rounded-full px-4 py-2 sm:px-5 mb-4 sm:mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
            <span className="text-xs sm:text-sm font-bold text-red-500">
              Познаваш ли това чувство?
            </span>
          </div>

          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 px-2 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            4-те етапа как ниският тестостерон{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              унищожава либидото ти
            </span>
          </h2>

          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            И как ниският тестостерон убива желанието ти, без дори да разбереш.
          </p>
        </div>

        {/* Pain Point Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 md:mb-12">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`group relative bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary/50 hover:bg-card/80 transition-all duration-500 active:scale-[0.98] sm:hover:scale-[1.03] hover:shadow-2xl ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

              {/* Background Image with Overlay */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500">
                <Image
                  src={point.image}
                  alt={point.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
              </div>

              {/* Content Container */}
              <div className="relative z-10 p-5 sm:p-6 md:p-8">
                {/* Emoji Badge with enhanced effects - Mobile optimized */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-background to-muted border-2 border-border/50 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-2xl md:text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {point.emoji}
                </div>

                {/* Icon with gradient background - Mobile optimized */}
                <div className="flex justify-end mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <point.icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 ${point.color} group-hover:scale-110 transition-transform`} />
                  </div>
                </div>

                {/* Content - Mobile optimized */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 leading-tight group-hover:text-primary transition-colors">
                  {point.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>

              {/* Enhanced Hover Indicator with gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-red-500 via-orange-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl z-20 shadow-lg" />
            </div>
          ))}
        </div>

        {/* Revelation Callout - Enhanced */}
        <div className="relative">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-purple-500/10 blur-3xl rounded-2xl sm:rounded-3xl" />

          <div
            className={`relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center overflow-hidden shadow-2xl transition-all duration-700 delay-800 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

            <div className="relative z-10">
              {/* Enhanced Icon with pulse - Mobile optimized */}
              <div className="inline-flex w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center mb-4 sm:mb-6 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-ping opacity-20" />
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white relative z-10" />
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 px-2">
                Проблемът не е в теб.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-purple-500">
                  Проблемът е в хормоните ти.
                </span>
              </h3>

              <div className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-4 space-y-4">
                <p className="font-semibold text-foreground text-base md:text-lg">
                  Ето какво се случва в тялото ти:
                </p>

                <div className="space-y-2 text-left bg-muted/30 rounded-xl p-4 sm:p-6 border border-border/50">
                  <p className="font-mono text-sm sm:text-base">
                    <span className="text-red-400">Стресът от работа</span> → Кортизол ↑ → <span className="text-orange-500 font-bold">Тестостерон ↓</span>
                  </p>
                  <p className="font-mono text-sm sm:text-base">
                    <span className="text-red-400">Лошият сън</span> → Възстановяване ↓ → <span className="text-orange-500 font-bold">Тестостерон ↓</span>
                  </p>
                  <p className="font-mono text-sm sm:text-base">
                    <span className="text-red-400">Възрастта 30+</span> → <span className="text-orange-500 font-bold">Естествен спад 1-2% годишно</span>
                  </p>
                </div>

                <p className="text-base md:text-lg lg:text-xl">
                  <strong className="text-foreground font-black">
                    След 5 години на 1-2% спад? Тестостеронът ти е с 10% по-нисък. Либидото ти е... почти нула.
                  </strong>
                </p>

                <p className="text-base md:text-lg">
                  Но добрата новина?{" "}
                  <strong className="text-green-500 font-black">
                    3,247 мъже обърнаха процеса за 30 дни. С естествени съставки. Без рецепти. Без инжекции.
                  </strong>
                </p>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-green-500/10 border-2 border-green-500/30 rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-xs sm:text-sm md:text-base font-bold text-green-500">
                    3,247+ мъже вече го решиха с TestoUP
                  </span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground italic max-w-2xl mx-auto">
                  Като <span className="font-semibold text-foreground">Георги (34г.)</span> който каза:{" "}
                  <span className="text-foreground font-medium">"Ден 18 - жена ми попита дали съм започнал да тренирам отново."</span>
                </p>
              </div>

              {/* New CTA Button - Conversion Moment */}
              <div className="mt-8 sm:mt-10 md:mt-12 text-center space-y-4">
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-semibold">
                  Готов да промениш това за 30 дни?
                </p>
                <button
                  onClick={() => {
                    const element = document.getElementById('value-stack');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-primary via-accent to-primary
                             text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl
                             hover:scale-105 active:scale-95 transition-all shadow-2xl
                             hover:shadow-primary/50 inline-flex items-center gap-2"
                >
                  Да, искам 30-дневния протокол →
                </button>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
                  (Спести 245 лв с СТАРТ пакета)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Безплатна доставка
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    30-дневна гаранция
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Без рецепта
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
