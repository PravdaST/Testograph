import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";
import { ScarcityBanner } from "./ScarcityBanner";

interface Step3cEaseProps {
  onProceed: () => void;
  userData?: any;
}

export const Step3cEase = ({ onProceed, userData }: Step3cEaseProps) => {
  // Auto-forward after 15 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onProceed();
    }, 15000);

    return () => clearTimeout(timer);
  }, [onProceed]);

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent uppercase">Лесно е</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Колко труд<br />
            <span className="text-primary">изисква?</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            (По-малко, отколкото мислиш)
          </p>
        </div>

        {/* 3 Simple Steps - Condensed */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              1
            </div>
            <div className="text-2xl">💊</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Вземи добавката <span className="text-muted-foreground font-normal">(30 сек)</span></p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 bg-accent/5 rounded-lg p-3 border border-accent/20">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              2
            </div>
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Следвай плана <span className="text-muted-foreground font-normal">(казваме ти какво)</span></p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 bg-success/5 rounded-lg p-3 border border-success/20">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              3
            </div>
            <div className="text-2xl">💪</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Усети мощта <span className="text-muted-foreground font-normal">(7 дни)</span></p>
            </div>
          </div>
        </div>

        {/* Organization Voice */}
        <p className="text-base font-semibold text-center text-foreground">
          Не се налага да разбираш. НИЕ разбираме и ще ти помогнем с всяка стъпка.
        </p>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onProceed}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90 font-bold shadow-xl"
          >
            Добре. Покажи.
          </Button>

          <AutoAdvanceIndicator totalSeconds={15} />
        </div>
      </div>
    </div>
  );
};
