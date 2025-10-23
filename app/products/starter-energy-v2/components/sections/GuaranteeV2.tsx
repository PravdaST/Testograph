import React from 'react';
import { Shield, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function GuaranteeV2() {
  const steps = [
    {
      number: 1,
      title: 'Поръчваш системата днес',
      description: '67 лв',
      icon: Shield
    },
    {
      number: 2,
      title: 'Даваш 100% от себе си за 30 дни',
      description: 'Следваш протоколите',
      icon: TrendingUp
    },
    {
      number: 3,
      title: 'Оценяваш резултатите',
      description: 'Работи или пари назад',
      icon: RefreshCw
    }
  ];

  const requirements = [
    'Попълваш ежедневния чек-ин (5 въпроса, 2 минути)',
    'Следваш тренировъчния протокол (3-4x седмично)',
    'Следваш хранителния протокол',
    'Вземаш добавката според инструкциите',
    'Прилагаш протокола за сън и стрес'
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-green-500/5 via-background to-blue-500/5">
      <AnimatedBackground variant="circles" opacity={0.08} colors={{ primary: 'rgb(34, 197, 94)', secondary: 'rgb(59, 130, 246)', tertiary: 'rgb(16, 185, 129)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Нулев Риск</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-green-500" via="via-blue-500" to="to-purple-600">
                🛡️ НАШАТА ГАРАНЦИЯ ЗА РЕЗУЛТАТИ
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ето как работи:
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connecting Line (desktop only) */}
                  {step.number < 3 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-primary/30 to-transparent -z-10" />
                  )}

                  <GlassCard className="p-6 text-center h-full">
                    {/* Step Number */}
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <Icon className="w-10 h-10 mx-auto mb-4 text-primary" />

                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* What 100% Means */}
          <GlassCard className="p-8 md:p-10">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Какво означава <GradientText>"100%"</GradientText>:
            </h3>

            <div className="space-y-3 max-w-2xl mx-auto">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-primary/5 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{req}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Refund Process */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-500/30 rounded-3xl p-8 md:p-10">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Ако СИ ДАЛ 100% и системата не работи за теб:
            </h3>

            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  →
                </div>
                <p className="text-foreground">Пишеш ни на [имейл/telegram]</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  →
                </div>
                <p className="text-foreground">Показваш ни check-in записите (автоматични от app)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  ✓
                </div>
                <p className="text-foreground font-bold">Връщаме 100% от парите без въпроси</p>
              </div>
            </div>
          </div>

          {/* Why This Guarantee */}
          <div className="text-center space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              ЗАЩО ТАЗИ ГАРАНЦИЯ?
            </h3>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 max-w-3xl mx-auto space-y-4">
              <p className="text-xl text-foreground">
                Системата работи. Това е факт от <span className="font-bold text-primary">127 потребители</span>.
              </p>
              <p className="text-xl text-foreground">
                Но работи <span className="font-bold">САМО ако я следваш</span>.
              </p>
              <p className="text-xl font-bold text-foreground">
                Ние гарантираме резултати ако <GradientText>ТИ гарантираш усилие</GradientText>.
              </p>
            </div>

            {/* Fair Exchange */}
            <div className="bg-gradient-to-r from-primary/10 to-green-500/10 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-foreground mb-4">Справедлив обмен:</h4>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-card/50 rounded-xl p-4">
                  <p className="font-bold text-primary mb-2">ТИ →</p>
                  <p className="text-foreground">Даваш 100% усилие</p>
                </div>
                <div className="bg-card/50 rounded-xl p-4">
                  <p className="font-bold text-green-500 mb-2">НИЕ →</p>
                  <p className="text-foreground">Гарантираме резултати или пари назад</p>
                </div>
              </div>
            </div>

            {/* Final Stats */}
            <div className="pt-6">
              <p className="text-2xl font-bold text-foreground mb-2">
                127 потребители. <span className="text-green-500">94% виждат резултати.</span>
              </p>
              <p className="text-xl text-muted-foreground mb-4">
                Защо? Защото <span className="font-bold text-foreground">СЛЕДВАТ системата</span>.
              </p>
              <div className="space-y-2 max-w-xl mx-auto">
                <p className="text-lg text-foreground">Ако следваш - успяваш.</p>
                <p className="text-lg text-muted-foreground">Ако не следваш - не е вина на системата.</p>
                <p className="text-2xl font-bold mt-4">
                  <GradientText>
                    Рискът е изцяло наш когато ТИ работиш.
                  </GradientText>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
