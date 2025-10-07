import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";
import { FlashStat } from "./FlashStat";

interface Step2aDreamProps {
  onProceed: () => void;
  userData?: any;
}

export const Step2aDream = ({ onProceed, userData }: Step2aDreamProps) => {
  // Auto-forward after 15 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onProceed();
    }, 15000);

    return () => clearTimeout(timer);
  }, [onProceed]);

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {userData?.firstName ? `${userData.firstName}, ` : ""}преди 5 години<br />
          <span className="text-primary">ти беше ДРУГ мъж</span>
        </h1>

        <p className="text-base text-muted-foreground -mt-4">
          Спомняш ли си?
        </p>

        {/* Before/After Split Visual */}
        <div className="bg-gradient-to-r from-primary/10 to-destructive/10 border-2 border-border rounded-2xl p-4 md:p-8">
          <div className="grid grid-cols-2 gap-3 md:gap-6 text-center divide-x-2 divide-border">
            <div className="pr-2 md:pr-4">
              <p className="text-xs md:text-sm uppercase font-black text-primary mb-3 md:mb-4">ПРЕДИ 5 ГОДИНИ</p>
              <div className="space-y-2 md:space-y-3 text-left">
                <p className="text-xl md:text-3xl font-black text-primary leading-tight">СИЛЕН.<br/>УСТРЕМЕН.</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-4">Взимаш каквото искаш.</p>
              </div>
            </div>
            <div className="pl-2 md:pl-4">
              <p className="text-xs md:text-sm uppercase font-black text-destructive mb-3 md:mb-4">СЕГА</p>
              <div className="space-y-2 md:space-y-3 text-left">
                <p className="text-xl md:text-3xl font-black text-destructive leading-tight">УМОРЕН.<br/>СЛАБ.</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-4">Чакаш. Нямаш сили.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Interrupt - Flash Stat */}
        <FlashStat text="Повечето мъже имат този проблем - но малцина правят нещо по въпроса" />

        {/* CTA Button */}
        <div className="space-y-3">
          <p className="text-xl font-bold text-foreground">
            Искаш ли СИЛАТА обратно?
          </p>
          <Button
            onClick={onProceed}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-xl"
          >
            ДА. ИСКАМ.
          </Button>

          <AutoAdvanceIndicator totalSeconds={15} className="pt-2" />
        </div>
      </div>
    </div>
  );
};
