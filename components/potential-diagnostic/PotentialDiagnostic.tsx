import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, PHASES } from './questions';
import { Question, Answer } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

// [VISUAL PLACEHOLDER] - Икони за въпросите от Фаза 1
import { FaBed, FaBrain, FaAppleAlt, FaDumbbell } from 'react-icons/fa';

const ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  good_sleep: FaBed,
  ok_sleep: FaBed,
  bad_sleep: FaBed,
  interrupted_sleep: FaBed,
  high_stress: FaBrain,
  medium_stress: FaBrain,
  low_stress: FaBrain,
  clean_diet: FaAppleAlt,
  mixed_diet: FaAppleAlt,
  no_diet: FaAppleAlt,
  active: FaDumbbell,
  semi_active: FaDumbbell,
  inactive: FaDumbbell,
};

export const PotentialDiagnostic: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showPhaseFeedback, setShowPhaseFeedback] = useState(false);

  const currentQuestion = useMemo(() => QUESTIONS[currentQuestionIndex], [currentQuestionIndex]);
  const currentPhase = useMemo(() => PHASES.find(p => p.id === currentQuestion.phase), [currentQuestion]);

  const handleAnswer = (answerValue: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);

    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = QUESTIONS[nextQuestionIndex];

    if (nextQuestion && nextQuestion.phase !== currentQuestion.phase) {
      setShowPhaseFeedback(true);
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    setShowPhaseFeedback(false);
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const progress = useMemo(() => ((currentQuestionIndex + 1) / QUESTIONS.length) * 100, [currentQuestionIndex]);

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {currentQuestion.answers?.map((answer) => {
              const Icon = ICONS[answer.value];
              return (
                <motion.div
                  key={answer.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto justify-start p-4 text-left text-base flex items-center gap-4 hover:bg-primary/10 hover:border-primary"
                    onClick={() => handleAnswer(answer.value)}
                  >
                    {/* [VISUAL PLACEHOLDER] - Икона за отговор */}
                    {Icon && <Icon className="h-6 w-6 text-primary/70" />}
                    <span>{answer.text}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        );
      case 'email':
        return (
            <form onSubmit={(e) => { e.preventDefault(); alert('Email submitted!')}} className="space-y-4">
                <Input type="email" placeholder="Вашият имейл..." className="h-12 text-lg" required />
                <Button type="submit" className="w-full h-12 text-lg">Изпратете ми протокола</Button>
            </form>
        )
      default:
        return null;
    }
  };

  if (showPhaseFeedback && currentPhase) {
    return (
      <motion.div
        key={`phase-${currentPhase.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center p-8 bg-card/50 rounded-lg"
      >
        <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{currentPhase.feedbackTitle}</h2>
        <p className="text-muted-foreground mb-6">{currentPhase.feedbackSubtitle}</p>
        <Button onClick={goToNextQuestion}>Продължи</Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary mb-2">{currentPhase?.name} - Стъпка {currentQuestionIndex + 1} от {QUESTIONS.length}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && <p className="text-muted-foreground mt-2">{currentQuestion.subtitle}</p>}
          </div>
          
          {/* [VISUAL PLACEHOLDER] - Тук ще дойдат големите визуализации за фаза 2 и 3 */}
          <div className="my-8 h-32 bg-white/5 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">[Визуализация]</p>
          </div>

          {renderQuestion()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};
