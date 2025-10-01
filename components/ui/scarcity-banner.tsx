import { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

export const ScarcityBanner = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [spotsLeft] = useState(47);
  const totalSpots = 200;
  const percentage = ((totalSpots - spotsLeft) / totalSpots) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-orange-600/95 via-red-600/95 to-orange-600/95 backdrop-blur-xl border-t border-orange-500/50 shadow-lg shadow-orange-500/20 px-3 py-2">
        <div className="container mx-auto max-w-[1200px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left: Scarcity Message */}
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-white animate-pulse" />
              <div>
                <p className="text-white font-bold text-xs md:text-sm">
                  Остават само <span className="text-lg font-black">{spotsLeft}</span> безплатни анализа
                </p>
                <p className="text-orange-100 text-[10px]">
                  След това цената става 47 лв
                </p>
              </div>
            </div>

            {/* Center: Progress Bar - Compact */}
            <div className="flex-1 max-w-xs w-full">
              <div className="bg-orange-900/50 rounded-full h-4 overflow-hidden border border-orange-400/30">
                <div
                  className="h-full bg-gradient-to-r from-white via-orange-200 to-white flex items-center justify-center text-[10px] font-bold text-orange-900 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                >
                  {Math.round(percentage)}%
                </div>
              </div>
            </div>

            {/* Right: Countdown Timer - Compact */}
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-orange-400/30">
              <Clock className="w-4 h-4 text-orange-200" />
              <div className="text-center">
                <p className="text-[9px] text-orange-200">Изтича:</p>
                <p className="text-base font-mono font-bold text-white tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};