'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, AlertCircle, X } from 'lucide-react';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [stockLeft, setStockLeft] = useState(47);

  useEffect(() => {
    // Check if user dismissed the bar
    const dismissed = sessionStorage.getItem('floatingCTADismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show after scrolling 50% of viewport
      const shouldShow = scrollPosition > windowHeight * 0.5;

      // Hide when in pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        const pricingRect = pricingSection.getBoundingClientRect();
        const isInPricing = pricingRect.top < windowHeight && pricingRect.bottom > 0;

        setIsVisible(shouldShow && !isInPricing);
      } else {
        setIsVisible(shouldShow);
      }
    };

    // Initial check
    handleScroll();

    // Listen to scroll
    window.addEventListener('scroll', handleScroll);

    // Simulate stock decrease
    const stockTimer = setInterval(() => {
      setStockLeft(prev => Math.max(35, prev - Math.floor(Math.random() * 2)));
    }, 300000); // Every 5 minutes

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(stockTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('floatingCTADismissed', 'true');
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToQuiz = () => {
    const element = document.getElementById('quiz');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isDismissed || !isVisible) return null;

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border-t-2 border-primary/30 shadow-2xl backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-6">

              {/* Left: Urgency Message */}
              <div className="flex items-center gap-4">
                {/* Scarcity Badge */}
                <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/40 rounded-full px-4 py-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold text-red-400 whitespace-nowrap">
                    Само {stockLeft} бр останали
                  </span>
                </div>

                {/* Main Message */}
                <div>
                  <p className="text-white font-bold text-lg">
                    Готов ли си за промяна?
                  </p>
                  <p className="text-neutral-400 text-sm">
                    127 мъже вече започнаха • 94% виждат резултати
                  </p>
                </div>
              </div>

              {/* Right: CTA Buttons */}
              <div className="flex items-center gap-3">
                {/* Quiz CTA */}
                <button
                  onClick={scrollToQuiz}
                  className="group flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Безплатен Тест</span>
                </button>

                {/* Pricing CTA */}
                <button
                  onClick={scrollToPricing}
                  className="group flex items-center gap-2 bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg hover:shadow-primary/50"
                >
                  <span>Виж Пакетите</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Dismiss Button */}
                <button
                  onClick={handleDismiss}
                  className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-t-2 border-primary/30 shadow-2xl backdrop-blur-lg">
          <div className="px-4 py-3">

            {/* Scarcity Message */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/40 rounded-full px-3 py-1.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-400">
                  Само {stockLeft} бр
                </span>
              </div>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={scrollToQuiz}
                className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Тест</span>
              </button>

              <button
                onClick={scrollToPricing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95"
              >
                <span>Пакети</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Line */}
            <p className="text-xs text-neutral-400 text-center mt-2">
              94% успех • 30 дни гаранция
            </p>
          </div>
        </div>

        {/* Safe Area Padding for Mobile */}
        <div className="h-safe-area-inset-bottom bg-neutral-900" />
      </div>
    </>
  );
}
