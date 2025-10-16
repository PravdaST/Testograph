"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function SolutionTimeline() {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const phases = [
    {
      days: "Ден 1-7",
      title: "Първата седмица",
      subtitle: "Започваш пътуването",
      description: "Започваш да вземаш 2 капсули дневно. Първите дни може да не почувстваш нищо - нормално е.",
      results: ["Около ден 5-6 - първи признаци на енергия сутрин", "По-добър сън в края на седмицата"],
      gradient: "from-emerald-600 via-green-500 to-teal-600",
      glowColor: "from-emerald-500/20 to-teal-500/20",
      badgeGradient: "from-emerald-400 to-teal-500",
    },
    {
      days: "Ден 8-21",
      title: "Почваш да се чувстваш различен",
      subtitle: "Истинската промяна започва",
      description: "Тук започва истинската промяна. Хормоните реагират. Усещаш го.",
      results: [
        "Ставаш без 3 кафета - шокиращо е",
        "Тренировките - вдигаш повече, възстановяваш се по-бързо",
        "Сънят - дълбок, качествен, събуждаш се fresh",
      ],
      gradient: "from-blue-600 via-cyan-500 to-indigo-600",
      glowColor: "from-blue-500/20 to-indigo-500/20",
      badgeGradient: "from-blue-400 to-indigo-500",
    },
    {
      days: "Ден 22-30",
      title: "Ето го! Това е.",
      subtitle: "Новият ти живот",
      description: "Промяната е очевидна. Чувстваш се като преди години. Хората забелязват.",
      results: [
        "Либидото - връща се. Като на 25.",
        "Мускулите - растат. Най-накрая.",
        "Увереността - на върха. Забелязваш в огледалото.",
        "Общо усещане - \"Това съм АЗ. Върнах се.\"",
      ],
      gradient: "from-purple-600 via-violet-500 to-fuchsia-600",
      glowColor: "from-purple-500/20 to-fuchsia-500/20",
      badgeGradient: "from-purple-400 to-fuchsia-500",
    },
  ];

  // Auto-cycle through phases for preview
  useEffect(() => {
    const interval = setInterval(() => {
      setHoveredPhase((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % phases.length;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes timeline-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(20px) translateY(-15px); }
        }
        @keyframes timeline-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(15px); }
        }
        @keyframes timeline-drift-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-timeline-drift { animation: timeline-drift 24s ease-in-out infinite; }
        .animate-timeline-drift-reverse { animation: timeline-drift-reverse 28s ease-in-out infinite; }
        .animate-timeline-drift-slow { animation: timeline-drift-slow 20s ease-in-out infinite; }
      `}} />

      {/* Animated SVG Background Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="timeline-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="timeline-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="timeline-gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Wave 1 - Top flowing */}
        <path
          d="M -100 150 Q 300 100, 600 180 T 1300 150"
          stroke="url(#timeline-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-timeline-drift"
        />

        {/* Wave 2 - Middle crossing */}
        <path
          d="M 1400 350 Q 1000 300, 700 380 T 0 350"
          stroke="url(#timeline-gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-timeline-drift-reverse"
        />

        {/* Wave 3 - Bottom wave */}
        <path
          d="M -50 550 Q 350 600, 700 520 T 1450 600"
          stroke="url(#timeline-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-timeline-drift"
        />

        {/* Circle accent 1 */}
        <circle
          cx="250"
          cy="280"
          r="90"
          stroke="url(#timeline-gradient3)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Circle accent 2 */}
        <circle
          cx="1050"
          cy="480"
          r="110"
          stroke="url(#timeline-gradient2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Vertical flowing line */}
        <path
          d="M 650 -50 Q 600 200, 700 400 T 650 750"
          stroke="url(#timeline-gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-timeline-drift-slow"
        />
      </svg>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 px-2">
            Какво ще почувстваш в{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              първите 30 дни
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Реална timeline от реални мъже. Без BS. Без преувеличения.
          </p>
        </div>

        {/* Circular Timeline Steps - Centered */}
        <div className="relative max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12">
          {/* Connecting Lines between circles */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 hidden md:block">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 opacity-30 rounded-full" />
          </div>

          {/* Circular Buttons */}
          <div className="relative flex justify-center items-center gap-6 sm:gap-8 md:gap-20 lg:gap-32">
            {phases.map((phase, index) => {
              const isHovered = hoveredPhase === index;

              return (
                <div key={index} className="flex flex-col items-center gap-3 sm:gap-4">
                  {/* Circular Button */}
                  <button
                    onClick={() => setActivePhase(index)}
                    onMouseEnter={() => setHoveredPhase(index)}
                    onMouseLeave={() => setHoveredPhase(null)}
                    className="relative group"
                  >
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${phase.glowColor} blur-2xl transition-opacity duration-500 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`} />

                    {/* Main circle - Mobile optimized */}
                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/20 transition-all duration-300 active:scale-95 ${
                      isHovered ? "scale-110" : "scale-100"
                    }`}>
                      {/* Inner gradient shine */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

                      {/* Number - Mobile optimized */}
                      <span className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl">
                        {index + 1}
                      </span>

                      {/* Sparkle effect on hover */}
                      {isHovered && (
                        <Sparkles className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white animate-pulse" />
                      )}
                    </div>

                    {/* Pulse ring animation */}
                    {isHovered && (
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${phase.gradient} animate-ping opacity-20`} />
                    )}
                  </button>

                  {/* Days Label - Mobile optimized */}
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${phase.badgeGradient} border-2 border-white/30 shadow-lg transition-all duration-300 ${
                    isHovered ? "scale-105" : "scale-100"
                  }`}>
                    <p className="text-[10px] sm:text-xs md:text-sm font-black text-white drop-shadow whitespace-nowrap">
                      {phase.days}
                    </p>
                  </div>

                  {/* Title - shows on hover - Mobile optimized */}
                  <div className={`text-center transition-all duration-300 px-1 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}>
                    <p className="text-xs sm:text-sm md:text-base font-bold leading-tight">{phase.title}</p>
                    <p className="text-[10px] sm:text-xs text-primary font-semibold">{phase.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Click hint - Mobile optimized */}
          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 sm:mt-8 animate-pulse px-4">
            Кликни на стъпка за повече детайли
          </p>
        </div>

        {/* Dialog Popup */}
        <Dialog open={activePhase !== null} onOpenChange={() => setActivePhase(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {activePhase !== null && (
              <div className="space-y-4 sm:space-y-6">
                {/* Header with gradient - Mobile optimized */}
                <div className={`relative rounded-xl sm:rounded-2xl bg-gradient-to-br ${phases[activePhase].gradient} p-4 sm:p-6 overflow-hidden`}>
                  {/* Number badge - Mobile optimized */}
                  <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${phases[activePhase].badgeGradient} flex items-center justify-center shadow-xl border-2 border-white/30`}>
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg">{activePhase + 1}</span>
                  </div>

                  {/* Days - Mobile optimized */}
                  <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm font-black text-white tracking-wide drop-shadow">
                      {phases[activePhase].days}
                    </span>
                  </div>

                  {/* Title & Subtitle - Mobile optimized */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg leading-tight">
                    {phases[activePhase].title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 font-semibold drop-shadow">
                    {phases[activePhase].subtitle}
                  </p>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                </div>

                {/* Description - Mobile optimized */}
                <div className="px-1 sm:px-2">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {phases[activePhase].description}
                  </p>
                </div>

                {/* Results - Mobile optimized */}
                <div className="px-1 sm:px-2">
                  <h4 className="font-bold text-base sm:text-lg uppercase tracking-wide text-foreground mb-3 sm:mb-4">
                    Какво очакваш:
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {phases[activePhase].results.map((result, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base leading-snug">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Final Message - Enhanced */}
        <div className="mt-6 sm:mt-8 md:mt-10 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 blur-2xl rounded-2xl sm:rounded-3xl" />

          <div className="relative text-center bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-primary/30 shadow-xl">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              30 дни. Толкова.
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto font-semibold px-4">
              Не години. Не скъпи клиники. Не "магически" хапчета. Просто TestoUP + протокол. Работи.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
