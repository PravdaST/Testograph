'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircleQuestion } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function FAQV2() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Мога ли да закупя само добавката, без приложението?',
      answer: 'НЕ.\n\nИ ето защо: Добавката е 20% от формулата. Искаш да платиш за 20% и да очакваш 100% резултати?\n\nGo ahead. Купи креатин от iHerb за 35 лв. За 30 дни ела кажи дали се промени НЕЩО освен че пълниш мускули с вода.\n\nНие продаваме СИСТЕМА защото само системата работи. Искаш само хапчета без план? Това НЕ е за теб. Има 100 други места където да купиш хапчета.'
    },
    {
      question: 'Колко бързо ще видя резултати?',
      answer: 'ЗАВИСИ.\n\nАко следваш системата 100%:\n• 7-14 дни: Енергия, сън, либидо (+15-25%)\n• 30 дни: Сила +8-12%, работоспособност, настроение\n• 90 дни: Пълна трансформация\n\nАко НЕ следваш системата и вземаш само хапчетата?\nНЯМА да видиш нищо. Защото хапчетата са 20%.\n\nНе сме тук да ти обещаваме чудеса. Работи ли? ДА. Ще ти е лесно? НЕ. Трябва да работиш.'
    },
    {
      question: 'Безопасна ли е добавката?',
      answer: 'ДА. 100% безопасна.\n\n✓ 100% натурални съставки (без химия)\n✓ БАБХ регистрация\n✓ ЕС производство (България)\n✓ GMP сертифициран обект\n✓ НЕ е стероид\n✓ Без странични ефекти\n\nМожеш да я вземаш дългосрочно. Хиляди мъже го правят.\n\nАко искаш списък със съставки - той е публичен. Прочети. Провери. Няма скрити ingredients.'
    },
    {
      question: 'Защо да избера естествен подход вместо стероиди?',
      answer: 'Защото не си professional bodybuilder който живее за Mr. Olympia.\n\nСтероиди работят? ДА. Но:\n• Хормонален crash след цикъл\n• ПКТ задължително (още пари, още химия)\n• Акне, гинекомастия, mood swings\n• Illegal в България\n• Рискове за здравето\n\nАко искаш бързи резултати на всяка цена - не сме ние.\nАко искаш устойчиви резултати без да съсипеш тялото си - това е твоят избор.\n\nНие оптимизираме естествения тестостерон. Не го замяняме с external sources.'
    },
    {
      question: 'Защо пакетът е 67 лв когато други добавки са по-евтини?',
      answer: 'Защото ние НЕ продаваме "само добавка".\n\nOstroVit креатин: 35 лв\n→ Получаваш: Хапчета\n→ Резултати: Няма (без тренировъчен план)\n\nTESTOGRAPH: 67 лв\n→ Получаваш:\n  • Добавка (12 съставки)\n  • 4 протокола (тренировки, храна, сън, timing)\n  • Tracking apps\n  • Daily check-in\n  • Telegram общност\n→ Резултати: 94% виждат промяна\n\nИскаш евтино? Купи креатин.\nИскаш РЕЗУЛТАТИ? Вземи системата.\n\nВъпросът не е "защо толкова скъпо". Въпросът е "защо ДРУГИТЕ НЕ работят".'
    },
    {
      question: 'Работи ли за мъже над 40?',
      answer: 'Работи ОСОБЕНО добре над 40.\n\nСлед 35-40 тестостеронът пада естествено (-1-2% годишно).\nНа 45 години си с 10-20% по-малко тестостерон отколкото на 25.\n\nТова означава:\n→ По-трудно качваш мускули\n→ По-бавно recovery\n→ По-малко енергия\n→ По-ниско либидо\n\nСистемата е DESIGNED да компенсира това. Оптимизираме всичко което можеш да контролираш.\n\nИмаме потребители от 22 до 52 години. Всички виждат резултати. Колкото по-възрастен си, толкова по-критично е да имаш СИСТЕМА.'
    },
    {
      question: 'Трябва ли да тренирам във фитнес?',
      answer: 'НЕ. Можеш да тренираш където искаш.\n\n✓ Фитнес център\n✓ У дома (дъмбели, гири)\n✓ Външен фитнес (Street workout)\n✓ Кръстосана зала\n\nПротоколите са адаптивни. Работят навсякъде.\n\nНО - трябва ДА ТРЕНИРАШ. Без тренировки системата няма да работи.\nХапчетата сами не правят чудеса. Тренировките + добавката + храната = резултати.'
    },
    {
      question: 'Какво ако не мога да следвам храната 100%?',
      answer: 'Никой не е перфектен 100% от времето.\n\nСистемата работи с 80-85% consistency:\n→ 6 от 7 дни следваш протокола = виждаш резултати\n→ 5 от 7 дни = виждаш резултати (по-бавно)\n→ 3-4 от 7 дни = няма да видиш много\n\nНе търсим перфекция. Търсим CONSISTENCY.\n\nАко не можеш да си 80% consistent - не купувай. Хвърляш си парите.\nАко МОЖЕШ да си 80% consistent - ще видиш промяна.'
    },
    {
      question: 'Има ли абонамент или скрити такси?',
      answer: 'НЕ. НУЛА скрити такси.\n\nПлащаш:\n→ 67 лв (Starter)\n→ 127 лв (Performance)\n→ 179 лв (Complete)\n\nПолучаваш:\n→ Добавката\n→ ВСИЧКИ приложения\n→ ВСИЧКИ протоколи\n→ Достъп ЗАВИНАГИ\n\nНикакви recurring charges.\nНикакви "unlock premium features".\nНикакви bullshit модели.\n\nПлащаш веднъж → имаш го завинаги.'
    },
    {
      question: 'За кого е подходяща тази система?',
      answer: 'За мъже които са готови ДА РАБОТЯТ.\n\nНЕ Е за теб ако:\n❌ Търсиш "чудо хапче" без усилие\n❌ Не искаш да тренираш 3-4 пъти седмично\n❌ Не можеш да си 80% consistent\n❌ Искаш резултати без да се ангажираш\n\nЕ за теб ако:\n✓ Готов си да работиш\n✓ Искаш СИСТЕМА, не гадаене\n✓ Можеш да си 80-85% consistent\n✓ Искаш резултати и си готов да инвестираш време\n\nНе сме тук да ти продаваме мечти. Системата работи. Но ТИ трябва да я следваш.\n\nГотов ли си? Ако ДА → купи.\nАко НЕ → не купувай.'
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-neutral-50 dark:to-neutral-900">
      <AnimatedBackground variant="circles" opacity={0.06} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-4">
              <MessageCircleQuestion className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Често задавани въпроси</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText>
                ЧЕСТО ЗАДАВАНИ ВЪПРОСИ
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground">
              Всичко което трябва да знаеш
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <GlassCard key={index} className="overflow-hidden hover:border-primary/30 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left group"
                >
                  <span className="text-lg font-semibold text-foreground pr-4 group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6 text-primary" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-5 border-t border-border/50">
                    <div className="pt-5">
                      <p className="text-foreground whitespace-pre-line leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <GlassCard className="p-8 inline-block">
              <p className="text-lg text-muted-foreground">
                Още въпроси?{' '}
                <a href="#" className="text-primary hover:underline font-semibold transition-colors">
                  Свържи се с нас
                </a>
              </p>
            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
