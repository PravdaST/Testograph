import React from 'react';
import { Dumbbell, Apple, Moon, Pill, X, Check } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function FormulaV2() {
  const formulaParts = [
    {
      percentage: 35,
      icon: Dumbbell,
      label: 'Как тренираш',
      details: 'Програма, честота, интензитет',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      percentage: 30,
      icon: Apple,
      label: 'Какво ядеш',
      details: 'Макроси, timing, качество',
      color: 'from-green-500 to-emerald-500'
    },
    {
      percentage: 15,
      icon: Moon,
      label: 'Как спиш',
      details: 'Сън и управление на стреса',
      color: 'from-purple-500 to-pink-500'
    },
    {
      percentage: 20,
      icon: Pill,
      label: 'Добавката',
      details: 'Правилни съставки, дози, timing',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const othersFeatures = [
    'Продават ти бурканче с хапчета',
    'Казват ти "вземай 2 капсули дневно"',
    'Останалите 80%? "Виж в интернет"',
    'Не работи? "Не си тренирал добре"',
    'Искаш протокол? Плати още 200-300 лв',
    'Искаш тренировъчен план? Плати още 150 лв',
    'Искаш план за храна? Плати още 100 лв'
  ];

  const ourFeatures = [
    'Даваме ти ЦЯЛАТА формула (100%)',
    'Точни протоколи за тренировки',
    'Точен план за хранене',
    'Протокол за сън и възстановяване',
    'Добавката с точни дози и timing',
    'Ежедневно проследяване на напредък',
    'Общност за подкрепа'
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-green-500/5">
      <AnimatedBackground variant="mixed" opacity={0.1} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Ключът към успеха</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText>
                100% ФОРМУЛА ЗА УСПЕХ
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Защо добавките сами не работят
            </p>
          </div>

          {/* Formula Breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {formulaParts.map((part, index) => {
              const Icon = part.icon;
              return (
                <GlassCard key={index} className="group p-6 text-center">
                  {/* Percentage Circle */}
                  <div className={`relative mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-br ${part.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{part.percentage}%</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />

                  {/* Label */}
                  <h3 className="text-lg font-bold text-foreground mb-2">{part.label}</h3>
                  <p className="text-sm text-muted-foreground">{part.details}</p>
                </GlassCard>
              );
            })}
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-400/30 rounded-2xl p-8 text-center">
            <p className="text-2xl font-bold text-foreground">
              Ако нямаш първите <span className="text-blue-500">80%</span>,<br />
              последните <span className="text-amber-500">20%</span> са <span className="text-red-500">безполезни</span>.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* ДРУГИТЕ МАРКИ */}
            <GlassCard className="p-8 border-red-500/30">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">ДРУГИТЕ МАРКИ</h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full" />
                </div>

                <div className="space-y-3">
                  {othersFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 text-muted-foreground">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Общо: 500+ лв</p>
                  <p className="text-sm text-muted-foreground">и все още без резултати гарантирани</p>
                </div>
              </div>
            </GlassCard>

            {/* НИЕ */}
            <GlassCard className="p-8 border-green-500/30 relative overflow-hidden">
              {/* Best Choice Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg rotate-12">
                ПЪЛНА СИСТЕМА
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">НИЕ</h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" />
                </div>

                <div className="space-y-3">
                  {ourFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 text-foreground">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                    Всичко на цената на добавката
                  </p>
                  <p className="text-sm text-muted-foreground">67 лв за 100% системата</p>
                </div>
              </div>
            </GlassCard>

          </div>

          {/* Final Statement */}
          <div className="bg-gradient-to-br from-primary/10 via-green-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-4">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              Не искаме допълнителни пари. Искаме <GradientText>ДА УСПЕЕШ</GradientText>.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Когато видиш резултати - ставаш клиент завинаги.<br />
              Когато не видиш резултати - губим те.
            </p>
            <p className="text-2xl font-bold">
              <GradientText>
                Затова ти даваме ВСИЧКО от първия ден.
              </GradientText>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
