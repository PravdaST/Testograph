"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export function SolutionTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const phases = [
    {
      days: "Ден 1-7",
      title: "Първата седмица",
      subtitle: "Започваш пътуването",
      description: "Започваш да вземаш 2 капсули дневно. Първите дни може да не почувстваш нищо - нормално е.",
      results: ["Около ден 5-6 - първи признаци на енергия сутрин", "По-добър сън в края на седмицата"],
      gradient: "from-slate-700 via-slate-600 to-slate-700",
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
      gradient: "from-zinc-700 via-zinc-600 to-zinc-700",
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
      gradient: "from-neutral-800 via-neutral-700 to-neutral-800",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
      );
    }
  };

  return (
    <section className="py-12 md:py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3">
            Какво ще почувстваш в{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              първите 30 дни
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Реална timeline от реални мъже. Без BS. Без преувеличения.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Navigation Arrows - Desktop Only */}
          <button
            onClick={() => scroll("left")}
            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background border-2 border-border shadow-xl items-center justify-center transition-all hover:scale-110 ${
              !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background border-2 border-border shadow-xl items-center justify-center transition-all hover:scale-110 ${
              !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 md:gap-8 overflow-x-auto pb-6 px-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {phases.map((phase, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] snap-center"
              >
                {/* Card */}
                <div className="relative h-full bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                  {/* Gradient Header */}
                  <div className={`relative h-24 bg-gradient-to-br ${phase.gradient} p-6 overflow-hidden`}>
                    {/* Phase Number Badge */}
                    <div className="absolute top-4 right-4 w-14 h-14 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <span className="text-3xl font-black text-white">{index + 1}</span>
                    </div>

                    {/* Days Badge */}
                    <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                      <span className="text-sm font-bold text-white tracking-wide">{phase.days}</span>
                    </div>

                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-black mb-1">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-primary font-semibold mb-3">
                      {phase.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {phase.description}
                    </p>

                    {/* Results List */}
                    <div className="space-y-2">
                      <p className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
                        Какво очакваш:
                      </p>
                      <ul className="space-y-2">
                        {phase.results.map((result, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {index < phases.length - 1 && (
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden md:block">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-border to-transparent" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Dots - Mobile */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {phases.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-muted"
              />
            ))}
          </div>
        </div>

        {/* Final Message */}
        <div className="mt-10 md:mt-12 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8 border-2 border-primary/30">
          <p className="text-2xl md:text-3xl font-black mb-2">
            30 дни. Толкова.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Не години. Не скъпи клиники. Не "магически" хапчета. Просто TestoUP + протокол. Работи.
          </p>
        </div>
      </div>
    </section>
  );
}
