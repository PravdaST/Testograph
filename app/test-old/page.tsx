"use client";

import { useState } from "react";
import { TestLayout } from "@/components/test/TestLayout";
import { QuizForm } from "@/components/test/QuizForm";
import { TestosteroneResult } from "@/components/test/TestosteroneResult";
import { SmartOffer } from "@/components/test/SmartOffer";
import { calculateTestosteroneScore, type QuizData, type ScoringResult } from "@/lib/test/scoring";
import { trackLead, trackViewContent } from "@/lib/facebook-pixel";

type PageState = 'quiz' | 'result' | 'offer';

// Metadata is handled in layout.tsx since this is a client component

export default function TestPage() {
  const [pageState, setPageState] = useState<PageState>('quiz');
  const [quizData, setQuizData] = useState<QuizData & { email: string; firstName: string } | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  const handleQuizComplete = async (data: QuizData & { email: string; firstName: string }) => {
    // Calculate the score
    const result = calculateTestosteroneScore(data);

    // Store data
    setQuizData(data);
    setScoringResult(result);

    // Track event
    trackViewContent('Test Assessment Completed', 'test_assessment');

    // Submit to webhook
    try {
      await fetch('https://xtracts4u.app.n8n.cloud/webhook/testo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'test_page',
          score: result.totalScore,
          level: result.level,
          recommendedTier: result.recommendedTier
        })
      });

      // Track lead
      trackLead('Testograph Test Assessment', 0);
    } catch (error) {
      console.error('Failed to submit to webhook:', error);
      // Continue anyway - don't block user flow
    }

    // Show result
    setPageState('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToOffer = () => {
    setPageState('offer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TestLayout>
      {pageState === 'quiz' && (
        <div className="container mx-auto max-w-5xl py-8 md:py-12">
          {/* Hero Header */}
          <div className="text-center space-y-6 mb-12 max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Оценка на тестостерона
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Направи безплатна оценка на нивото на тестостерона си за 3 минути
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>100% безплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>3 минути</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Персонализиран резултат</span>
              </div>
            </div>
          </div>

          {/* Quiz Form */}
          <QuizForm onComplete={handleQuizComplete} />
        </div>
      )}

      {pageState === 'result' && scoringResult && quizData && (
        <TestosteroneResult
          result={scoringResult}
          userName={quizData.firstName}
          onContinue={handleContinueToOffer}
        />
      )}

      {pageState === 'offer' && scoringResult && quizData && (
        <SmartOffer
          result={scoringResult}
          userData={{
            firstName: quizData.firstName,
            age: quizData.age.toString(),
            weight: quizData.weight.toString(),
            height: quizData.height.toString(),
            libido: quizData.libido,
            morningEnergy: quizData.morningEnergy,
            mood: quizData.mood
          }}
        />
      )}
    </TestLayout>
  );
}
