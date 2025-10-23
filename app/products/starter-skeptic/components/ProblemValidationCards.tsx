"use client";

import { useState } from "react";
import { skepticCopy } from "../copy/skeptic-copy";

export function ProblemValidationCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
            {skepticCopy.problemValidation.sectionHeadline}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground">
            {skepticCopy.problemValidation.subheadline}
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mb-12">
          {skepticCopy.problemValidation.problems.map((problem, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-2xl -z-10" />

              {/* Card */}
              <div className="relative h-full bg-card border-2 border-border/50 rounded-2xl p-6 md:p-8 space-y-4 hover:border-red-500/30 hover:shadow-2xl transition-all duration-300">
                {/* Icon */}
                <div className="text-5xl md:text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {problem.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>

                {/* Proof Badge */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {problem.proof}
                    </p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full bg-red-500 transition-all duration-300 ${
                  hoveredIndex === index ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Transition Copy - Validation Message */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-2 border-slate-400/30 rounded-2xl p-6 md:p-8 text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              {skepticCopy.problemValidation.transitionCopy}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-base sm:text-lg text-teal-600 dark:text-teal-400 font-semibold">
                Ето защо TESTOGRAPH е различен ↓
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
