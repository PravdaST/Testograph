"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "./QuestionCard";
import { InfoSlide } from "./InfoSlide";
import { quizItems } from "./questions";
import { QuizData, Question, InfoSlide as InfoSlideType } from "./types";
import { calculateTestosteroneScore } from "@/lib/test/scoring";
import { calculateConfidenceIndex } from "@/lib/quiz/confidenceIndexScoring";
import { trackViewContent } from "@/lib/facebook-pixel";
import { motion, AnimatePresence } from "framer-motion";
import {
  AgeGroupVisuals,
  TestosteroneGraph,
  HabitsIndicator,
  SocialProofGrid,
  TimelineVisual,
  TrustFactorGrid,
  CalculatingAnimation,
} from "@/components/quiz-visuals";

export const EngagingQuiz = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizData>({});

  // Restore answers and current index from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('engaging_quiz_answers');
      if (saved) {
        try {
          setAnswers(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved answers:', e);
        }
      }

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
      // Calculate Confidence Index (New Quiz)
      const confidenceResult = calculateConfidenceIndex(answers);

      // Also calculate legacy testosterone score for compatibility
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

      // Save to Supabase via API (bypasses RLS)
      try {
        const saveResponse = await fetch('/api/quiz/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Demographics
            age: String(answers.age), // NEW: Keep as range string
            ed_problem: String(answers['ed-problem']) || null, // NEW: ED problem qualifier
            height: String(answers.height), // NEW: Keep as range string
            weight: String(answers.weight), // NEW: Keep as range string
            profession: String(answers.profession) || null, // NEW
            work_stress: String(answers['work-stress']) || null, // NEW

            // Body composition
            body_fat: String(answers['body-fat']) || null, // NEW

            // Lifestyle
            sleep: String(answers.sleep), // NEW: Keep as range string
            alcohol: String(answers.alcohol),
            nicotine: String(answers.nicotine),
            diet: String(answers.diet),
            stress: Number(answers.stress) || null,

            // Training (legacy fields - keep for compatibility)
            training_frequency: String(answers['training-frequency']) || null,
            training_type: String(answers['training-type']) || null,
            recovery: String(answers.recovery) || null,
            supplements: String(answers.supplements) || null,

            // Intimate questions (NEW)
            sex_frequency: String(answers['sex-frequency']) || null, // NEW
            frustration: String(answers.frustration) || null, // NEW
            one_change: String(answers['one-change']) || null, // NEW

            // Solution fit (NEW)
            past_attempts: String(answers['past-attempts']) || null, // NEW
            decision_criteria: String(answers['decision-criteria']) || null, // NEW
            vision: String(answers.vision) || null, // NEW

            // Symptoms (legacy - may not be filled in new quiz)
            libido: Number(answers.libido) || null,
            morning_erection: String(answers['morning-erection']) || null,
            morning_energy: Number(answers['morning-energy']) || null,
            concentration: Number(answers.concentration) || null,
            mood: String(answers.mood) || null,
            muscle_mass: String(answers['muscle-mass']) || null,

            // Contact
            first_name: String(answers.firstName) || null,
            email: String(answers.email),

            // Results - NEW Confidence Index
            score: confidenceResult.score, // NEW: Confidence Index (0-100)
            confidence_index: confidenceResult.score, // NEW: Explicit field
            testosterone_estimate: confidenceResult.testosteroneEstimate, // NEW
            urgency_level: confidenceResult.urgencyLevel, // NEW
            category_scores: confidenceResult.categoryScores, // NEW: 4 category breakdown
            percentile: confidenceResult.percentile, // NEW: Age-adjusted percentile

            // Timeline predictions
            timeline_day14: confidenceResult.timeline.day14, // NEW
            timeline_day30: confidenceResult.timeline.day30, // NEW
            timeline_day60: confidenceResult.timeline.day60, // NEW
            timeline_day90: confidenceResult.timeline.day90, // NEW

            // Top priority issues
            top_issues: confidenceResult.topIssues, // NEW: Array of top 3 issues

            // Legacy results (for compatibility)
            testosterone_level: result.estimatedTestosterone.value,
            testosterone_category: result.estimatedTestosterone.level,
            risk_level: result.level,
            recommended_tier: result.recommendedTier,

            // Metadata
            source: 'engaging_quiz_v2', // NEW: Mark as new quiz version
            user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            referrer: typeof window !== 'undefined' ? document.referrer : undefined
          })
        });

        let resultToken: string | null = null;

        if (saveResponse.ok) {
          const savedData = await saveResponse.json();
          resultToken = savedData.result_token;
          console.log('✅ Quiz result saved to Supabase with token:', resultToken);
        } else {
          const errorData = await saveResponse.json();
          console.error('Failed to save via API:', errorData);
        }

        // Store token for redirect
        if (typeof window !== 'undefined' && resultToken) {
          sessionStorage.setItem('quiz_result_token', resultToken);
        }

        // Send result email with result page link
        if (resultToken) {
          try {
            await fetch('/api/quiz/send-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: String(answers.email),
                firstName: String(answers.firstName) || 'там',
                score: confidenceResult.score,
                testosterone: confidenceResult.testosteroneEstimate === 'много нисък' ? 8 :
                              confidenceResult.testosteroneEstimate === 'нисък' ? 15 :
                              confidenceResult.testosteroneEstimate === 'среден' ? 19 :
                              confidenceResult.testosteroneEstimate === 'добър' ? 23 : 28,
                testosteroneCategory: confidenceResult.testosteroneEstimate === 'много нисък' || confidenceResult.testosteroneEstimate === 'нисък' ? 'low' :
                                      confidenceResult.testosteroneEstimate === 'среден' ? 'normal' : 'high',
                riskLevel: confidenceResult.urgencyLevel === 'висока' ? 'critical' :
                           confidenceResult.urgencyLevel === 'средна' ? 'moderate' : 'good',
                resultToken: resultToken,
                // NEW: Engaging Quiz fields for new email template
                confidenceIndex: confidenceResult.score,
                categoryScores: confidenceResult.categoryScores,
                topIssues: confidenceResult.topIssues
              })
            });
            console.log('✅ Result email sent (Engaging Quiz)');
          } catch (emailError) {
            console.error('Failed to send result email:', emailError);
            // Don't block the flow if email fails
          }

          // Trigger PDF generation in background (non-blocking)
          fetch('/api/quiz/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resultToken })
          }).then(() => {
            console.log('✅ PDF generation triggered');
          }).catch((pdfError) => {
            console.error('Failed to trigger PDF generation:', pdfError);
          });

          // Trigger AI analysis in background (non-blocking)
          fetch('/api/quiz/analyze-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resultToken })
          }).then(() => {
            console.log('✅ AI analysis triggered');
          }).catch((aiError) => {
            console.error('Failed to trigger AI analysis:', aiError);
          });
        }
      } catch (supabaseError) {
        console.error('Failed to save to Supabase:', supabaseError);
        // Continue anyway - don't block the user flow
      }

      // Clear saved progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('engaging_quiz_answers');
        localStorage.removeItem('engaging_quiz_index');
      }

      // Navigate to result page with token
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('quiz_result_token') : null;
      if (token) {
        router.push(`/test/result/${token}`);
      } else {
        // Fallback to query params if token not available
        router.push(`/test/result?score=${confidenceResult.score}&level=${confidenceResult.level}`);
      }
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

  const renderVisualizationPanel = () => {
    const visualComponent = currentItem.visualComponent;
    const key = `${currentItem.id}-${answers.age}`;

    const calculateHabitsLevel = (): 'unhealthy' | 'average' | 'healthy' => {
        const { diet, nicotine, alcohol, sleep } = answers;
        let healthyCount = 0, unhealthyCount = 0;
        if (diet === 'balanced') healthyCount++; else if (diet === 'processed' || diet === 'none') unhealthyCount++;
        if (nicotine === 'never' || nicotine === 'quit') healthyCount++; else if (nicotine === 'daily') unhealthyCount++;
        if (alcohol === 'never' || alcohol === 'rarely') healthyCount++; else if (alcohol === 'daily') unhealthyCount++;
        if (sleep === '7-8') healthyCount++; else if (sleep === '<6' || sleep === 'poor') unhealthyCount++;
        if (unhealthyCount >= 2) return 'unhealthy';
        if (healthyCount >= 3) return 'healthy';
        return 'average';
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
            >
                {(() => {
                    switch (visualComponent) {
                        case 'AgeGroupIcons':
                            const ageGroup = answers.age as keyof typeof AgeGroupVisuals;
                            const Visual = ageGroup ? AgeGroupVisuals[ageGroup] : () => null;
                            return <div className="w-full max-w-sm"><Visual /></div>;
                        case 'TestosteroneGraph':
                            return <TestosteroneGraph />;
                        case 'HabitsIndicator':
                            return <HabitsIndicator level={calculateHabitsLevel()} />;
                        case 'SocialProofGrid':
                            return <SocialProofGrid />;
                        case 'TimelineVisual':
                            return <TimelineVisual />;
                        case 'TrustFactorGrid':
                            return <TrustFactorGrid />;
                        case 'CalculatingAnimation':
                            return <CalculatingAnimation />;
                        default:
                            return <div className="w-full h-64 bg-[#e6e6e6] rounded-lg border border-gray-200"></div>; // Default placeholder
                    }
                })()}
            </motion.div>
        </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="h-4 bg-gray-200">
          <motion.div
            className="h-4 bg-gradient-to-r from-[#499167] to-[#5fb57e]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Content - Single Column Centered */}
      <div className="flex-1 max-w-[600px] w-full mx-auto px-6 py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {currentItem.type === 'info' ? (
              <>
                <InfoSlide slide={currentItem as InfoSlideType} onContinue={handleNext} />
                {/* Inline visualization for info slides */}
                {currentItem.visualComponent && (
                  <div className="mt-8">
                    {renderVisualizationPanel()}
                  </div>
                )}
              </>
            ) : (
              <QuestionCard
                question={currentItem as Question}
                value={answers[currentItem.id]}
                onChange={(value) => handleAnswer(currentItem.id, value)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentIndex === 0}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 text-center mt-auto">
        <p className="text-sm text-gray-500">
          © 2025 Testograph
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
            Условия
          </a>
          <span className="text-gray-400">|</span>
          <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
            Поверителност
          </a>
        </div>
      </footer>
    </div>
  );
};
