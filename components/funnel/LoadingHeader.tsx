import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface LoadingHeaderProps {
  progress: number;
  flicker?: boolean;
}

export const LoadingHeader = ({ progress, flicker }: LoadingHeaderProps) => {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const shouldHide = scrollDirection === 'down' && !isAtTop;

  return (
    <div 
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-in-out",
        shouldHide && "-translate-y-20"
      )}
    >
      <div className={cn(
        "relative rounded-full px-8 py-3 bg-background",
        "border-2 border-transparent bg-clip-padding",
        "before:absolute before:inset-0 before:rounded-full before:p-[2px]",
        "before:bg-gradient-to-r before:from-primary before:to-violet-600",
        "before:-z-10 before:content-['']",
        flicker ? "animate-[flicker_1.5s_ease-in-out_infinite]" : "animate-pulse"
      )}>
        <span className="text-2xl font-bold text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};