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
    },
    {
      question: "Защо не мога да намеря тези неща безплатно в интернет?",
      answer: "Можеш. Ще прекараш 6 месеца да четеш противоречива информация и да не знаеш на кого да вярваш. Или плащаш 197 лв и имаш точния план какво да правиш + 24/7 поддръжка и наставления по целия път. Твой е изборът."
    },
    {
      question: tier !== "digital" ? "Мога ли да взема само добавката без плана?" : "Мога ли да добавя добавката по-късно?",
      answer: tier !== "digital"
        ? "Не. Добавката без план е като да си купиш кола без бензин. Двете работят заедно. Трябват ти И двете."
        : "Да. Много мъже започват с плана, виждат че работи, после взимат добавката. Разбирам че 47 лв е по-лесно да пробваш."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
          Въпроси?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Отговори на най-честите съмнения
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left hover:bg-accent/50 transition-colors"
            >
              <span className="text-base md:text-lg font-semibold text-foreground pr-4">
                {faq.question}
              </span>
              <div className="flex-shrink-0">
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {openIndex === index && (
              <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm md:text-base text-muted-foreground">
          Друг въпрос? Питай в плана. Отговарям в рамките на 24ч.
        </p>
      </div>
    </div>
  );
};
