"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, Utensils, Moon, LineChart, Users, CheckCircle, Hand, Target } from "lucide-react";
import Image from "next/image";

interface ProtocolModule {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  accentColor: string;
}

const protocolModules: ProtocolModule[] = [
  {
    id: 1,
    title: "30-дневен план",
    icon: <Calendar className="w-6 h-6" />,
    description: "Точно какво да правиш всеки ден - никакво гадаене",
    features: [
      "Дневни задачи и цели",
      "Прогресивна структура",
      "Адаптиране според резултатите"
    ],
    color: "blue",
    accentColor: "border-blue-500"
  },
  {
    id: 2,
    title: "Тренировъчен протокол",
    icon: <Dumbbell className="w-6 h-6" />,
    description: "Тренировки оптимизирани за тестостерон",
    features: [
      "3-4 тренировки седмично",
      "Съставни упражнения за хормонален отговор",
      "Видео инструкции за всяко упражнение"
    ],
    color: "orange",
    accentColor: "border-orange-500"
  },
  {
    id: 3,
    title: "Хранителен план",
    icon: <Utensils className="w-6 h-6" />,
    description: "Храна която повишава тестостерона естествено",
    features: [
      "Готови рецепти за всеки ден",
      "Макро калкулатор за теб",
      "Списък за пазаруване"
    ],
    color: "green",
    accentColor: "border-green-500"
  },
  {
    id: 4,
    title: "Сън и възстановяване",
    icon: <Moon className="w-6 h-6" />,
    description: "80% от тестостерона се произвежда в съня",
    features: [
      "Sleep hygiene протокол",
      "Техники за по-дълбок сън",
      "Стратегии за възстановяване"
    ],
    color: "purple",
    accentColor: "border-purple-500"
  },
  {
    id: 5,
    title: "Дневен tracking",
    icon: <LineChart className="w-6 h-6" />,
    description: "Проследявай прогреса си всеки ден",
    features: [
      "Енергия, либидо, сън",
      "Тренировъчни показатели",
      "Subjective wellbeing"
    ],
    color: "cyan",
    accentColor: "border-cyan-500"
  },
  {
    id: 6,
    title: "VIP общност",
    icon: <Users className="w-6 h-6" />,
    description: "Telegram група с хиляди мъже на същия път",
    features: [
      "24/7 поддръжка от експерти",
      "Споделяне на резултати",
      "Мотивация и accountability"
    ],
    color: "pink",
    accentColor: "border-pink-500"
  }
];

export function TestographProSection() {
  const [activeModule, setActiveModule] = useState<number | null>(1);
  const [showHint, setShowHint] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Auto-advance on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        setMobileActiveIndex((prev) => (prev + 1) % protocolModules.length);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance on desktop - sequential 1-2-3-4-5-6
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) {
        setActiveModule((prev) => {
          const nextId = (prev || 0) + 1;
          return nextId > protocolModules.length ? 1 : nextId;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Target className="w-4 h-4 mr-2" />
            TestographPRO Протокол
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Не само капсули.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Пълна система за трансформация.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TestographPRO е твоят 30-дневен personalized план. Тренировки. Храна. Сън. Tracking. Всичко за да видиш резултати.
          </p>
        </div>

        {/* Compact Bubble Interface - Desktop & Mobile */}
        <div className="relative mb-12">
          {/* Desktop: Protocol with Vertical Numbers */}
          <div className="hidden md:block">
            <div className="relative flex items-center justify-between max-w-6xl mx-auto min-h-[700px] gap-12">
              {/* Left: Protocol Product - Larger */}
              <div className="relative w-[480px] h-[480px] flex-shrink-0">
                {/* Purple glow effect - vibrant */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-violet-500/30 to-fuchsia-500/30 blur-[80px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-transparent blur-3xl" />
                </div>
                {/* Product backdrop with purple tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl backdrop-blur-sm border border-purple-500/20 -z-5" />

                <Image
                  src="/product/STARTER - TestographPRO.webp"
                  alt="TestographPRO - 6 модула"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />
              </div>

              {/* Right: Vertical Numbers with Bubbles - Fixed width */}
              <div className="w-[450px] flex flex-col gap-5">
                {protocolModules.map((module, index) => {
                  const isActive = activeModule === module.id;

                  return (
                    <div key={module.id} className="relative flex items-center gap-4 min-h-[48px]">
                      {/* Connecting Line */}
                      {isActive && (
                        <div className="absolute right-full mr-4 w-16 h-0.5 bg-gradient-to-l from-primary to-transparent" />
                      )}

                      {/* Number Button - Fixed position */}
                      <button
                        onClick={() => setActiveModule(isActive ? null : module.id)}
                        className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? `bg-${module.color}-500 scale-110 shadow-xl ring-4 ring-${module.color}-300/50 border-${module.color}-400`
                            : "bg-primary/20 border-primary/40 hover:scale-105 hover:bg-primary/30"
                        }`}
                      >
                        <span className="text-sm font-black text-white">{module.id}</span>
                      </button>

                      {/* Expandable Bubble - Absolute positioning */}
                      <div className={`absolute left-16 transition-all duration-500 ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                      }`}>
                        {isActive && (
                          <Card className={`p-4 w-96 shadow-xl border-2 border-${module.color}-500 bg-card/95 backdrop-blur-sm`}>
                            <div className="flex items-start gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-xl bg-${module.color}-500 flex items-center justify-center text-white flex-shrink-0`}>
                                {module.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{module.title}</h4>
                                <p className="text-xs text-muted-foreground">{module.description}</p>
                              </div>
                            </div>

                            <ul className="space-y-1.5 text-xs">
                              {module.features.map((feature, idx) => (
                                <li key={idx} className="flex gap-2 items-start">
                                  <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Protocol + Auto-Carousel */}
          <div className="md:hidden">
            <div className="relative flex flex-col items-center">
              {/* Protocol Image */}
              <div className="relative w-64 h-64 mb-8">
                {/* Purple glow effect - vibrant */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-violet-500/30 to-fuchsia-500/30 blur-[60px] rounded-full animate-pulse" />
                </div>
                {/* Product backdrop with purple tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl backdrop-blur-sm border border-purple-500/20 -z-5" />

                <Image
                  src="/product/STARTER - TestographPRO.webp"
                  alt="TestographPRO - 6 модула"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />

                {/* Active Module Indicator */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl bg-${protocolModules[mobileActiveIndex].color}-500/20 flex items-center justify-center z-20`}>
                  <div className="text-primary text-xl">{protocolModules[mobileActiveIndex].icon}</div>
                </div>
              </div>

              {/* Auto Carousel Card */}
              <div className="w-full max-w-md">
                {protocolModules.map((module, index) => (
                  <Card
                    key={module.id}
                    className={`p-4 transition-all duration-500 ${
                      index === mobileActiveIndex
                        ? `opacity-100 scale-100 border-2 border-${module.color}-500`
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-${module.color}-500 flex items-center justify-center text-white flex-shrink-0`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {protocolModules.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setMobileActiveIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === mobileActiveIndex ? "bg-primary w-6" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Statement */}
        <div className="bg-gradient-to-br from-accent/10 via-primary/10 to-accent/10 border-2 border-accent/30 rounded-3xl p-8 md:p-10">
          <h3 className="text-2xl md:text-3xl font-black mb-8 text-center">
            Не само капсули.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              Пълна система за трансформация.
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">Ерекцията ти се връща</span>
            </div>

            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">+30% Тестостерон</span>
            </div>

            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">По-дълбок сън</span>
            </div>

            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">По-малко стрес</span>
            </div>

            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">Повече енергия</span>
            </div>

            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="font-semibold text-base">По-силно либидо и увереност</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
