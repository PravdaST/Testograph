import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatComparisonProps {
  label: string;
  beforeValue: number;
  afterValue: number;
  unit: string;
  normalRange: string;
  isHigherBetter?: boolean;
  maxValue?: number; // For scale
}

export const StatComparison = ({
  label,
  beforeValue,
  afterValue,
  unit,
  normalRange,
  isHigherBetter = true,
  maxValue = 1000
}: StatComparisonProps) => {
  const [animatedBefore, setAnimatedBefore] = useState(0);
  const [animatedAfter, setAnimatedAfter] = useState(0);

  useEffect(() => {
    // Animate numbers on mount
    const duration = 2000;
    const steps = 60;
    const incrementBefore = beforeValue / steps;
    const incrementAfter = afterValue / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedBefore(Math.min(incrementBefore * currentStep, beforeValue));
      setAnimatedAfter(Math.min(incrementAfter * currentStep, afterValue));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [beforeValue, afterValue]);

  const improvement = ((afterValue - beforeValue) / beforeValue) * 100;
  const isImproved = isHigherBetter ? afterValue > beforeValue : afterValue < beforeValue;

  // Calculate percentages for scale visualization
  const beforePercent = (beforeValue / maxValue) * 100;
  const afterPercent = (afterValue / maxValue) * 100;

  return (
    <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-xl border border-primary/20 p-6 hover:border-primary/40 transition-all duration-300 group shadow-lg">
      {/* Label */}
      <h4 className="text-base font-bold text-foreground mb-4">
        {label}
      </h4>

      {/* Compact Before/After Display */}
      <div className="flex items-center justify-between mb-3">
        {/* Before */}
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">Преди</div>
          <div className="text-2xl font-bold text-destructive tabular-nums">{Math.round(animatedBefore)}{unit}</div>
        </div>

        {/* Arrow */}
        <div className="mx-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* After */}
        <div className="flex-1 text-right">
          <div className="text-xs text-muted-foreground mb-1">След</div>
          <div className="text-2xl font-bold text-success tabular-nums">{Math.round(animatedAfter)}{unit}</div>
        </div>
      </div>

      {/* Compact Progress Bar */}
      <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-destructive to-success transition-all duration-2000"
          style={{ width: `${afterPercent}%` }}
        ></div>
      </div>

      {/* Improvement Badge */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isImproved ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}>
          {isImproved ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {isImproved ? '+' : ''}{Math.abs(improvement).toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Норма: {normalRange}
        </p>
      </div>
    </div>
  );
};