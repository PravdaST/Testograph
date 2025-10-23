import React from 'react';
import { Check, X, AlertTriangle, TrendingDown, DollarSign, Shield } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function CompetitorAttack() {
  const features = [
    { label: 'Добавка (12 съставки)', icon: '💊' },
    { label: 'Тренировъчни протоколи', icon: '💪' },
    { label: 'Хранителни протоколи', icon: '🍖' },
    { label: 'Сън & Recovery', icon: '😴' },
    { label: 'Проследяване прогрес', icon: '📊' },
    { label: 'Telegram общност', icon: '💬' },
    { label: 'Персонализация', icon: '🎯' },
    { label: 'Научно базирано', icon: '🔬' }
  ];

  const competitors = [
    {
      name: 'iHerb / Amazon\nДобавки',
      logo: '🛒',
      price: '80-150 лв/м',
      color: 'from-gray-500 to-gray-600',
      problems: [
        'Само хапчета (20% от формулата)',
        'Сам трябва да разбереш дозировки',
        'Няма план за тренировки',
        'Няма храна / сън протоколи',
        'Generic advice от интернет'
      ],
      result: 'Харчиш пари. Гадаеш. Няма резултати.',
      checks: [true, false, false, false, false, false, false, false]
    },
    {
      name: 'Онлайн/Фитнес\nТреньор',
      logo: '🏃',
      price: '200-400 лв/м',
      color: 'from-blue-500 to-blue-600',
      problems: [
        'Скъпо (200+ лв/месец)',
        'Generic програма (copy-paste)',
        'Не се занимава с добавки',
        'Не проследява хормони',
        'Често няма real expertise'
      ],
      result: 'Плащаш много. Получаваш малко.',
      checks: [false, true, true, false, true, false, false, false]
    },
    {
      name: 'Български "Чудо"\nБрандове',
      logo: '💊',
      price: '120-200 лв',
      color: 'from-red-500 to-orange-500',
      problems: [
        'Обещават чудеса (лъжат)',
        'Съставки под 50% от declared',
        'Няма научни доказателства',
        'Агресивен маркетинг, нула резултати',
        'Не връщат пари'
      ],
      result: 'Измама. Хвърлени пари. Загубено време.',
      checks: [false, false, false, false, false, false, false, false]
    },
    {
      name: 'Стероиди\n(Black Market)',
      logo: '💉',
      price: '300-800 лв/цикъл',
      color: 'from-purple-500 to-pink-500',
      problems: [
        'Здравословни рискове (сериозни)',
        'Хормонален crash след цикъл',
        'Трябва PCT (Post-Cycle Therapy)',
        'Странични ефекти (акне, гинеко)',
        'Illegal в България'
      ],
      result: 'Резултати? ДА. Но на каква цена?',
      checks: [false, true, false, false, false, false, false, false]
    },
    {
      name: 'TESTOGRAPH\nСистема',
      logo: '🎯',
      price: '67-179 лв',
      color: 'from-green-500 to-blue-500',
      isWinner: true,
      problems: null,
      result: '100% ПЪЛНА СИСТЕМА. Всичко на едно място.',
      checks: [true, true, true, true, true, true, true, true]
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-neutral-50 dark:to-neutral-900">
      <AnimatedBackground variant="circles" opacity={0.06} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-full px-4 py-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">Brutal Честност</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-red-500" via="via-orange-500" to="to-amber-500">
                ВЕРОЯТНО СИ ПРОБВАЛ ВСИЧКО ОТ ТОВА
              </GradientText>
            </h2>

            <p className="text-xl md:text-2xl text-foreground font-semibold max-w-3xl mx-auto">
              Ето защо не работи. И защо TESTOGRAPH е различен.
            </p>
          </div>

          {/* Comparison Table - Mobile Optimized */}
          <div className="space-y-6 lg:hidden">
            {competitors.map((comp, idx) => (
              <GlassCard
                key={idx}
                className={`p-6 ${comp.isWinner ? 'border-2 border-green-500 shadow-xl' : 'border-red-500/20'}`}
              >
                {comp.isWinner && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ПОБЕДИТЕЛ
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{comp.logo}</div>
                  <h3 className="text-lg font-bold text-foreground whitespace-pre-line">{comp.name}</h3>
                  <p className={`text-sm font-semibold mt-1 ${comp.isWinner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {comp.price}
                  </p>
                </div>

                {comp.problems && (
                  <div className="mb-4 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">ПРОБЛЕМИ:</p>
                    <div className="space-y-1">
                      {comp.problems.map((problem, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{problem}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`p-3 rounded-lg text-center ${comp.isWinner ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <p className={`text-sm font-bold ${comp.isWinner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {comp.result}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Comparison Table - Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <GlassCard className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="p-4 text-left">
                      <p className="text-sm font-semibold text-muted-foreground">Какво получаваш?</p>
                    </th>
                    {competitors.map((comp, idx) => (
                      <th key={idx} className="p-4 text-center min-w-[160px]">
                        <div className={`${comp.isWinner ? 'relative' : ''}`}>
                          {comp.isWinner && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                              ✓ ПОБЕДИТЕЛ
                            </div>
                          )}
                          <div className="text-4xl mb-2">{comp.logo}</div>
                          <p className="text-sm font-bold text-foreground whitespace-pre-line leading-tight mb-1">
                            {comp.name}
                          </p>
                          <p className={`text-xs font-semibold ${comp.isWinner ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                            {comp.price}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-muted/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{feature.icon}</span>
                          <span className="text-sm font-medium text-foreground">{feature.label}</span>
                        </div>
                      </td>
                      {competitors.map((comp, compIdx) => (
                        <td key={compIdx} className="p-4 text-center">
                          {comp.checks[idx] ? (
                            <Check className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-red-500 mx-auto opacity-40" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Competitor-Specific Callouts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitors.slice(0, 4).map((comp, idx) => (
              <GlassCard key={idx} className="p-6 border-red-500/20">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{comp.logo}</div>
                  <h4 className="font-bold text-foreground text-sm whitespace-pre-line">{comp.name}</h4>
                </div>

                {comp.problems && (
                  <div className="space-y-2 mb-4">
                    {comp.problems.map((problem, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{problem}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    {comp.result}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Why TESTOGRAPH Wins */}
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 md:p-12 border-2 border-green-500/30 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🎯
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  <GradientText>ЗАЩО TESTOGRAPH ПЕЧЕЛИ?</GradientText>
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    icon: Shield,
                    title: 'ПЪЛНА СИСТЕМА',
                    desc: 'Не само хапчета. Цялата формула (100%). Добавка + Тренировки + Храна + Сън + Tracking.',
                    color: 'text-green-500'
                  },
                  {
                    icon: DollarSign,
                    title: 'ЧЕСТНА ЦЕНА',
                    desc: '67-179 лв за ВСИЧКО. Другите искат 200+ лв само за един елемент. Ние даваме цялата система.',
                    color: 'text-blue-500'
                  },
                  {
                    icon: TrendingUp,
                    title: 'ДОКАЗАНИ РЕЗУЛТАТИ',
                    desc: '127 мъже. 94% успех rate. Реални testimonials. Не обещания - факти.',
                    color: 'text-purple-500'
                  },
                  {
                    icon: Check,
                    title: 'НУЛЕВ РИСК',
                    desc: '30 дни гаранция. Не работи? Пари назад. Няма fine print. Няма bullshit.',
                    color: 'text-amber-500'
                  }
                ].map((point, idx) => {
                  const Icon = point.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${point.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">{point.title}</h4>
                        <p className="text-sm text-muted-foreground">{point.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-500/20 rounded-2xl p-6 text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  ДРУГИТЕ продават ЧАСТИ.
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  <GradientText>НИЕ даваме ЦЯЛАТА СИСТЕМА.</GradientText>
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Final Truth */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-neutral-900 dark:bg-neutral-800 border-2 border-amber-500 rounded-2xl p-8">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                Истината?
              </p>
              <p className="text-lg text-neutral-300 mb-4">
                Можеш да харчиш 500+ лв за части от различни места.
                <br />
                Можеш да гадаеш как да ги комбинираш.
                <br />
                Можеш да чакаш 6-12 месеца за резултати (може би).
              </p>
              <div className="h-1 bg-amber-500 w-24 mx-auto my-6" />
              <p className="text-xl md:text-2xl font-bold text-amber-400 mb-2">
                ИЛИ
              </p>
              <p className="text-xl md:text-2xl font-bold">
                <GradientText from="from-green-500" via="via-blue-500" to="to-purple-500">
                  Вземаш TESTOGRAPH. Следваш системата. Виждаш резултати за 30 дни.
                </GradientText>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
