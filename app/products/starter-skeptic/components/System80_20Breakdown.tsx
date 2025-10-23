"use client";

import { ArrowRight } from "lucide-react";
import { skepticCopy } from "../copy/skeptic-copy";

export function System80_20Breakdown() {
  const scrollToValueStack = () => {
    const element = document.getElementById('value-stack');
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="system" className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-background via-teal-500/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
            {skepticCopy.systemBreakdown.sectionHeadline}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground">
            {skepticCopy.systemBreakdown.introduction}
          </p>
        </div>

        {/* Main 80/20 Visual */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* 80% - Protocols (Takes 4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/50 rounded-3xl p-6 md:p-8 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">
                    80%
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mt-2">
                    {skepticCopy.systemBreakdown.eightyPercent.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground mt-1">
                    {skepticCopy.systemBreakdown.eightyPercent.subtitle}
                  </p>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
                    +420 ng/dL
                  </div>
                  <p className="text-sm text-muted-foreground">средно boost</p>
                </div>
              </div>

              {/* Protocols Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {skepticCopy.systemBreakdown.eightyPercent.protocols.map((protocol, index) => (
                  <div
                    key={index}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">
                        {protocol.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-foreground mb-1">
                          {protocol.name}
                        </h4>
                        <p className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-2">
                          {protocol.impact}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {protocol.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Impact */}
              <div className="mt-6 pt-6 border-t-2 border-teal-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-foreground">Общ ефект от протоколите:</p>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">
                    {skepticCopy.systemBreakdown.eightyPercent.totalImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 20% - Supplement (Takes 1 column) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/50 rounded-3xl p-6 shadow-xl h-full flex flex-col">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                  20%
                </div>
                <h3 className="text-xl md:text-2xl font-black text-foreground mt-2">
                  {skepticCopy.systemBreakdown.twentyPercent.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {skepticCopy.systemBreakdown.twentyPercent.subtitle}
                </p>
              </div>

              {/* Impact */}
              <div className="text-center mb-4">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {skepticCopy.systemBreakdown.twentyPercent.impact}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {skepticCopy.systemBreakdown.twentyPercent.description}
              </p>

              {/* Key Point - Warning */}
              <div className="mt-auto bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-relaxed">
                  {skepticCopy.systemBreakdown.twentyPercent.keyPoint}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: Typical vs TESTOGRAPH */}
        <div className="bg-card border-2 border-border/50 rounded-3xl p-6 md:p-10 shadow-2xl mb-12">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-8">
            {skepticCopy.systemBreakdown.comparison.title}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Typical Supplement - FAILED */}
            <div className="relative">
              {/* Cross-out line */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-full h-1.5 bg-red-500 rounded-full rotate-[-12deg] shadow-lg"></div>
              </div>

              <div className="bg-red-500/5 border-2 border-red-500/30 rounded-2xl p-6 opacity-60">
                <h4 className="text-xl font-black text-red-600 dark:text-red-400 mb-3">
                  {skepticCopy.systemBreakdown.comparison.typical.label}
                </h4>
                <p className="text-base font-mono text-muted-foreground mb-3">
                  {skepticCopy.systemBreakdown.comparison.typical.formula}
                </p>
                <div className="h-3 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-[20%] bg-red-500 rounded-full"></div>
                </div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-3">
                  {skepticCopy.systemBreakdown.comparison.typical.result}
                </p>
              </div>
            </div>

            {/* TESTOGRAPH System - SUCCESS */}
            <div className="relative">
              {/* Success Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-1.5 text-sm font-black shadow-lg animate-pulse z-10">
                ✓ Работи
              </div>

              <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border-2 border-teal-500/50 rounded-2xl p-6 shadow-xl">
                <h4 className="text-xl font-black text-teal-600 dark:text-teal-400 mb-3">
                  {skepticCopy.systemBreakdown.comparison.testograph.label}
                </h4>
                <p className="text-base font-mono text-muted-foreground mb-3">
                  {skepticCopy.systemBreakdown.comparison.testograph.formula}
                </p>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-teal-500/20 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                  </div>
                  <div className="h-3 bg-blue-500/20 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {skepticCopy.systemBreakdown.comparison.testograph.result}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={scrollToValueStack}
            className="group relative px-8 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {skepticCopy.systemBreakdown.ctaButton}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            214 лв стойност → 67 лв днес | 30-дневна гаранция
          </p>
        </div>
      </div>
    </section>
  );
}
