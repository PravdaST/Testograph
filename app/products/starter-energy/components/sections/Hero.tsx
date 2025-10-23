'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import Container from '../shared/Container';
import Button from '../shared/Button';

export default function Hero() {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-neutral-50 to-primary-50 py-16 md:py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Story Content */}
          <div className="space-y-6 md:space-y-8">
            {/* Science Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200 shadow-sm">
              <Shield className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">100% Научно базирана система</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Преди 8 години направих грешка.
            </h1>

            {/* Story Hook */}
            <div className="space-y-4 text-lg md:text-xl text-neutral-700 leading-relaxed">
              <p>Взимах стероиди без да знам какво правя.</p>
              <p className="font-semibold text-neutral-900">Разбих си хормоните.</p>
            </div>

            {/* Divider */}
            <div className="w-24 h-1 bg-primary-600"></div>

            {/* The Journey */}
            <div className="space-y-4 text-lg text-neutral-700">
              <p>След това с жена ми започнахме да се опитваме да имаме дете.</p>
              <p className="text-2xl font-bold text-neutral-900">Нищо.</p>

              <div className="space-y-2">
                <p>Отидохме при лекари. Направихме всички изследвания.</p>
                <p>Опитахме всичко което ни казаха.</p>
                <p className="font-semibold text-neutral-900">Пак нищо.</p>
              </div>
            </div>

            {/* Emotional Impact */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border-l-4 border-red-400 p-6 rounded-r-lg">
              <p className="text-neutral-700 italic">
                Никой нямаше решение. Реших сам да намеря отговор.
              </p>
            </div>

            {/* The Solution */}
            <div className="space-y-4">
              <p className="text-lg font-semibold text-neutral-900">
                Месеци research. Разбрах КАК да оправя хормоните естествено.
              </p>
              <p className="text-xl text-neutral-700">
                Година по-късно: Хормоните ми се върнаха в норма. Енергията ми беше като на 20-годишен.
              </p>
              <p className="text-2xl font-bold text-primary-700">
                Днес имам 2 деца и успешен бизнес.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                icon={ArrowRight}
                onClick={scrollToPricing}
              >
                Виж как работи системата
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>БАБХ регистрация</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                <span>127 потребители</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span>94% успех</span>
              </div>
            </div>
          </div>

          {/* Right: Before/After Visual */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Before Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <p className="text-sm font-medium">BEFORE IMAGE</p>
                    <p className="text-xs">/starter-energy/before.jpg</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">ПРЕДИ</p>
                    <p className="text-white/90 text-xs">2017 - Грешката</p>
                  </div>
                </div>
              </div>

              {/* After Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <p className="text-sm font-medium">AFTER IMAGE</p>
                    <p className="text-xs">/starter-energy/after.jpg</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">СЛЕД</p>
                    <p className="text-xs text-white/90">2020 - Успехът</p>
                  </div>
                </div>

                {/* Success Badge */}
                <div className="absolute top-4 right-4 bg-green-600 rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-white text-center">
                    <div className="text-sm font-bold leading-tight">2 деца</div>
                    <div className="text-xs font-semibold opacity-90">Успешен бизнес</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Arrow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-primary-600 rounded-full p-4 shadow-xl">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Message */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm border-2 border-primary-200 rounded-2xl p-8 shadow-lg">
            <p className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
              Аз направих системата за ЦЯЛАТА формула - 100%.
            </p>
            <p className="text-lg text-neutral-700">
              Тази система може да промени и твоя живот.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
