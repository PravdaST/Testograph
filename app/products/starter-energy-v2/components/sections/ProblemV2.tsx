import React from 'react';
import { TrendingDown, Battery, Clock, Heart, AlertTriangle, X } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GlassCard from '../shared/GlassCard';
import GradientText from '../shared/GradientText';

export default function ProblemV2() {
  const problems = [
    {
      icon: TrendingDown,
      title: 'СИЛАТА Е STUCK',
      description: 'Бенч press: 100кг. Преди 6 месеца: 100кг. Днес: 100кг. Същите тежести. Нулев прогрес. Питаш се дали просто си губиш времето.',
      emoji: '📉',
      stat: '6 месеца = 0кг прогрес'
    },
    {
      icon: Battery,
      title: 'ЕНЕРГИЯТА Е GONE',
      description: 'Ставаш в 7:00. В 14:00 си мъртъв. След работа? Забрави за зала. Кафе не помага. Енергийни напитки = temporary fix. Проблемът е по-дълбок.',
      emoji: '🔋',
      stat: '14:00 = батерията е празна'
    },
    {
      icon: Clock,
      title: 'RECOVERY Е HELL',
      description: 'Тренираш в понеделник. Четвъртък още боли. DOMS 3-4 дни. Не можеш да тренираш достатъчно често. Мускулите искат 5 дни за възстановяване.',
      emoji: '⏱️',
      stat: '3-4 дни recovery = половината тренировки'
    },
    {
      icon: Heart,
      title: 'ЛИБИДОТО Е МЪРТВО',
      description: 'Преди 3 години беше различно. Сега? Почти никакво желание. Жената забелязва. Ти знаеш че нещо НЕ Е НАРЕД. Но не знаеш КАК да го оправиш.',
      emoji: '❤️',
      stat: '-60% спрямо преди 3 години'
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-red-950/5">
      <AnimatedBackground variant="circles" opacity={0.08} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header - Brutal & Direct */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border-2 border-red-600/40 rounded-full px-6 py-3 mb-4 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">WAKE UP CALL</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
              <GradientText from="from-red-600" via="via-orange-600" to="to-amber-600">
                ТИ ВЕЧЕ ЗНАЕШ ЧЕ НЕЩО НЕ Е НАРЕД.
              </GradientText>
            </h2>

            <p className="text-2xl md:text-3xl text-foreground font-bold">
              Тренираш 4 пъти седмично.
              <br />
              <span className="text-red-500">Резултатите? НУЛА.</span>
            </p>

            <div className="bg-neutral-900 dark:bg-neutral-800 border-2 border-red-500 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-xl text-white font-semibold mb-4">
                Колко още време ще губиш?
              </p>
              <div className="space-y-2 text-neutral-300 text-lg">
                <p>⏰ 4-5 часа седмично в залата</p>
                <p>💰 80-150 лв месечно за добавки</p>
                <p>🥗 Стриктна диета всеки ден</p>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-700">
                <p className="text-2xl font-bold text-red-400">
                  И все още НИЩО НЕ СЕ ПРОМЕНЯ.
                </p>
              </div>
            </div>
          </div>

          {/* Problem Cards - Brutal Reality */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <GlassCard key={index} className="group relative p-8 border-red-500/20 hover:border-red-500/40 transition-all">
                  {/* Emoji Badge */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 border-2 border-white dark:border-neutral-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {problem.emoji}
                  </div>

                  {/* Content */}
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-7 h-7 text-red-500" />
                      <h3 className="text-2xl font-bold text-foreground">{problem.title}</h3>
                    </div>
                    <p className="text-foreground leading-relaxed font-medium">
                      {problem.description}
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 inline-block">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{problem.stat}</p>
                    </div>
                  </div>

                  {/* Animated Bottom Border */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
                </GlassCard>
              );
            })}
          </div>

          {/* What You've Tried - Brutal Truth */}
          <div className="mb-12">
            <GlassCard className="p-8 md:p-10 border-amber-500/30">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                ВЕРОЯТНО СИ ПРОБВАЛ:
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { item: 'Креатин от iHerb', price: '35 лв', result: 'Пълни ли си мускули с вода? ДА. По-силен ли си? НЕ.' },
                  { item: '"Тесто бустер" хапчета', price: '89 лв', result: 'Прочети съставките. Zinc, Magnesium, D-аспартат. Това е.' },
                  { item: 'Онлайн треньор', price: '200 лв/м', result: 'Generic програма от Excel. Същата за всички 150 клиенти.' },
                  { item: 'Нутриционист', price: '150 лв', result: 'Каза ти да ядеш повече протеин. Браво. Това вече го знаеше.' }
                ].map((attempt, idx) => (
                  <div key={idx} className="bg-neutral-900 dark:bg-neutral-800 rounded-xl p-4 border-l-4 border-red-500">
                    <div className="flex items-start gap-3 mb-2">
                      <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{attempt.item}</span>
                          <span className="text-red-400 font-semibold">{attempt.price}</span>
                        </div>
                        <p className="text-sm text-neutral-300">{attempt.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-950/30 dark:to-red-950/30 border-2 border-amber-500/40 rounded-2xl p-6 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  ОБЩО ПОХАРЧЕНИ ПАРИ:
                </p>
                <p className="text-4xl md:text-5xl font-bold mb-3">
                  <GradientText from="from-red-600" via="via-orange-600" to="to-amber-600">
                    500+ ЛВ
                  </GradientText>
                </p>
                <p className="text-lg font-semibold text-foreground mb-2">
                  ПОЛУЧЕНИ РЕЗУЛТАТИ:
                </p>
                <p className="text-3xl font-bold text-red-600">0</p>
              </div>
            </GlassCard>
          </div>

          {/* The Real Problem - No Sugar Coating */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                ПРОБЛЕМЪТ НЕ Е В ТЕГЛАТА
              </h3>

              <div className="space-y-4 text-lg md:text-xl">
                <p className="font-semibold">
                  Проблемът не е че не тренираш достатъчно.
                </p>
                <p className="font-semibold">
                  Проблемът не е че не се стараеш.
                </p>
                <p className="font-semibold">
                  Проблемът не е че не искаш резултати.
                </p>
              </div>

              <div className="my-8 h-1 bg-white/30" />

              <p className="text-2xl md:text-3xl font-bold text-center mb-4">
                ПРОБЛЕМЪТ Е ЧЕ ТИ ЛИПСВАТ 80% ОТ ФОРМУЛАТА
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-xl font-semibold mb-4">Ти имаш:</p>
                <div className="space-y-2 mb-4">
                  <p>✓ Добавка (креатин/протеин) = 20%</p>
                  <p>✓ Мотивация = безценно, но недостатъчно</p>
                </div>
                <p className="text-xl font-semibold mb-4 text-red-200">Ти НЯМАШ:</p>
                <div className="space-y-2">
                  <p>✗ Правилни протоколи за тренировки = 25%</p>
                  <p>✗ Оптимизирана храна за хормони = 30%</p>
                  <p>✗ Сън & recovery протокол = 15%</p>
                  <p>✗ Проследяване & адаптация = 10%</p>
                </div>
              </div>
            </div>

            {/* Final Truth Bomb */}
            <div className="bg-neutral-900 dark:bg-neutral-800 border-2 border-amber-500 rounded-2xl p-8 text-center">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                Без пълната система?
              </p>
              <p className="text-xl text-neutral-300 mb-6">
                След 6 месеца ще си на същото място.
                <br />
                Същите тежести. Същата енергия. Същото либидо.
              </p>
              <p className="text-2xl font-bold">
                <GradientText from="from-amber-500" via="via-orange-500" to="to-red-500">
                  Колко още време можеш да си позволиш да губиш?
                </GradientText>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
