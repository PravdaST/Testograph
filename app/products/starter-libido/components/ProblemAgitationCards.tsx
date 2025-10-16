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
        "Преди 2-3 години беше различно. Виждаше я и... искаше. Сега? Сега тя излиза от банята, красива, и ти... нищо. Като че ли си изключен.",
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
      title: "Загубена близост",
      description:
        "Тя мисли че не я желаеш. Ти се чувстваш виновен. Интимността намалява. Дистанцията расте. Връзката страда.",
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
              Познаваш ли това чувство?
            </span>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            4-те признака че{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              либидото ти е на дъното
            </span>
          </h2>

          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            И как ниският тестостерон убива желанието ти, без дори да разбереш.
          </p>
        </div>

        {/* Pain Point Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`group relative bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
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
              <div className="relative z-10 p-6 md:p-8">
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
              </div>

              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl z-20" />
            </div>
          ))}
        </div>

        {/* Revelation Callout */}
        <div
          className={`relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 rounded-3xl p-8 md:p-12 text-center overflow-hidden transition-all duration-700 delay-800 ${
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
            <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center mb-6 shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
              Проблемът не е в теб.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Проблемът е в хормоните ти.
              </span>
            </h3>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Тестостеронът ти е спаднал. Може би от стрес. Може би от възраст.
              Може би от лош сън. Резултатът?{" "}
              <strong className="text-foreground">
                Загубено либидо. Загубена увереност. Загубена близост.
              </strong>
            </p>

            <div className="inline-flex items-center gap-2 bg-green-500/10 border-2 border-green-500/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm md:text-base font-bold text-green-500">
                3,247+ мъже вече го решиха с TestoUP
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
