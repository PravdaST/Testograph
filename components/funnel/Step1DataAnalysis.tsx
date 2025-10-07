import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface Step1DataAnalysisProps {
  userData?: UserData;
  onProceed?: () => void;
}

export const Step1DataAnalysis = ({ userData, onProceed }: Step1DataAnalysisProps) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSteps(1), 1000),
      setTimeout(() => setVisibleSteps(2), 2500),
      setTimeout(() => setVisibleSteps(3), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 12) {
          clearInterval(interval);
          return 12;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Show button after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const steps = [
    "✓ Обработваме данните...",
    "✓ Изчисляваме резултатите...",
    "✓ Подготвяме анализа..."
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative">
          <div className="w-56 h-56 mx-auto rounded-full border-8 border-primary/20 flex items-center justify-center shadow-xl shadow-primary/30">
            <div className="text-6xl font-bold text-primary">
              {percentage}%
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-56 h-56 rounded-full border-8 border-primary border-t-transparent animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          <span className="text-destructive">Тестостеронът ти УМИРА.</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Усещаш ли го? Умората. Празнотата. Загубата на мотивация.
        </p>
        <p className="text-xl font-semibold text-foreground mt-4">
          Знаем какъв е проблемът. Сега ще ти покажем.
        </p>

        <div className="space-y-4 text-left max-w-md mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "text-lg text-muted-foreground transition-all duration-500",
                visibleSteps > index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              {step}
            </div>
          ))}
        </div>

        <p className="pt-4 italic text-sm text-muted-foreground">Подготвяме резултатите...</p>

        {/* Proceed Button - appears after 4s */}
        {showButton && onProceed && (
          <div className={cn(
            "transition-all duration-500",
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Button
              onClick={onProceed}
              size="lg"
              className="w-full max-w-md mx-auto text-lg py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-xl animate-pulse"
            >
              Виж резултата <ChevronRight className="w-5 h-5 ml-2 inline" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
