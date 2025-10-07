import { cn } from "@/lib/utils";

interface LoadingHeaderProps {
  progress: number;
  flicker?: boolean;
  userName?: string;
}

export const LoadingHeader = ({ progress, flicker, userName }: LoadingHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-7 bg-background border-b border-border shadow-md overflow-hidden">
      {/* Progress bar background */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-violet-600 transition-all duration-300",
          flicker && "animate-pulse"
        )}
        style={{ width: `${progress}%` }}
      />

      {/* Text and percentage on top */}
      <div className="relative z-10 px-4 h-full flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          {userName ? `${userName}, подготвяме твоя доклад...` : "Подготвяме твоя доклад..."}
        </span>
        <span className="text-xs font-bold text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};