"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TestLayout } from "@/components/test/TestLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get('score') || '50');
  const testosterone = parseFloat(searchParams.get('testosterone') || '20');
  const level = searchParams.get('level') || 'moderate';
  const name = searchParams.get('name') || 'там';

  const getLevelInfo = () => {
    if (score >= 61) {
      return {
        icon: <AlertCircle className="w-20 h-20 text-red-500" />,
        color: 'text-red-500',
        bgColor: 'from-red-500/20 to-red-600/20 border-red-500/40',
        emoji: '🔴',
        title: 'Критично ниво',
        description: 'Твоите симптоми са сериозни и изискват незабавно действие. Нивата на тестостерон вероятно са значително под нормата.'
      };
    } else if (score >= 31) {
      return {
        icon: <AlertTriangle className="w-20 h-20 text-yellow-500" />,
        color: 'text-yellow-500',
        bgColor: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40',
        emoji: '🟡',
        title: 'Умерено ниво',
        description: 'Има признаци на намалени нива на тестостерон. Препоръчително е да предприемеш действия сега, преди симптомите да се влошат.'
      };
    } else {
      return {
        icon: <CheckCircle className="w-20 h-20 text-green-500" />,
        color: 'text-green-500',
        bgColor: 'from-green-500/20 to-green-600/20 border-green-500/40',
        emoji: '🟢',
        title: 'Добро ниво',
        description: 'Нивата ти изглеждат стабилни, но има място за подобрение. Превантивен план ще те поддържа в оптимална форма.'
      };
    }
  };

  const levelInfo = getLevelInfo();

  const getTestosteroneLevel = () => {
    if (testosterone < 12) return { label: '⚠️ Ниско', color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500' };
    if (testosterone > 26) return { label: '⭐ Високо', color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500' };
    return { label: '✓ Нормално', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500' };
  };

  const testLevel = getTestosteroneLevel();

  const handleContinue = () => {
    // Redirect to offer page (we'll use the existing SmartOffer flow)
    router.push('/'); // For now redirect to homepage, later can be offer page
  };

  return (
    <TestLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-fade-in">
        {/* Header with Score */}
        <div className={`relative rounded-2xl p-8 border-2 bg-gradient-to-br ${levelInfo.bgColor} backdrop-blur-sm shadow-2xl`}>
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4 animate-bounce">
              {levelInfo.icon}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {name}, ето твоят резултат!
            </h1>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className={`text-6xl md:text-7xl font-black ${levelInfo.color} tabular-nums`}>
                  {score}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Рисков индекс</p>
              </div>
            </div>

            <div className="pt-4">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg ${levelInfo.color} bg-background/50 border-2 border-current`}>
                <span className="text-2xl">{levelInfo.emoji}</span>
                <span>{levelInfo.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testosterone Level in nmol/L */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-8 border-2 border-blue-500/30">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Изчислено ниво на тестостерон
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className={`text-6xl font-black tabular-nums ${testLevel.color}`}>
                {testosterone}
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-muted-foreground">
                  nmol/L
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg border-2 ${testLevel.color} ${testLevel.bgColor}`}>
              {testLevel.label}
            </div>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-red-500">Под 12 nmol/L:</strong> Ниско ниво - изисква внимание
              </p>
              <p>
                <strong className="text-yellow-500">12-26 nmol/L:</strong> Нормално ниво
              </p>
              <p>
                <strong className="text-green-500">Над 26 nmol/L:</strong> Високо/оптимално ниво
              </p>
            </div>
          </div>
        </div>

        {/* Level Description */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Какво означава това?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {levelInfo.description}
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border-2 border-primary/30 text-center space-y-4">
          <h3 className="text-3xl font-bold text-foreground">
            Какво следва?
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Базирано на твоя резултат, подготвихме персонализирана програма която ще ти помогне да подобриш тестостерона си естествено.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full text-xl py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all hover:scale-105"
        >
          Виж персонализираната програма →
        </Button>
      </div>
    </TestLayout>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <TestLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin text-6xl">⏳</div>
            <p className="text-xl text-muted-foreground">Зареждане на резултата...</p>
          </div>
        </div>
      </TestLayout>
    }>
      <ResultContent />
    </Suspense>
  );
}
