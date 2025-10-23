'use client';

import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import Container from '../shared/Container';
import Button from '../shared/Button';

export default function FinalCTA() {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-primary-800">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            ДВА ИЗБОРА
          </h2>

          {/* Two Choices */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Choice 1 - Status Quo */}
            <div className="bg-neutral-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">ИЗБОР 1:</h3>
              <p className="text-xl font-semibold text-neutral-300 mb-6">Продължаваш както досега</p>

              <div className="space-y-3 mb-6 text-neutral-400">
                <p>• Купуваш добавка от iHerb за 80 лв</p>
                <p>• Гадаеш как да я вземаш</p>
                <p>• Тренираш без план</p>
                <p>• Ядеш "на око"</p>
              </div>

              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                <p className="font-bold text-red-300 mb-2">След 30 дни:</p>
                <p className="text-red-400">→ На същото място</p>
                <p className="text-red-400">→ Още 80 лв по-беден</p>
                <p className="text-red-400">→ Още по-фрустриран</p>
              </div>
            </div>

            {/* Choice 2 - TESTOGRAPH */}
            <div className="bg-white rounded-2xl p-8 border-4 border-green-400">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">ИЗБОР 2:</h3>
              <p className="text-xl font-semibold text-neutral-700 mb-6">Опитваш TESTOGRAPH система</p>

              <div className="space-y-3 mb-6 text-neutral-700">
                <p>• Получаваш пълна система (100%)</p>
                <p>• Протоколи + Добавка + Проследяване</p>
                <p>• Следваш 30 дни</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-bold text-green-900 mb-2">След 30 дни:</p>
                <p className="text-green-700">→ Виждаш резултати</p>
                <p className="text-green-700">→ Или пари назад</p>
                <p className="text-green-700 font-bold">→ Нулев риск</p>
              </div>
            </div>
          </div>

          {/* Social Proof Reminder */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 text-center">
            <p className="text-2xl font-bold text-white mb-2">
              127 мъже избраха Избор 2.
            </p>
            <p className="text-xl text-white/90 mb-2">
              94% видяха резултати.
            </p>
            <p className="text-lg text-white/80">
              <span className="font-semibold">Защо?</span> Защото имаха СИСТЕМА, не само хапчета.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="text-center mb-12">
            <Button
              size="xl"
              className="bg-white text-primary-700 hover:bg-neutral-100 shadow-2xl text-xl px-16 py-6"
              icon={ArrowRight}
              onClick={scrollToPricing}
            >
              ЗАПОЧВАМ ТРАНСФОРМАЦИЯТА
            </Button>
          </div>

          {/* Package Selection */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={scrollToPricing}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              Starter - 67 лв
            </button>
            <button
              onClick={scrollToPricing}
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Performance - 127 лв ⭐
            </button>
            <button
              onClick={scrollToPricing}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              Complete - 179 лв
            </button>
          </div>

          {/* Disqualifier */}
          <div className="bg-amber-500 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-900 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-amber-900 mb-4">НЕ Е ЗА ВСЕКИ</h3>
                <p className="text-amber-900 font-semibold mb-4">
                  Търсиш магия без усилие? Не е за теб.
                </p>
                <p className="text-amber-900 mb-3">Системата изисква:</p>
                <ul className="space-y-2 text-amber-900">
                  <li>• Тренировки 3-4 пъти седмично</li>
                  <li>• Следване на протоколите</li>
                  <li>• Ежедневен чек-ин (2 минути)</li>
                  <li>• Дисциплина и consistency</li>
                </ul>
                <p className="text-amber-900 font-bold mt-4">
                  Ако не си готов - не купувай.
                </p>
              </div>
            </div>
          </div>

          {/* Final Statement */}
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-xl font-bold text-neutral-900 mb-4">Ако СИ готов:</p>
            <div className="space-y-2 text-lg text-neutral-700 mb-6">
              <p>Даваш 100% → виждаш резултати</p>
              <p>Не виждаш резултати → пари назад</p>
            </div>
            <p className="text-2xl font-bold text-primary-700 mb-6">Справедливо.</p>
            <p className="text-lg text-neutral-700">
              Рискът е мой ако ТИ работиш.
            </p>

            <Button
              size="xl"
              className="mt-8"
              icon={ArrowRight}
              onClick={scrollToPricing}
            >
              ЗАПОЧВАМ СЕГА
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
