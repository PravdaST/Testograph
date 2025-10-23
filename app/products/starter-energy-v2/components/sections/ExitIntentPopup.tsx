'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, ArrowRight, Mail, CheckCircle, Zap } from 'lucide-react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if popup was already shown
    const hasShown = sessionStorage.getItem('exitPopupShown');
    if (hasShown) return;

    let exitIntentTriggered = false;

    // Desktop: Mouse leave detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (exitIntentTriggered) return;

      // Trigger if mouse is leaving from top of viewport
      if (e.clientY <= 10 && e.movementY < 0) {
        exitIntentTriggered = true;
        setIsVisible(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Mobile: Detect scroll up near top
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (exitIntentTriggered) return;

      const currentScrollY = window.scrollY;

      // Trigger if user scrolls up quickly while near top (mobile exit intent)
      if (currentScrollY < 100 && lastScrollY > currentScrollY + 50) {
        exitIntentTriggered = true;
        setIsVisible(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }

      lastScrollY = currentScrollY;
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Here you would send email to your CRM/email service
    console.log('Exit Intent Email Captured:', email);

    // Close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        {!isSubmitted ? (
          <div className="p-8 md:p-12">
            {/* Alert Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 rounded-full px-6 py-3 animate-pulse">
                <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-bold text-red-600 dark:text-red-400">ИЗЧАКАЙ!</span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
              Преди да си тръгнеш...
            </h2>

            <p className="text-xl text-center text-neutral-600 dark:text-neutral-400 mb-8">
              Вземи <span className="font-bold text-primary">БЕЗПЛАТНО</span> нашия 7-дневен starter протокол
            </p>

            {/* Gift Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <Gift className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* What You Get */}
            <div className="mb-8 bg-gradient-to-br from-primary/5 to-blue-600/5 rounded-2xl p-6 border-2 border-primary/20">
              <p className="text-lg font-bold text-neutral-900 dark:text-white mb-4 text-center">
                Това което ще получиш:
              </p>

              <div className="space-y-3">
                {[
                  { icon: '💪', text: '7-дневен тренировъчен план (beginner-friendly)' },
                  { icon: '🍖', text: 'Списък с ТОП 20 храни за тестостерон' },
                  { icon: '😴', text: 'Протокол за оптимален сън (пълно възстановяване)' },
                  { icon: '⏰', text: 'Timing guide: Кога да ядеш, кога да тренираш' },
                  { icon: '📊', text: 'Tracking template (измерване на прогрес)' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <p className="text-neutral-700 dark:text-neutral-300 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Statement */}
            <div className="mb-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Стойност: <span className="line-through">47 лв</span>
              </p>
              <p className="text-3xl font-bold text-primary">БЕЗПЛАТНО</p>
              <p className="text-sm text-neutral-500 mt-1">Само за теб. Само днес.</p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Твоят имейл:
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="твоят@имейл.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Изпращане...</span>
                ) : (
                  <>
                    <span>Изпрати Ми Протокола</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>

            {/* Trust Line */}
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-600 mt-4">
              ✓ Без спам • ✓ Отпиши се всеки момент • ✓ 100% безплатно
            </p>

            {/* Urgency */}
            <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                ⚠️ Това предложение изтича след {Math.floor(Math.random() * 3) + 3} минути
              </p>
            </div>
          </div>
        ) : (
          // Success State
          <div className="p-8 md:p-12 text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              ГОТОВО! ✓
            </h2>

            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
              Проверим имейла си за протокола.
            </p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                Изпратихме ти:
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                ✓ 7-дневен протокол<br />
                ✓ ТОП 20 храни за тестостерон<br />
                ✓ Сън optimization guide<br />
                ✓ Timing & tracking templates
              </p>
            </div>

            <p className="text-sm text-neutral-500 mt-6">
              Не виждаш имейла? Провери spam/промоции папката.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
