"use client";

import { ShoppingCart, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Поръчваш сега",
      description: "Кликваш бутона, попълваш детайли, избираш начин на плащане.",
      detail: "Пакетът пристига за 2-3 работни дни",
      icon: ShoppingCart,
      gradient: "from-emerald-500 to-teal-600",
      glowColor: "from-emerald-500/20 to-teal-500/20",
    },
    {
      number: "2",
      title: "Следваш протокола",
      description: "Всеки ден получаваш точни инструкции какво да правиш.",
      detail: "Храна, тренировки, добавки - всичко е планирано",
      icon: BookOpen,
      gradient: "from-blue-500 to-indigo-600",
      glowColor: "from-blue-500/20 to-indigo-500/20",
    },
    {
      number: "3",
      title: "Виждаш резултати",
      description: "След 14-30 дни усещаш промяната - повече енергия, сила, либидо.",
      detail: "Това е само началото",
      icon: TrendingUp,
      gradient: "from-purple-500 to-fuchsia-600",
      glowColor: "from-purple-500/20 to-fuchsia-500/20",
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes howitworks-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(-20px); }
        }
        @keyframes howitworks-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(20px); }
        }
        @keyframes howitworks-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .animate-howitworks-drift { animation: howitworks-drift 28s ease-in-out infinite; }
        .animate-howitworks-drift-reverse { animation: howitworks-drift-reverse 32s ease-in-out infinite; }
        .animate-howitworks-float { animation: howitworks-float 24s ease-in-out infinite; }
      `}} />

      {/* Animated SVG Background Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="howitworks-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="howitworks-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="howitworks-gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Wave 1 */}
        <path
          d="M -100 180 Q 300 130, 600 200 T 1300 160"
          stroke="url(#howitworks-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-howitworks-drift"
        />

        {/* Wave 2 */}
        <path
          d="M 1400 380 Q 1000 330, 700 410 T 0 360"
          stroke="url(#howitworks-gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-howitworks-drift-reverse"
        />

        {/* Wave 3 */}
        <path
          d="M -50 600 Q 350 650, 700 570 T 1450 630"
          stroke="url(#howitworks-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-howitworks-drift"
        />

        {/* Circles */}
        <circle
          cx="220"
          cy="320"
          r="95"
          stroke="url(#howitworks-gradient3)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        <circle
          cx="1080"
          cy="520"
          r="115"
          stroke="url(#howitworks-gradient2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Vertical wave */}
        <path
          d="M 680 -50 Q 630 220, 730 450 T 680 800"
          stroke="url(#howitworks-gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-howitworks-float"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 px-2">
            Толкова лесно е,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500">
              че не можеш да сгрешиш
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            3 прости стъпки до новия ти живот
          </p>
        </div>

        {/* Steps Grid with Connecting Arrows */}
        <div className="relative">
          {/* Connecting Arrows - Desktop Only */}
          <div className="hidden md:block">
            {/* Arrow 1 to 2 */}
            <div className="absolute top-1/2 left-[33%] -translate-y-1/2 z-0">
              <ArrowRight className="w-8 h-8 text-emerald-500/30" />
            </div>
            {/* Arrow 2 to 3 */}
            <div className="absolute top-1/2 left-[66%] -translate-y-1/2 z-0">
              <ArrowRight className="w-8 h-8 text-blue-500/30" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg border-2 border-border hover:border-primary/50 transition-all duration-500 active:scale-[0.98] sm:hover:scale-105 hover:shadow-2xl"
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                  {/* Step Number Badge - Enhanced with gradient - Mobile optimized */}
                  <div className={`absolute -top-4 sm:-top-5 md:-top-6 left-4 sm:left-5 md:left-6 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 border-2 border-white/20`}>
                    <span className="text-xl sm:text-xl md:text-2xl font-black text-white drop-shadow-lg">{step.number}</span>
                  </div>

                  {/* Icon Badge - Mobile optimized */}
                  <div className="flex justify-end mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>

                  {/* Content - Mobile optimized */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 md:mt-6 group-hover:text-primary transition-colors leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2.5 sm:mb-3 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Detail Badge - Mobile optimized */}
                  <div className={`inline-block bg-gradient-to-br ${step.gradient} px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg`}>
                    <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
                      {step.detail}
                    </p>
                  </div>

                  {/* Bottom colored bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r ${step.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl sm:rounded-b-2xl`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Reassurance - Enhanced */}
        <div className="mt-8 sm:mt-10 md:mt-12 relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 blur-2xl rounded-xl sm:rounded-2xl" />

          <div className="relative bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center border-2 border-border/50 shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="ease-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ease-pattern)" />
              </svg>
            </div>

            <div className="relative z-10">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-2 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
                Не се изисква опит, диета или часове в залата
              </p>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-semibold px-4">
                Просто следваш указанията. Всичко е направено да е лесно.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
