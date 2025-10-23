'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle, TrendingUp, Mail, Sparkles, ArrowRight } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

type Answer = string | null;

export default function QuizLeadMagnet() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([null, null, null, null, null]);
  const [email, setEmail] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'Как би оценил енергийните си нива през деня?',
      options: [
        { label: '1-3: Постоянно уморен', value: 'low', emoji: '😴' },
        { label: '4-6: Средно, но може по-добре', value: 'medium', emoji: '😐' },
        { label: '7-8: Добре, но не като преди', value: 'good', emoji: '🙂' },
        { label: '9-10: Перфектно', value: 'excellent', emoji: '💪' }
      ]
    },
    {
      id: 2,
      question: 'Колко пъти седмично тренираш?',
      options: [
        { label: 'Не тренирам редовно', value: 'none', emoji: '❌' },
        { label: '1-2 пъти', value: 'light', emoji: '🏃' },
        { label: '3-4 пъти', value: 'regular', emoji: '💪' },
        { label: '5+ пъти', value: 'intense', emoji: '🔥' }
      ]
    },
    {
      id: 3,
      question: 'Какви добавки вземаш понастоящем?',
      options: [
        { label: 'Никакви', value: 'none', emoji: '🚫' },
        { label: 'Протеин/Креатин', value: 'basic', emoji: '💊' },
        { label: 'Тесто бустери', value: 'testo', emoji: '🧪' },
        { label: 'Много различни', value: 'many', emoji: '💰' }
      ]
    },
    {
      id: 4,
      question: 'Каква е най-важната ти цел?',
      options: [
        { label: 'Повече енергия', value: 'energy', emoji: '⚡' },
        { label: 'Повече сила и мускули', value: 'strength', emoji: '💪' },
        { label: 'По-добро либидо', value: 'libido', emoji: '❤️' },
        { label: 'Всичко горе', value: 'all', emoji: '🎯' }
      ]
    },
    {
      id: 5,
      question: 'Колко време се опитваш да подобриш тези неща?',
      options: [
        { label: 'Току-що започвам', value: 'new', emoji: '🆕' },
        { label: '1-3 месеца', value: 'short', emoji: '📅' },
        { label: '6+ месеца', value: 'medium', emoji: '⏰' },
        { label: '1+ година', value: 'long', emoji: '😤' }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);

    // Auto-advance to next question after 300ms
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setShowResults(true);
    setIsSubmitting(false);

    // Here you would send data to your backend/CRM
    console.log('Quiz Data:', { answers, email });
  };

  const getRecommendation = () => {
    const energyLevel = answers[0];
    const goal = answers[3];
    const duration = answers[4];

    if (energyLevel === 'low' || energyLevel === 'medium') {
      return {
        title: 'Системата е ПЕРФЕКТНА за теб',
        message: 'Базирайки се на отговорите ти, имаш ОГРОМЕН потенциал за подобрение. Повечето мъже с твоя профил виждат +20-30% подобрение в енергията за 14 дни.',
        urgency: 'Критично: Колкото по-дълго чакаш, толкова по-трудно става.',
        package: 'Performance (127 лв) - Препоръчан'
      };
    }

    if (duration === 'long' || duration === 'medium') {
      return {
        title: 'Време е за СИСТЕМА, не експерименти',
        message: 'Опитваш се достатъчно дълго. Проблемът не е мотивацията - липсва ти правилният протокол. 91% от мъжете с твоя профил виждат резултати за под 30 дни.',
        urgency: 'Не губи още време с непълни решения.',
        package: 'Complete (179 лв) - За макс резултати'
      };
    }

    return {
      title: 'Отличен момент да започнеш ПРАВИЛНО',
      message: 'Вместо да губиш месеци с trial & error, започни с проверена система. Това което щеше да ти отнеме 6-12 месеца сам, можеш да постигнеш за 30-60 дни.',
      urgency: 'Старт advantage: Започни правилно от ден 1.',
      package: 'Starter (67 лв) - Перфектен за старт'
    };
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (showResults) {
    const recommendation = getRecommendation();

    return (
      <section id="quiz" className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-green-500/5 to-blue-500/5">
        <AnimatedBackground variant="circles" opacity={0.08} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-8 md:p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <GradientText>Анализът е готов!</GradientText>
                </h2>
                <p className="text-muted-foreground">Базирано на твоите отговори</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-500/30 rounded-2xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">{recommendation.title}</h3>
                <p className="text-lg text-foreground mb-4">{recommendation.message}</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="font-bold text-red-600 dark:text-red-400">{recommendation.urgency}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="font-semibold text-foreground">
                    Препоръчан пакет: <span className="text-green-600 dark:text-green-400 font-bold">{recommendation.package}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="group w-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Виж Препоръчания Пакет</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>

                <p className="text-sm text-muted-foreground">
                  ✓ 30 дни гаранция • ✓ Без риск • ✓ Само {answers[4] === 'long' ? '47' : '52'} пакета останали
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quiz" className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-green-500/5 to-blue-500/5">
      <AnimatedBackground variant="circles" opacity={0.08} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Безплатен Тест</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <GradientText from="from-primary" via="via-blue-600" to="to-purple-600">
                ВИЖ ДАЛИ СИСТЕМАТА Е ЗА ТЕБ
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground">
              5 въпроса • 30 секунди • Персонализирана препоръка
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">
                Въпрос {currentStep + 1} от {questions.length}
              </span>
              <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {currentStep < questions.length && (
            <GlassCard className="p-8 md:p-10">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {questions[currentStep].question}
                </h3>
                <p className="text-sm text-muted-foreground">Избери едно от следните:</p>
              </div>

              <div className="space-y-3">
                {questions[currentStep].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.value)}
                    className={`group w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                      answers[currentStep] === option.value
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{option.emoji}</div>
                        <span className="text-lg font-semibold text-foreground">{option.label}</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {currentStep > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    ← Назад
                  </button>
                  {currentStep === questions.length - 1 && answers[currentStep] && (
                    <p className="text-sm text-primary font-semibold">Последен въпрос!</p>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {/* Email Capture - Shows after all questions */}
          {currentStep === questions.length && !answers.includes(null) && (
            <GlassCard className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Почти готово!
                </h3>
                <p className="text-lg text-muted-foreground">
                  Въведи имейл за да получиш персонализираната си препоръка
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="твоят@имейл.com"
                    required
                    className="w-full px-6 py-4 rounded-xl border-2 border-border focus:border-primary bg-background text-foreground text-lg outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Генерира се...</span>
                  ) : (
                    <>
                      <span>Виж Резултатите</span>
                      <TrendingUp className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  Няма да споделяме имейла ти. Използваме го само за да изпратим резултатите.
                </p>
              </form>

              <div className="mt-6 flex justify-start">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  ← Промени отговор
                </button>
              </div>
            </GlassCard>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>2 минути тест</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Персонализирани резултати</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Без спам</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
