'use client';

import React, { useState } from 'react';
import { ArrowRight, Users, TrendingUp, Award, AlertCircle, Zap, Dumbbell, Heart, ChevronRight } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';

export default function HeroV2() {
  const [showQuiz, setShowQuiz] = useState(false);

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToQuiz = () => {
    const element = document.getElementById('quiz');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <AnimatedBackground variant="mixed" opacity={0.12} />

      {/* Scarcity Badge - Floating Top Right */}
      <div className="absolute top-6 right-6 z-20 animate-pulse">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="text-xs font-semibold opacity-90">Ограничен наличност</div>
              <div className="text-sm font-bold">Само 47 пакета останали</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Multi-Pain Hook */}
            <div className="space-y-6">

              {/* Social Proof Bar - TOP */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-4 py-2">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">127 мъже</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-4 py-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">94% успех</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-full px-4 py-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">БАБХ</span>
                </div>
              </div>

              {/* Main Headline - Multi-Pain Hook */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <GradientText from="from-red-500" via="via-orange-500" to="to-amber-500">
                  Силата е stuck.
                  <br />
                  Енергията е в пода.
                  <br />
                  Либидото изчезна.
                </GradientText>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-foreground font-semibold">
                Тренираш 4 пъти седмично.
                <br />
                Резултатите? <span className="text-red-500">НУЛА.</span>
              </p>

              {/* Problem Bullets - Sharp & Direct */}
              <div className="space-y-3 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/30 dark:to-amber-950/30 border-l-4 border-red-500 rounded-r-xl p-6">
                <div className="flex items-start gap-3">
                  <Dumbbell className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-foreground font-medium">
                    <span className="font-bold">Бенч press stuck на 100кг.</span> 6 месеца същите тежести.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <p className="text-foreground font-medium">
                    <span className="font-bold">Сутрин ставаш уморен.</span> В 14:00ч енергията ти е gone.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-foreground font-medium">
                    <span className="font-bold">Либидото не е като преди.</span> Знаеш че нещо не е наред.
                  </p>
                </div>
              </div>

              {/* The Problem Statement - Aggressive */}
              <div className="bg-neutral-900 dark:bg-neutral-800 border-2 border-amber-500 rounded-2xl p-6">
                <p className="text-white text-lg font-bold mb-3">
                  Вероятно си пробвал:
                </p>
                <div className="space-y-2 text-neutral-300">
                  <p>❌ Креатин от iHerb - не работи</p>
                  <p>❌ "Тесто бустер" за 89 лв - bullshit</p>
                  <p>❌ Треньор за 200 лв/месец - няма резултати</p>
                  <p>❌ Всякакви "чудо хапчета" - пари в кофата</p>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <p className="text-xl font-bold text-amber-400">
                    Защото ти липсват останалите 80% от формулата.
                  </p>
                </div>
              </div>

              {/* Solution Statement - 100% Formula */}
              <div className="bg-gradient-to-r from-primary/10 via-green-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6">
                <p className="text-2xl font-bold text-foreground mb-3">
                  TESTOGRAPH дава <GradientText>100% от формулата</GradientText>
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground">Добавка (20%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground">Тренировки (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground">Храна (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground">Сън (15%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground">Проследяване (10%)</span>
                  </div>
                </div>
              </div>

              {/* Dual CTA */}
              <div className="space-y-4 pt-4">
                {/* Primary: Quiz */}
                <button
                  onClick={scrollToQuiz}
                  className="group w-full relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm opacity-90 font-semibold">БЕЗПЛАТЕН ТЕСТ</div>
                      <div className="text-lg font-bold">Виж Дали Системата Е За Теб</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>

                {/* Secondary: Direct Purchase */}
                <button
                  onClick={scrollToPricing}
                  className="group w-full relative bg-white dark:bg-neutral-800 text-foreground border-2 border-primary/30 hover:border-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Виж Пакетите</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust Line */}
              <p className="text-sm text-muted-foreground text-center">
                ✓ 30 дни гаранция • ✓ БАБХ регистрация • ✓ 94% виждат резултати
              </p>

            </div>

            {/* Right: Visual - System Overview */}
            <div className="relative lg:h-[700px]">
              <div className="relative group">
                {/* Main Container */}
                <div className="relative bg-card/30 backdrop-blur-sm border-2 border-border/50 rounded-3xl p-8 shadow-2xl">

                  {/* Title */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      <GradientText>100% СИСТЕМА</GradientText>
                    </h3>
                    <p className="text-muted-foreground">Не само хапчета. Цялата формула.</p>
                  </div>

                  {/* Components Grid */}
                  <div className="space-y-4">
                    {[
                      { label: 'Добавка (12 съставки)', value: '20%', color: 'from-blue-500 to-cyan-500', icon: '💊' },
                      { label: 'Протокол: Тренировки', value: '25%', color: 'from-green-500 to-emerald-500', icon: '💪' },
                      { label: 'Протокол: Храна', value: '30%', color: 'from-amber-500 to-orange-500', icon: '🍖' },
                      { label: 'Протокол: Сън', value: '15%', color: 'from-purple-500 to-pink-500', icon: '😴' },
                      { label: 'Дневно проследяване', value: '10%', color: 'from-red-500 to-rose-500', icon: '📊' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative group/item">
                        <div className="bg-gradient-to-r from-card to-card/50 backdrop-blur-sm border border-border hover:border-primary/50 rounded-xl p-4 transition-all hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{item.icon}</div>
                              <div>
                                <div className="font-bold text-foreground">{item.label}</div>
                                <div className={`text-sm bg-gradient-to-r ${item.color} bg-clip-text text-transparent font-semibold`}>
                                  {item.value} от формулата
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Badge */}
                  <div className="mt-8 bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-2xl p-6 text-center shadow-xl">
                    <div className="text-white">
                      <div className="text-sm font-semibold opacity-90 mb-1">TOTAL</div>
                      <div className="text-4xl font-bold mb-2">100%</div>
                      <div className="text-sm opacity-90">Цялата формула на една цена</div>
                    </div>
                  </div>

                  {/* Price Teaser */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Всичко това за</p>
                    <p className="text-3xl font-bold">
                      <GradientText>67 лв</GradientText>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">(2.23 лв/ден)</p>
                  </div>

                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-green-500/20 to-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
