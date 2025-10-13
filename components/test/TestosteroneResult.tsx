"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import type { ScoringResult } from "@/lib/test/scoring";
import { getLevelDescription } from "@/lib/test/scoring";

interface TestosteroneResultProps {
  result: ScoringResult;
  userName: string;
  onContinue: () => void;
}

export const TestosteroneResult = ({ result, userName, onContinue }: TestosteroneResultProps) => {
  const levelInfo = getLevelDescription(result.level);

  const getLevelIcon = () => {
    switch (result.level) {
      case 'critical':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'good':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
  };

  const getScoreColor = () => {
    if (result.totalScore >= 61) return "text-red-500";
    if (result.totalScore >= 31) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreBackground = () => {
    if (result.totalScore >= 61) return "from-red-500/20 to-red-600/20 border-red-500/40";
    if (result.totalScore >= 31) return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/40";
    return "from-green-500/20 to-green-600/20 border-green-500/40";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header with Score */}
      <div className={`relative rounded-2xl p-8 border-2 bg-gradient-to-br ${getScoreBackground()} backdrop-blur-sm shadow-2xl`}>
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            {getLevelIcon()}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {userName}, ето твоят резултат
          </h1>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className={`text-6xl md:text-7xl font-black ${getScoreColor()} tabular-nums`}>
                {result.totalScore}
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
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 md:p-8 border-2 border-blue-500/30">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Изчислено ниво на тестостерон
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className={`text-5xl md:text-6xl font-black tabular-nums ${
              result.estimatedTestosterone.level === 'low' ? 'text-red-500' :
              result.estimatedTestosterone.level === 'high' ? 'text-green-500' :
              'text-yellow-500'
            }`}>
              {result.estimatedTestosterone.value}
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-muted-foreground">
                {result.estimatedTestosterone.unit}
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg border-2 ${
            result.estimatedTestosterone.level === 'low' ? 'text-red-500 bg-red-500/10 border-red-500' :
            result.estimatedTestosterone.level === 'high' ? 'text-green-500 bg-green-500/10 border-green-500' :
            'text-yellow-500 bg-yellow-500/10 border-yellow-500'
          }`}>
            {result.estimatedTestosterone.level === 'low' && '⚠️ Ниско'}
            {result.estimatedTestosterone.level === 'normal' && '✓ Нормално'}
            {result.estimatedTestosterone.level === 'high' && '⭐ Високо'}
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
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 md:p-8 border border-primary/20">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Какво означава това?
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {levelInfo.description}
        </p>
      </div>

      {/* Top Issues */}
      {result.topIssues.length > 0 && (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-6 md:p-8 border border-red-500/30">
          <div className="flex items-start gap-3 mb-4">
            <Activity className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Критични зони</h3>
              <p className="text-sm text-muted-foreground mt-1">Тези фактори влияят най-силно върху тестостерона ти</p>
            </div>
          </div>
          <ul className="space-y-3">
            {result.topIssues.map((issue, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-lg">•</span>
                <span className="text-base text-foreground">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {result.riskFactors.length > 0 && (
        <div className="bg-background/50 rounded-xl p-6 md:p-8 border border-border/50 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Рискови фактори</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Открихме {result.riskFactors.length} фактор{result.riskFactors.length === 1 ? '' : 'а'} които можеш да подобриш
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {result.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-muted/20"
              >
                <span className="text-primary text-sm">✓</span>
                <span className="text-sm text-foreground">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 md:p-8 border-2 border-primary/30 text-center space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          Какво следва?
        </h3>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Базирано на твоя резултат, подготвихме персонализирана програма която ще ти помогне да подобриш тестостерона си естествено.
        </p>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onContinue}
        size="lg"
        className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold shadow-2xl transition-all"
      >
        Виж персонализираната програма →
      </Button>

      {/* Score Explanation */}
      <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
        <h4 className="text-sm font-semibold text-foreground mb-3">Как се изчислява резултатът?</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span>🟢 Добро ниво</span>
            <span className="font-mono">0-30 точки</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-muted/20">
            <span>🟡 Умерено ниво</span>
            <span className="font-mono">31-60 точки</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>🔴 Критично ниво</span>
            <span className="font-mono">61-100 точки</span>
          </div>
        </div>
      </div>
    </div>
  );
};
