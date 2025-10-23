'use client';

import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';

export default function FinalCTAV2() {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-600">
      <AnimatedBackground
        variant="mixed"
        opacity={0.2}
        colors={{
          primary: 'rgb(255, 255, 255)',
          secondary: 'rgb(255, 255, 255)',
          tertiary: 'rgb(255, 255, 255)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              ДВА ИЗБОРА
            </h2>
          </div>

          {/* Two Choices Grid */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Choice 1 - Status Quo */}
            <div className="bg-neutral-900/90 backdrop-blur-sm border-2 border-neutral-800 rounded-3xl p-8 md:p-10">
              <h3 className="text-2xl font-bold text-white mb-3">ИЗБОР 1:</h3>
              <p className="text-xl font-semibold text-neutral-300 mb-6">Продължаваш по познатия път</p>

              <div className="space-y-3 mb-6 text-neutral-400">
                <p>• Инвестираш в отделна добавка</p>
                <p>• Експериментираш с дозировки и timing</p>
                <p>• Тренираш без конкретна методика</p>
                <p>• Следиш храненето интуитивно</p>
              </div>

              <div className="bg-red-900/40 border-2 border-red-800 rounded-xl p-6">
                <p className="font-bold text-red-300 mb-3 text-lg">След 30 дни:</p>
                <div className="space-y-2 text-red-400">
                  <p>→ Същите резултати</p>
                  <p>→ Същите въпроси</p>
                  <p>→ Същата несигурност</p>
                </div>
              </div>
            </div>

            {/* Choice 2 - TESTOGRAPH */}
            <div className="relative bg-white/95 backdrop-blur-sm border-4 border-green-400 rounded-3xl p-8 md:p-10 shadow-2xl">
              {/* Best Choice Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg rotate-12">
                ПРАВИЛНИЯТ ИЗБОР
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-3">ИЗБОР 2:</h3>
              <p className="text-xl font-semibold text-neutral-700 mb-6">Опитваш TESTOGRAPH система</p>

              <div className="space-y-3 mb-6 text-neutral-700 font-medium">
                <p>• Получаваш пълна система (100%)</p>
                <p>• Протоколи + Добавка + Проследяване</p>
                <p>• Следваш 30 дни</p>
              </div>

              <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
                <p className="font-bold text-green-900 mb-3 text-lg">След 30 дни:</p>
                <div className="space-y-2 text-green-700 font-medium">
                  <p>→ Виждаш резултати</p>
                  <p>→ Или пари назад</p>
                  <p className="text-xl font-bold text-green-600">→ Нулев риск</p>
                </div>
              </div>
            </div>

          </div>

          {/* Social Proof Reminder */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 text-center">
            <p className="text-2xl md:text-3xl font-bold text-white mb-3">
              127 мъже избраха Избор 2.
            </p>
            <p className="text-xl md:text-2xl text-white/95 mb-3">
              94% видяха резултати.
            </p>
            <p className="text-lg md:text-xl text-white/90">
              <span className="font-semibold">Защо?</span> Защото имаха <span className="font-bold">СИСТЕМА</span>, не само хапчета.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="text-center space-y-6">
            <button
              onClick={scrollToPricing}
              className="group relative bg-white text-primary hover:bg-neutral-100 font-bold text-xl md:text-2xl px-12 md:px-16 py-5 md:py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              <span>ЗАПОЧВАМ ТРАНСФОРМАЦИЯТА</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            {/* Package Selection */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'Starter', price: '67 лв', popular: false },
                { name: 'Performance', price: '127 лв', popular: true },
                { name: 'Complete', price: '179 лв', popular: false }
              ].map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={scrollToPricing}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-white text-primary shadow-xl hover:shadow-2xl scale-105'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  {pkg.name} - {pkg.price} {pkg.popular && '⭐'}
                </button>
              ))}
            </div>
          </div>

          {/* Disqualifier */}
          <div className="bg-amber-400/95 backdrop-blur-sm border-2 border-amber-600 rounded-3xl p-8 md:p-10">
            <div className="flex items-start gap-4 md:gap-6">
              <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-amber-900 flex-shrink-0" />
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-amber-900 mb-4">ВАЖНО: Тази система изисква ангажираност</h3>
                <p className="text-xl font-semibold text-amber-900 mb-4">
                  Ако търсиш бързо решение без усилие, това не е подходящият избор.
                </p>
                <p className="text-lg text-amber-900 mb-3 font-medium">За да постигнеш резултати, ще трябва да инвестираш:</p>
                <ul className="space-y-2 text-amber-900 font-medium mb-4">
                  <li>• Тренировки 3-4 пъти седмично</li>
                  <li>• Следване на протоколите</li>
                  <li>• Ежедневен чек-ин (само 2 минути)</li>
                  <li>• Дисциплина и постоянство</li>
                </ul>
                <p className="text-xl font-bold text-amber-900">
                  Системата работи за тези които са готови да работят. Ако си готов за истинска трансформация - ние сме тук за теб.
                </p>
              </div>
            </div>
          </div>

          {/* Final Statement */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <p className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">Ако СИ готов:</p>
            <div className="space-y-3 text-lg md:text-xl text-neutral-700 mb-6 font-medium">
              <p>Даваш 100% → виждаш резултати</p>
              <p>Не виждаш резултати → пари назад</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold mb-6">
              <GradientText>Справедливо.</GradientText>
            </p>
            <p className="text-lg md:text-xl text-neutral-700 mb-8 font-medium">
              Рискът е мой ако <span className="font-bold">ТИ работиш</span>.
            </p>

            <button
              onClick={scrollToPricing}
              className="group bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white font-bold text-xl md:text-2xl px-12 md:px-16 py-5 md:py-6 rounded-2xl shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              <span>ЗАПОЧВАМ СЕГА</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
