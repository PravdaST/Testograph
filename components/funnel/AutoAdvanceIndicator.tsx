import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AutoAdvanceIndicatorProps {
  totalSeconds: number;
  className?: string;
  onComplete?: () => void;
}

export const AutoAdvanceIndicator = ({ totalSeconds, className, onComplete }: AutoAdvanceIndicatorProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const onCompleteRef = useRef(onComplete);

  // Keep ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Call onComplete callback when countdown finishes
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className={cn("text-center text-xs text-muted-foreground/60 space-y-2", className)}>
      <p className="font-medium">
        Автоматично напред след {secondsLeft}s
      </p>
      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/40 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
