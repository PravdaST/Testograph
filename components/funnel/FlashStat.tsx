import { cn } from "@/lib/utils";

interface FlashStatProps {
  text: string;
  className?: string;
}

export const FlashStat = ({ text, className }: FlashStatProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 shadow-lg animate-pulse",
      className
    )}>
      {/* Breaking news style */}
      <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase">
        ⚡ Статистика
      </div>

      <p className="text-base md:text-lg font-bold text-foreground mt-4 text-center">
        {text}
      </p>

      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 animate-pulse pointer-events-none" />
    </div>
  );
};
