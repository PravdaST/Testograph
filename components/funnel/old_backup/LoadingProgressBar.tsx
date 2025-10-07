import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface LoadingProgressBarProps {
  progress: number;
  frozen?: boolean;
  showPercentage?: boolean;
  hideBar?: boolean;
  enableScrollBehavior?: boolean;
}

export const LoadingProgressBar = ({ progress, frozen, showPercentage, hideBar, enableScrollBehavior }: LoadingProgressBarProps) => {
  const { scrollDirection, isAtTop } = useScrollDirection();
  
  if (hideBar) {
    return null;
  }

  const shouldHide = enableScrollBehavior && scrollDirection === 'down' && !isAtTop;

  return (
    <>
      {showPercentage && (
        <div 
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-in-out",
            shouldHide && "-translate-y-20"
          )}
        >
          <div className="bg-card border-2 border-primary rounded-full px-6 py-2 shadow-lg">
            <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
      {!showPercentage && (
        <div 
          className={cn(
            "fixed top-0 left-0 right-0 z-50 h-2 bg-secondary/20 transition-transform duration-300 ease-in-out",
            shouldHide && "-translate-y-full"
          )}
        >
          <div
            className={cn(
              "h-full bg-gradient-to-r from-primary to-violet-600 transition-all duration-1000",
              frozen && "animate-pulse"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </>
  );
};
