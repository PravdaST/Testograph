"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  tier: "premium" | "regular" | "digital";
}

export const FAQSection = ({ tier }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "Колко време трае докато видя резултат?",
      answer: "След 30 дни можеш да очакваш добри резултати. Зависи колко строго следваш плана."
    },
    {
      question: "Работи ли наистина или е поредната измама?",
      answer: "2,847 мъже вече са в програмата. 94% виждат резултат. Ако не проработи - връщам ти парите. Гарантирам го."
    },
    {
      question: "Безопасно ли е? Има ли странични ефекти?",
      answer: "100% естествени съставки. Без химия, без хормони. Само компоненти, които тялото ти използва за да произвежда собствен тестостерон. Ако имаш здравословни проблеми - питай лекаря си."
    },
    {
      question: "Защо не просто да отида на лекар за TRT?",
      answer: "TRT = доживотна зависимост + спиране на собственото производство. Тази система учи тялото ти да произвежда собствен тестостерон. Без игли. Без зависимост."
    },
    {
      question: "Ще ми трябва време всеки ден?",
      answer: "Да, ще трябва да посветиш време - хранене, тренировки, сън. Но всичко е ясно структурирано. Следваш стъпките, виждаш резултата. Не е сложно, просто изисква съзнателно отношение."
    },
    {
      question: "Какво ако не съм доволен?",
      answer: "Ако тестостеронът ти не се повиши при следване на протокола - връщаме ти парите. 30 дни гаранция."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes faq-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(20px) translateY(-18px); }
        }
        @keyframes faq-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(18px); }
        }
        @keyframes faq-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-22px); }
        }
        .animate-faq-drift { animation: faq-drift 25s ease-in-out infinite; }
        .animate-faq-drift-reverse { animation: faq-drift-reverse 29s ease-in-out infinite; }
        .animate-faq-float { animation: faq-float 23s ease-in-out infinite; }
      `}} />

      {/* Animated SVG Background Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="faq-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="faq-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path
          d="M -80 120 Q 250 80, 550 140 T 1200 100"
          stroke="url(#faq-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-faq-drift"
        />

        <path
          d="M 1300 280 Q 900 240, 600 300 T 0 260"
          stroke="url(#faq-gradient2)"
          strokeWidth="2"
          fill="none"
          className="animate-faq-drift-reverse"
        />

        <circle
          cx="180"
          cy="200"
          r="70"
          stroke="url(#faq-gradient1)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        <path
          d="M 600 -30 Q 560 150, 640 300 T 600 500"
          stroke="url(#faq-gradient2)"
          strokeWidth="2"
          fill="none"
          className="animate-faq-float"
        />
      </svg>

      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-center mb-6 sm:mb-8 px-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Често задавани въпроси
          </span>
        </h3>

        {/* 2 Column Grid - 3x3 */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group relative bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-lg sm:rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between gap-2 sm:gap-3 p-4 sm:p-5 text-left hover:bg-accent/20 transition-colors"
              >
                <span className="text-xs sm:text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/30">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-center text-muted-foreground mt-6 sm:mt-8 font-semibold px-4">
          Друг въпрос? Питай в плана - отговарям в рамките на 24ч.
        </p>
      </div>
    </div>
  );
};
