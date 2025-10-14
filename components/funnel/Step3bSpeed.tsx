import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";
import { ScarcityBanner } from "./ScarcityBanner";

interface Step3bSpeedProps {
  onProceed: () => void;
  userData?: any;
}

export const Step3bSpeed = ({ onProceed, userData }: Step3bSpeedProps) => {

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase">Времева линия</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Колко бързо<br />
            <span className="text-primary">ще усетиш промяната?</span>
          </h1>
        </div>

        {/* Timeline - Horizontal 3 Boxes */}
        <div className="grid grid-cols-3 gap-3">
          {/* Day 7 */}
          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <p className="text-white text-lg font-bold">7</p>
            </div>
            <p className="text-xs uppercase font-bold text-orange-600 mb-1">ДНИ</p>
            <p className="text-sm font-bold text-foreground">Енергия</p>
            <p className="text-xs text-muted-foreground mt-1">Връща се</p>
          </div>

          {/* Day 14 */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg">
              <p className="text-white text-lg font-bold">14</p>
            </div>
            <p className="text-xs uppercase font-bold text-primary mb-1">ДНИ</p>
            <p className="text-sm font-bold text-foreground">Либидо максимум</p>
            <p className="text-xs text-muted-foreground mt-1">Жив отново</p>
          </div>

          {/* Day 30 */}
          <div className="bg-success/10 border-2 border-success/30 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
              <p className="text-white text-lg font-bold">30</p>
            </div>
            <p className="text-xs uppercase font-bold text-success mb-1">ДНИ</p>
            <p className="text-sm font-bold text-foreground">Пълна мощ</p>
            <p className="text-xs text-muted-foreground mt-1">Необратима промяна</p>
          </div>
        </div>

        {/* Direct Statement */}
        <p className="text-xl font-bold text-center text-primary">
          14 дни до ПЪРВАТА истинска промяна.
        </p>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onProceed}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-xl"
          >
            Искам същото
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            (Започни още утре сутрин)
          </p>

          <AutoAdvanceIndicator totalSeconds={12} onComplete={onProceed} />
        </div>
      </div>
    </div>
  );
};
