import React from 'react';
import { HelpCircle, TrendingUp, Award, Heart } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function WhyCheapV2() {
  const reasons = [
    {
      number: 1,
      icon: TrendingUp,
      title: 'Искаме да успееш',
      color: 'from-blue-500 to-cyan-500',
      content: {
        old: 'Скъпи продукти → хората купуват веднъж → разочароват се → никога повече.',
        new: 'Евтин старт → виждаш резултати → ставаш клиент завинаги.',
        conclusion: 'За нас е по-изгодно ДА УСПЕЕШ.'
      }
    },
    {
      number: 2,
      icon: Award,
      title: 'Искаме добра репутация',
      color: 'from-green-500 to-emerald-500',
      content: {
        problem: 'Българският пазар е пълен с измами. "Чудо хапчета" за 150 лв. Нула резултати. Хората са изгубили доверие.',
        solution: [
          'Даваме ти ВСИЧКО (не само хапчета)',
          'На честна цена (не те дерем)',
          'Гарантираме резултати (не само обещания)'
        ],
        conclusion: 'Когато видиш че работи → разказваш на приятели. Това е най-добрата реклама.'
      }
    },
    {
      number: 3,
      icon: Heart,
      title: 'Фокусирани на стойност',
      color: 'from-amber-500 to-orange-500',
      content: {
        couldHave: [
          'Добавка: 89 лв',
          'Приложение: 19 лв/месец абонамент',
          'Протоколи: 49 лв еднократно',
          '= 157 лв първия месец'
        ],
        why: 'Защото искаме да има колкото се може повече мъже които ще имат достъп до правилната информация и инструменти.',
        conclusion: '67 лв = цената на добавката. Всичко друго е ПОДАРЪК.'
      }
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-amber-500/5">
      <AnimatedBackground variant="waves" opacity={0.08} colors={{ primary: 'rgb(245, 158, 11)', secondary: 'rgb(249, 115, 22)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-full px-4 py-2 mb-4">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Валиден въпрос</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-amber-500" via="via-orange-500" to="to-red-500">
                ❓ ЗАЩО ТОЛКОВА ЕВТИНО?
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground">
              Ето истината:
            </p>
          </div>

          {/* Price Comparison */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Other Brands */}
            <GlassCard className="p-8 border-red-500/30">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">ДРУГИ МАРКИ:</h3>
              <div className="space-y-3">
                {[
                  { label: 'Добавка', price: '70-90 лв' },
                  { label: 'Треньор', price: '200 лв/месец' },
                  { label: 'Нутриционист', price: '150 лв' },
                  { label: 'План за тренировки', price: '100 лв' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-bold text-foreground">{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t-2 border-border">
                  <span className="font-bold text-foreground text-lg">ОБЩО:</span>
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">500+ лв</span>
                </div>
              </div>
            </GlassCard>

            {/* Testograph */}
            <GlassCard className="p-8 border-green-500/30 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ВСИЧКО В ЕДНО
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">TESTOGRAPH:</h3>
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-lg text-muted-foreground mb-2">ВСИЧКО за</p>
                <p className="text-6xl font-bold mb-2">
                  <GradientText>67 лв</GradientText>
                </p>
                <p className="text-sm text-muted-foreground">2.23 лв/ден</p>
              </div>
            </GlassCard>
          </div>

          {/* 3 Reasons */}
          <div className="space-y-8">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div key={reason.number} className="relative">
                  <GlassCard className="p-8 md:p-10">
                    {/* Number Badge */}
                    <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${reason.color} rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
                      {reason.number}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 ml-12">
                      <Icon className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold text-foreground">{reason.title}</h3>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 ml-12">
                      {reason.number === 1 && (
                        <>
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Опитали сме другия подход:</p>
                            <p className="text-foreground">{reason.content.old}</p>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Новия подход:</p>
                            <p className="text-foreground">{reason.content.new}</p>
                          </div>
                          <p className="text-xl font-bold text-primary">{reason.content.conclusion}</p>
                        </>
                      )}

                      {reason.number === 2 && (
                        <>
                          <p className="text-muted-foreground">{reason.content.problem}</p>
                          <div className="bg-primary/5 rounded-lg p-4">
                            <p className="font-semibold text-foreground mb-3">НИЕ искаме да сме различни:</p>
                            <div className="space-y-2">
                              {reason.content.solution.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-green-500">✓</span>
                                  <span className="text-foreground">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">{reason.content.conclusion}</p>
                        </>
                      )}

                      {reason.number === 3 && (
                        <>
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <p className="font-semibold text-foreground mb-3">Можехме да направим:</p>
                            {reason.content.couldHave.map((item, idx) => (
                              <p key={idx} className={`text-muted-foreground ${idx === reason.content.couldHave.length - 1 ? 'font-bold mt-2' : ''}`}>
                                • {item}
                              </p>
                            ))}
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="font-semibold text-foreground mb-2">Но НЕ.</p>
                            <p className="text-foreground">{reason.content.why}</p>
                          </div>
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{reason.content.conclusion}</p>
                        </>
                      )}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Final Statement */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-green-500 to-purple-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-primary/10 via-green-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 md:p-12 text-center space-y-4">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                Не сме като останалите които само искат парите ти.
              </p>
              <div className="space-y-2 text-xl text-foreground">
                <p>Искаме да <GradientText>УСПЕЕШ</GradientText>.</p>
                <p>Искаме да видиш <GradientText>РЕЗУЛТАТИ</GradientText>.</p>
                <p>Искаме да ни <GradientText>ВЯРВАШ</GradientText>.</p>
              </div>
              <p className="text-2xl font-bold pt-4">
                <GradientText from="from-amber-500" via="via-orange-500" to="to-red-500">
                  Затова ти даваме 100% системата на цената на 20% (добавката).
                </GradientText>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
