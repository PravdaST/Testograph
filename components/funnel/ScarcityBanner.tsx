import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScarcityBannerProps {
  type: "activity" | "limited-spots" | "price-increase";
  className?: string;
}

export const ScarcityBanner = ({ type, className }: ScarcityBannerProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Random starting count
    setCount(Math.floor(Math.random() * 15) + 35); // 35-50

    // Randomly increment every 10-30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setCount(prev => prev + 1);
      }
    }, (Math.random() * 20000) + 10000);

    return () => clearInterval(interval);
  }, []);

  const banners = {
    activity: {
      bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50",
      icon: "🔴",
      text: `${count} мъже започнаха плана днес`
    },
    "limited-spots": {
      bg: "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50",
      icon: "⚠️",
      text: `Само ${Math.max(12 - Math.floor(count / 5), 3)} места останали тази седмица`
    },
    "price-increase": {
      bg: "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/50",
      icon: "📈",
      text: "Цената се увеличава утре в 23:59"
    }
  };

  const banner = banners[type];

  return (
    <div className={cn(
      "rounded-lg p-3 border-2 text-center",
      banner.bg,
      className
    )}>
      <p className="text-sm font-semibold text-foreground">
        {banner.icon} {banner.text}
      </p>
    </div>
  );
};
