'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Само добавката, без приложението?',
      answer: 'НЕ. Добавката е 20% от формулата. Протоколите са 80%. Без 80%, 20% са безполезни. Ако искаш само хапчета - купи OstroVit от магазина. Ако искаш РЕЗУЛТАТИ - вземи системата.'
    },
    {
      question: 'Колко бързо ще видя резултати?',
      answer: '14 дни: Енергия, сън, либидо (+15-20%) • 30 дни: Сила, работоспособност, настроение • 90 дни: Пълна трансформация (тяло, хормони, живот). Но само ако следваш системата.'
    },
    {
      question: 'Безопасна ли е добавката?',
      answer: 'ДА. 100%. ✓ 100% натурални съставки ✓ ЕС производство (България) ✓ БАБХ регистрация ✓ GMP сертифициран обект ✓ НЕ е стероид ✓ Без странични ефекти. Можеш да вземаш дългосрочно без проблеми.'
    },
    {
      question: 'Защо не просто стероиди?',
      answer: 'Стероиди работят бързо, но: ❌ Провалят хормоните след цикъл ❌ ПКТ, акне, гинекомастия ❌ Губиш резултатите когато спреш ❌ Здравословни рискове. TESTOGRAPH: ✅ Естествено и устойчиво ✅ Без странични ефекти ✅ Резултатите ОСТАВАТ ✅ Подобряваш здравето си. Бързо ≠ добре.'
    },
    {
      question: '67 лв е скъпо. OstroVit е 35 лв.',
      answer: 'OstroVit = само хапчета (35 лв), резултат: гадаеш какво да правиш. TESTOGRAPH = система (67 лв): Приложение (147 лв стойност) + 4 детайлни протокола + Ежедневен чек-ин + Проследяване + Telegram общност + Добавката. Искаш да спестиш 32 лв и да нямаш резултати? Или искаш да инвестираш 67 лв и да работи? 67 лв = 2.23 лв/ден. По-евтино от кафе.'
    },
    {
      question: 'Работи ли за мъже над 40?',
      answer: 'ДА. Работи още по-добре. След 35-40 тестостеронът пада естествено. Системата е проектирана да го оптимизира. Имаме потребители от 22 до 52 години. Всички виждат резултати. Колкото по-възрастен си, толкова по-важно е да имаш правилната система.'
    },
    {
      question: 'Трябва ли да тренирам във фитнес?',
      answer: 'НЕ задължително. Можеш да тренираш: във фитнес, у дома (с гири/дъмбели), на външен фитнес. Протоколът е адаптивен. Работи навсякъде. Важното е да ТРЕНИРАШ. Не къде.'
    },
    {
      question: 'Какво ако не мога да следвам храната 100%?',
      answer: 'Никой не е перфектен. Системата работи с 80-85% consistency. Ако следваш протокола 6 от 7 дни седмично - ще видиш резултати. Целта е прогрес, не перфекция.'
    },
    {
      question: 'Има ли абонамент или скрити такси?',
      answer: 'НЕ. Плащаш само цената на пакета. Никакви абонаменти. Никакви скрити такси. Пълен достъп завинаги. Купуваш веднъж → имаш го завинаги.'
    },
    {
      question: 'За кого НЕ е тази система?',
      answer: 'НЕ Е ЗА ВСЕКИ. Търсиш магия без усилие? Не е за теб. Системата изисква: Тренировки 3-4 пъти седмично, Следване на протоколите, Ежедневен чек-ин (2 минути), Дисциплина и consistency. Ако не си готов - не купувай.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <Container maxWidth="3xl">
        <SectionHeader
          headline="ЧЕСТО ЗАДАВАНИ ВЪПРОСИ"
          description="Всичко което трябва да знаеш"
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="text-lg font-semibold text-neutral-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-neutral-700 whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600">
            Още въпроси?{' '}
            <a href="#" className="text-primary-600 hover:underline font-semibold">
              Свържи се с нас
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
