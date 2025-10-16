"use client";

import { useState, useEffect } from "react";
import { AlertCircle, TrendingDown, Coffee, Zap, BatteryLow, Brain } from "lucide-react";

interface PainPoint {
  emoji: string;
  title: string;
  description: string;
  icon: typeof AlertCircle;
  color: string;
}

export function EnergyProblemAgitationCards() {
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
      emoji: "😴",
      title: "6:30 сутринта. Кошмар.",
      description:
        "Будилникът. Отваряш очи... и искаш да умреш. Не от депресия. От ФИЗИЧЕСКА ИЗТОЩЕНОСТ. Като че ли си спал 2 часа. А спал си 7.",
      icon: BatteryLow,
      color: "text-red-500",
    },
    {
      emoji: "☕",
      title: "Кафе. Още кафе. Още...",
      description:
        "8:00 - Първо кафе. 10:00 - Второ кафе. 12:00 - Трето кафе. Сърцето ти туптене. Но енергията? Все още зомби.",
      icon: Coffee,
      color: "text-orange-500",
    },
    {
      emoji: "🧠",
      title: "Мозъкът изключва",
      description:
        "Обяд. Тежка храна. 14:00 - мозъкът ти изключва. Заспиваш на бюрото. 'Концентрацията' е спомен от миналото.",
      icon: Brain,
      color: "text-purple-500",
    },
    {
      emoji: "💔",
      title: "Вкъщи. Мъртъв.",
      description:
        "18:00 - Вкъщи. Децата искат да играят. Ти падаш на дивана. 'Тате, защо винаги си уморен?' Това БОЛИ. Защото не избираш. Просто... нямаш енергия.",
      icon: TrendingDown,
      color: "text-yellow-500",
    },
  ];

  return (
    <section id="problem-section" className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div
            className={`inline-flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 rounded-full px-5 py-2 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-red-500">
              Познаваш ли този "живот"?
            </span>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            4-те признака че{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              енергията ти е на дъното
            </span>
          </h2>

          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            И как ниският тестостерон убива енергията ти, без дори да разбереш.
          </p>
        </div>

        {/* Pain Point Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`group relative bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Emoji Badge */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-background border-2 border-border/50 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform">
                {point.emoji}
              </div>

              {/* Icon */}
              <div className="flex justify-end mb-4">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <point.icon className={`w-5 h-5 ${point.color}`} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
                {point.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl" />
            </div>
          ))}
        </div>

        {/* Revelation Callout */}
        <div
          className={`relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-3xl p-8 md:p-12 text-center overflow-hidden transition-all duration-700 delay-800 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Background Pattern */}
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

          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 items-center justify-center mb-6 shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
              Проблемът? Тестостеронът ти е на дъното.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                Ниският тестостерон = хронична умора.
              </span>
            </h3>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Витамин B12 на дъното. Витамин D дефицит. TestoUP съдържа{" "}
              <strong className="text-foreground">
                24000% РДА B12. 700% РДА D3.
              </strong>{" "}
              Енергията се връща за дни.
            </p>

            <div className="inline-flex items-center gap-2 bg-green-500/10 border-2 border-green-500/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm md:text-base font-bold text-green-500">
                1,450+ мъже се събудиха от "енергийния кошмар" за 2 седмици
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
