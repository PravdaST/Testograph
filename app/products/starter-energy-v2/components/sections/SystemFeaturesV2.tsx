'use client';

import React, { useState } from 'react';
import { Dumbbell, Apple, Moon, Pill, CheckCircle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function SystemFeaturesV2() {
  const [activeTab, setActiveTab] = useState('checkin');

  const protocols = [
    {
      icon: Dumbbell,
      emoji: '📋',
      title: 'ТРЕНИРОВЪЧЕН ПРОТОКОЛ',
      features: [
        'Точна програма за 4 седмици',
        'Кои упражнения, колко сетове/повторения',
        'Как да прогресираш всяка седмица',
        'Оптимизирана за тестостерон и растеж'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Apple,
      emoji: '🍽️',
      title: 'ХРАНИТЕЛЕН ПРОТОКОЛ',
      features: [
        'Какво да ядеш за оптимални хормони',
        'Списъци с най-добрите храни',
        'Примерни менюта за цял ден',
        'Макрос калкулатор според теглото ти'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Moon,
      emoji: '😴',
      title: 'ПРОТОКОЛ ЗА СЪН И СТРЕС',
      features: [
        'Как да спиш дълбоко и качествено',
        'Техники за управление на стрес',
        'Ритуали преди лягане',
        'Оптимизация на кортизол'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Pill,
      emoji: '💊',
      title: 'ПРОТОКОЛ ЗА ДОБАВКИ',
      features: [
        'Точно КОГА да вземаш добавката',
        'С какво да я комбинираш',
        'Какво да избягваш',
        'Максимална ефективност'
      ],
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const tabs = [
    { id: 'checkin', label: 'Ежедневен Чек-ин', icon: CheckCircle },
    { id: 'tracking', label: 'Проследяване', icon: TrendingUp },
    { id: 'community', label: 'Общност', icon: Users }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-blue-500/5">
      <AnimatedBackground variant="waves" opacity={0.08} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">Стойност 147 лв</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText>
                TESTOGRAPH СИСТЕМА
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Пълната система за 100% оптимизация
            </p>
          </div>

          {/* 4 Protocols */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              4 Готови <GradientText>Протокола</GradientText>
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {protocols.map((protocol, index) => {
                const Icon = protocol.icon;
                return (
                  <GlassCard key={index} className="group p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${protocol.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {protocol.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-foreground">{protocol.title}</h4>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {protocol.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Tracking Features */}
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                        : 'bg-card/50 backdrop-blur-sm border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">

              {/* Check-in Tab */}
              {activeTab === 'checkin' && (
                <GlassCard className="p-8 md:p-10">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      📊
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Ежедневен Чек-ин</h3>
                      <p className="text-muted-foreground">ВСЕКИ ДЕН (2 минути)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-foreground font-semibold">5 въпроса (1-10 скала):</p>
                    <div className="grid gap-3">
                      {[
                        'Общо усещане за деня',
                        'Енергийно ниво',
                        'Колко следваш плана',
                        'Сутрешна ерекция (quality)',
                        'Качество на съня'
                      ].map((question, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-primary/5 rounded-lg p-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground">{question}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-500/20 rounded-xl p-6 mt-6">
                      <p className="text-foreground mb-2">✅ Приложението автоматично записва.</p>
                      <p className="text-foreground mb-2">✅ Виждаш тенденциите във времето.</p>
                      <p className="text-foreground font-semibold">✅ Знаеш точно какво работи за теб.</p>
                    </div>
                  </div>

                  {/* App Screenshot Placeholder */}
                  <div className="mt-6 aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border-2 border-border">
                    <span className="text-muted-foreground">App Screenshot: Чек-ин</span>
                  </div>
                </GlassCard>
              )}

              {/* Tracking Tab */}
              {activeTab === 'tracking' && (
                <GlassCard className="p-8 md:p-10">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      📈
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Проследяване на Напредък</h3>
                      <p className="text-muted-foreground">ВИЖДАШ В РЕАЛНО ВРЕМЕ</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: BarChart3, label: 'На кой ден си', value: 'Ден 18/30' },
                      { icon: TrendingUp, label: 'Колко % завършен', value: '64%' },
                      { icon: CheckCircle, label: 'Твоите най-добри дни', value: 'Ден 12, 15' },
                      { icon: Users, label: 'Какво да подобриш', value: 'Сън качество' }
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-500/20 rounded-xl p-6">
                    <p className="text-foreground mb-2">✅ Графики как се променят отговорите ти</p>
                    <p className="text-foreground font-semibold">✅ Data-driven резултати. Мотивира те да продължаваш.</p>
                  </div>

                  {/* App Screenshot Placeholder */}
                  <div className="mt-6 aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border-2 border-border">
                    <span className="text-muted-foreground">App Screenshot: Прогрес графики</span>
                  </div>
                </GlassCard>
              )}

              {/* Community Tab */}
              {activeTab === 'community' && (
                <GlassCard className="p-8 md:p-10">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      👥
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Telegram Общност</h3>
                      <p className="text-muted-foreground">ДОСТЪП ДО PRIVATE TELEGRAM ГРУПА</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      'Други мъже които следват системата',
                      'Споделяте напредък и мотивация',
                      'Питате въпроси, получавате отговори',
                      'Accountability partners',
                      'Празнувате успехите заедно'
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-500/20 rounded-xl p-6 text-center">
                    <p className="text-xl font-bold text-foreground">
                      <GradientText from="from-purple-500" via="via-pink-500" to="to-blue-500">
                        Не си сам в пътуването.
                      </GradientText>
                    </p>
                  </div>

                  {/* Community Screenshot Placeholder */}
                  <div className="mt-6 aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border-2 border-border">
                    <span className="text-muted-foreground">App Screenshot: Telegram общност</span>
                  </div>
                </GlassCard>
              )}

            </div>
          </div>

          {/* Value Statement */}
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <p className="text-3xl md:text-4xl font-bold mb-4">
              СТОЙНОСТ НА СИСТЕМАТА: 147 лв
            </p>
            <p className="text-xl opacity-90">
              Получаваш я безплатно с всеки пакет
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
