"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

interface Benefit {
  id: number;
  title: string;
  description: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: "Ерекцията ти се връща",
    description: "Естествено подобрение на кръвообращението и еректилната функция",
    color: "green",
  },
  {
    id: 2,
    title: "+30% Тестостерон",
    description: "Клинично доказано повишаване на тестостерона за 8-12 седмици",
    color: "blue",
  },
  {
    id: 3,
    title: "По-дълбок сън",
    description: "Подобрено качество на съня и по-бързо заспиване",
    color: "purple",
  },
  {
    id: 4,
    title: "По-малко стрес",
    description: "Намален кортизол и по-добро управление на стреса",
    color: "orange",
  },
  {
    id: 5,
    title: "Повече енергия",
    description: "Устойчива енергия през целия ден без кафе",
    color: "yellow",
  },
  {
    id: 6,
    title: "По-силно либидо и увереност",
    description: "Връщане на сексуалното желание и мъжката увереност",
    color: "red",
  },
];

export function BenefitsSection() {
  const [activeBenefit, setActiveBenefit] = useState<number | null>(1);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Auto-advance on desktop - sequential 1-6
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) {
        setActiveBenefit((prev) => {
          const nextId = (prev || 0) + 1;
          return nextId > benefits.length ? 1 : nextId;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance on mobile - sequential 0-5
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        setMobileActiveIndex((prev) => (prev + 1) % benefits.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes benefits-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-20px); }
        }
        @keyframes benefits-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-30px) translateY(20px); }
        }
        @keyframes benefits-drift-vertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(30px); }
        }
        .animate-benefits-drift { animation: benefits-drift 20s ease-in-out infinite; }
        .animate-benefits-drift-reverse { animation: benefits-drift-reverse 25s ease-in-out infinite; }
        .animate-benefits-drift-vertical { animation: benefits-drift-vertical 22s ease-in-out infinite; }
        .animate-benefits-drift-18 { animation: benefits-drift 18s ease-in-out infinite; }
      `}} />
        {/* Animated SVG Background Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Curved line 1 - Top left flowing */}
        <path
          d="M -50 100 Q 200 50, 400 150 T 800 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-benefits-drift"
        />

        {/* Curved line 2 - Middle diagonal */}
        <path
          d="M 1200 200 Q 900 400, 600 450 T 0 500"
          stroke="url(#gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-benefits-drift-reverse"
        />

        {/* Curved line 3 - Bottom flowing */}
        <path
          d="M -100 600 Q 300 650, 600 550 T 1400 700"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-benefits-drift-18"
        />

        {/* Circle accent 1 */}
        <circle
          cx="150"
          cy="250"
          r="80"
          stroke="url(#gradient3)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Circle accent 2 */}
        <circle
          cx="1100"
          cy="450"
          r="120"
          stroke="url(#gradient2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Curved line 4 - Cross pattern */}
        <path
          d="M 800 -50 Q 750 200, 850 400 T 900 700"
          stroke="url(#gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-benefits-drift-vertical"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Не само капсули.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Пълна система за трансформация.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TestoUP + TestographPRO = Доказани резултати в 6 ключови области
          </p>
        </div>

        {/* Desktop: Product with Vertical Numbers */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between max-w-6xl mx-auto min-h-[700px] gap-12">
            {/* Left: Product - Larger */}
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
                alt="TestographPRO - Пълна система за трансформация"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
                priority
              />
            </div>

            {/* Right: Vertical Numbers with Benefits - Fixed width */}
            <div className="w-[450px] flex flex-col gap-5">
              {benefits.map((benefit) => {
                const isActive = activeBenefit === benefit.id;

                return (
                  <div key={benefit.id} className="relative flex items-center gap-4 min-h-[48px]">
                    {/* Connecting Line */}
                    {isActive && (
                      <div className="absolute right-full mr-4 w-16 h-0.5 bg-gradient-to-l from-primary to-transparent" />
                    )}

                    {/* Number Button - Fixed position */}
                    <button
                      onClick={() => setActiveBenefit(isActive ? null : benefit.id)}
                      className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? `bg-${benefit.color}-500 scale-110 shadow-xl ring-4 ring-${benefit.color}-300/50 border-${benefit.color}-400`
                          : "bg-primary/20 border-primary/40 hover:scale-105 hover:bg-primary/30"
                      }`}
                    >
                      <span className="text-sm font-black text-white">{benefit.id}</span>
                    </button>

                    {/* Expandable Benefit Card - Absolute positioning */}
                    <div className={`absolute left-16 transition-all duration-500 ${
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}>
                      {isActive && (
                        <Card className={`p-4 w-96 shadow-xl border-2 border-${benefit.color}-500 bg-card/95 backdrop-blur-sm`}>
                          <div className="flex items-start gap-3">
                            <CheckCircle className={`w-8 h-8 text-${benefit.color}-500 flex-shrink-0 mt-1`} />
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                              <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Product with Numbers in Two Columns */}
        <div className="md:hidden">
          <div className="relative flex flex-col items-center">
            {/* Product with numbers around it AND benefit overlay in center */}
            <div className="relative w-72 h-72 mb-8">
              {/* Purple glow effect - vibrant */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-violet-500/30 to-fuchsia-500/30 blur-[60px] rounded-full animate-pulse" />
              </div>
              {/* Product backdrop with purple tint */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl backdrop-blur-sm border border-purple-500/20 -z-5" />

              <Image
                src="/product/STARTER - TestographPRO.webp"
                alt="TestographPRO - Пълна система за трансформация"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
                priority
              />

              {/* Centered Benefit Card OVERLAY - Above product, below numbers */}
              <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
                {benefits.map((benefit, index) => (
                  <Card
                    key={benefit.id}
                    className={`p-4 w-full max-w-[260px] transition-all duration-500 ${
                      index === mobileActiveIndex
                        ? `opacity-100 scale-100 border-2 border-${benefit.color}-500 shadow-2xl`
                        : "opacity-0 scale-90 absolute inset-0 pointer-events-none"
                    } bg-card/95 backdrop-blur-md`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`w-7 h-7 text-${benefit.color}-500 flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <h4 className="font-bold text-base mb-2 leading-tight">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground leading-snug">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* All 6 numbers around product - Higher z-index to be above bubble */}
              {benefits.map((benefit, index) => {
                // Vertical alignment in two columns (left and right) - outside the frame
                const positions = [
                  { top: "10%", left: "-15%" },   // 1 - left
                  { top: "10%", right: "-15%" },  // 2 - right
                  { top: "40%", left: "-15%" },   // 3 - left
                  { top: "40%", right: "-15%" },  // 4 - right
                  { top: "70%", left: "-15%" },   // 5 - left
                  { top: "70%", right: "-15%" }   // 6 - right
                ];
                const isActive = index === mobileActiveIndex;

                return (
                  <button
                    key={benefit.id}
                    onClick={() => setMobileActiveIndex(index)}
                    className={`absolute w-10 h-10 rounded-xl border-2 transition-all duration-300 flex items-center justify-center z-30 ${
                      isActive
                        ? `bg-${benefit.color}-500 scale-125 shadow-xl ring-2 ring-${benefit.color}-300/50 border-${benefit.color}-400`
                        : "bg-primary/30 border-primary/50 hover:scale-110"
                    }`}
                    style={positions[index]}
                  >
                    <span className="text-sm font-black text-white">{benefit.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress Dots - Below product */}
            <div className="flex justify-center gap-2">
              {benefits.map((_, index) => (
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
    </section>
  );
}
