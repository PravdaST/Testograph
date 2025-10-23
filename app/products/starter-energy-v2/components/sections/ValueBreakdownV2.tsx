import React from 'react';
import { Plus, ArrowRight, Gift } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function ValueBreakdownV2() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-green-500/5 via-background to-blue-500/5">
      <AnimatedBackground variant="mixed" opacity={0.1} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText>
                ОБЩА СТОЙНОСТ
              </GradientText>
            </h2>
            <p className="text-xl text-muted-foreground">
              Какво всъщност получаваш
            </p>
          </div>

          {/* Value Calculator */}
          <GlassCard className="p-8 md:p-12 mb-8">
            <div className="space-y-6">

              {/* App System Value */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/50">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Приложение с пълна система
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    4 протокола + чек-ин + проследяване + общност
                  </p>
                </div>
                <div className="text-3xl font-bold text-foreground">147 лв</div>
              </div>

              {/* Plus Icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Supplement Value */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-border">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    TESTOUP добавка
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    60 капсули (30 дози) - 12 активни съставки
                  </p>
                </div>
                <div className="text-3xl font-bold text-foreground">67 лв</div>
              </div>

              {/* Total */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-primary/5 rounded-2xl p-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">
                    ОБЩА СТОЙНОСТ:
                  </h3>
                </div>
                <div className="text-4xl md:text-5xl font-bold">
                  <GradientText from="from-red-500" via="via-orange-500" to="to-amber-500">
                    214 лв
                  </GradientText>
                </div>
              </div>

            </div>
          </GlassCard>

          {/* Your Price */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <GlassCard className="relative bg-gradient-to-br from-primary/10 via-green-500/10 to-blue-500/10 border-2 border-primary/30 p-8 md:p-12 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    ТВОЯ ЦЕНА:
                  </h3>
                  <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                </div>

                <div className="text-6xl md:text-7xl font-bold mb-4">
                  <GradientText from="from-green-500" via="via-blue-500" to="to-purple-600">
                    67 лв
                  </GradientText>
                </div>

                <p className="text-xl text-muted-foreground">за 30 дни</p>

                <div className="inline-block bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-6 py-3 mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    = <GradientText>2.23 лв</GradientText> на ден
                  </p>
                </div>

                <p className="text-lg text-muted-foreground mt-4">
                  По-евтино от кафе.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Gift Statement */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-400/30 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              <h3 className="text-2xl font-bold text-foreground">
                Специална Оферта
              </h3>
              <Gift className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <p className="text-xl font-bold text-foreground mb-2">
              Получаваш протоколите на стойност{' '}
              <span className="text-primary">147 лв</span>{' '}
              <GradientText from="from-amber-500" via="via-orange-500" to="to-red-500">
                БЕЗПЛАТНО
              </GradientText>
              .
            </p>

            <p className="text-lg text-muted-foreground">
              Плащаш само цената на добавката. Всичко друго е подарък.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
