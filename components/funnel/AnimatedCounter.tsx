import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

export const AnimatedCounter = ({ from, to, duration = 1500, className, decimals = 0 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const startTime = Date.now();
    const difference = to - from;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuad = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const currentCount = decimals > 0
        ? from + difference * easeOutQuad
        : Math.floor(from + difference * easeOutQuad);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animate();
  }, [from, to, duration, decimals]);

  return <span className={className}>{decimals > 0 ? count.toFixed(decimals) : count}</span>;
};
