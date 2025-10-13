"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "./QuestionCard";
import { InfoSlide } from "./InfoSlide";
import { quizItems } from "./questions";
import { QuizData, Question, InfoSlide as InfoSlideType } from "./types";
import { calculateTestosteroneScore } from "@/lib/test/scoring";
import { trackViewContent } from "@/lib/facebook-pixel";
import { saveQuizResult } from "@/lib/supabase";

export const EngagingQuiz = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('engaging_quiz_answers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });

  // Restore current index from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIndex = localStorage.getItem('engaging_quiz_index');
      if (savedIndex) {
        setCurrentIndex(parseInt(savedIndex));
      }
    }
  }, []);

  // Auto-save answers and index
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('engaging_quiz_answers', JSON.stringify(answers));
      localStorage.setItem('engaging_quiz_index', currentIndex.toString());
    }
  }, [answers, currentIndex]);

  const currentItem = quizItems[currentIndex];
  const isQuestion = currentItem.type !== 'info';
  const currentQuestion = isQuestion ? (currentItem as Question) : null;

  const progress = ((currentIndex + 1) / quizItems.length) * 100;
  const totalQuestions = quizItems.filter(item => item.type !== 'info').length;
  const answeredQuestions = Object.keys(answers).length;

  const canProceed = () => {
    if (!isQuestion || !currentQuestion) return true;

    const value = answers[currentQuestion.id];
    if (currentQuestion.required) {
      if (currentQuestion.type === 'text' || currentQuestion.type === 'email') {
        return value && (value as string).trim().length > 0;
      }
      return value !== undefined && value !== null;
    }
    return true;
  };

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < quizItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Quiz completed - submit
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate score
      const quizData = {
        age: Number(answers.age) || 30,
        weight: Number(answers.weight) || 75,
        height: Number(answers.height) || 175,
        trainingFrequency: String(answers['training-frequency'] || 'none'),
        trainingType: [String(answers['training-type'] || 'none')],
        supplements: String(answers.supplements || ''),
        averageSleep: Number(answers.sleep) || 7,
        diet: String(answers.diet || 'balanced'),
        alcohol: convertAlcoholToNumber(String(answers.alcohol)),
        nicotine: String(answers.nicotine || 'none'),
        libido: String(convertScaleToLevel(Number(answers.libido))),
        morningErection: String(answers['morning-erection'] || 'sometimes'),
        morningEnergy: String(convertScaleToLevel(Number(answers['morning-energy']))),
        recovery: String(answers.recovery || 'normal'),
        mood: String(answers.mood || 'stable')
      };

      const result = calculateTestosteroneScore(quizData);

      // Track event
      trackViewContent('Engaging Quiz Completed', 'engaging_quiz');

      // Save to Supabase
      try {
        await saveQuizResult({
          // Demographics
          age: Number(answers.age),
          height: Number(answers.height),
          weight: Number(answers.weight),

          // Lifestyle
          sleep: Number(answers.sleep),
          alcohol: String(answers.alcohol),
          nicotine: String(answers.nicotine),
          diet: String(answers.diet),
          stress: Number(answers.stress),

          // Training
          training_frequency: String(answers['training-frequency']),
          training_type: String(answers['training-type']),
          recovery: String(answers.recovery),
          supplements: String(answers.supplements) || null,

          // Symptoms
          libido: Number(answers.libido),
          morning_erection: String(answers['morning-erection']),
          morning_energy: Number(answers['morning-energy']),
          concentration: Number(answers.concentration),
          mood: String(answers.mood),
          muscle_mass: String(answers['muscle-mass']),

          // Contact
          first_name: String(answers.firstName),
          email: String(answers.email),

          // Results
          score: result.totalScore,
          testosterone_level: result.estimatedTestosterone.value,
          testosterone_category: result.estimatedTestosterone.level,
          risk_level: result.level,
          recommended_tier: result.recommendedTier,

          // Metadata
          source: 'engaging_quiz',
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          referrer: typeof window !== 'undefined' ? document.referrer : undefined
        });
        console.log('✅ Quiz result saved to Supabase');
      } catch (supabaseError) {
        console.error('Failed to save to Supabase:', supabaseError);
        // Continue anyway - don't block the user flow
      }

      // Send result email
      try {
        await fetch('/api/quiz/send-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: String(answers.email),
            firstName: String(answers.firstName),
            score: result.totalScore,
            testosterone: result.estimatedTestosterone.value,
            testosteroneCategory: result.estimatedTestosterone.level,
            riskLevel: result.level
          })
        });
        console.log('✅ Quiz result email sent');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue anyway - don't block the user flow
      }

      // Submit to webhook (legacy)
      try {
        await fetch('https://xtracts4u.app.n8n.cloud/webhook/testo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...answers,
            source: 'engaging_quiz',
            score: result.totalScore,
            level: result.level,
            estimatedTestosterone: result.estimatedTestosterone.value,
            recommendedTier: result.recommendedTier
          })
        });
      } catch (webhookError) {
        console.error('Failed to send to webhook:', webhookError);
        // Continue anyway
      }

      // Clear saved progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('engaging_quiz_answers');
        localStorage.removeItem('engaging_quiz_index');
      }

      // Navigate to result
      router.push(`/test/result?score=${result.totalScore}&testosterone=${result.estimatedTestosterone.value}&level=${result.level}&name=${answers.firstName || 'там'}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Continue anyway
      router.push('/test/result');
    }
  };

  // Helper functions to convert answers
  const convertAlcoholToNumber = (value: string): number => {
    const map: { [key: string]: number } = {
      'never': 0,
      'rarely': 2,
      'weekly': 5,
      'often': 10
    };
    return map[value] || 0;
  };

  const convertScaleToLevel = (value: number): string => {
    if (value >= 8) return 'high';
    if (value >= 5) return 'normal';
    if (value >= 3) return 'low';
    return 'very-low';
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">
              Въпрос {answeredQuestions} от {totalQuestions}
            </div>
            <div className="text-sm font-medium text-primary">
              {Math.round(progress)}% завършено
            </div>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        {currentItem.type === 'info' ? (
          <InfoSlide
            slide={currentItem as InfoSlideType}
            onContinue={handleNext}
          />
        ) : (
          <QuestionCard
            question={currentQuestion!}
            value={answers[currentQuestion!.id]}
            onChange={(value) => handleAnswer(currentQuestion!.id, value)}
            onNext={handleNext}
            canProceed={canProceed()}
          />
        )}
      </div>

      {/* Back Button (only for questions) */}
      {currentIndex > 0 && isQuestion && (
        <button
          onClick={handlePrevious}
          className="fixed bottom-8 left-8 px-6 py-3 rounded-full bg-muted hover:bg-muted/80 text-foreground font-semibold shadow-lg transition-all hover:scale-105"
        >
          ← Назад
        </button>
      )}
    </div>
  );
};
