"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, ChevronUp, Clock, Sparkles } from "lucide-react";
import { useCountdownTimer } from "@/lib/useCountdownTimer";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const timeLeft = useCountdownTimer();

  useEffect(() => {
    // Show after user scrolls past hero (800px)
    const handleScroll = () => {
      const shouldShow = window.scrollY > 800;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const scrollToElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds <= 600; // Last 10 minutes
  const totalDuration = 24 * 3600; // 24 hours in seconds

  return (
    <>
      {/* Mobile: Bottom Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t-2 ${
          isUrgent ? "border-red-500" : "border-border"
        } shadow-2xl transition-all duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-4 space-y-3">
          {/* Timer Bar */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isUrgent ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
              <span className="text-muted-foreground">Оферта изтича:</span>
            </div>
            <span className={`font-mono font-bold tabular-nums ${
              isUrgent ? "text-red-500 text-lg animate-pulse" : "text-foreground"
            }`}>
              {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => scrollToElement("#value-stack")}
            className={`w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
              isUrgent ? "animate-pulse" : ""
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm line-through opacity-70">342 лв</span>
              <span className="text-base font-bold">97 лв</span>
            </div>
            {isUrgent && <Sparkles className="w-4 h-4 animate-spin" />}
          </button>

          {/* Trust Line */}
          <p className="text-xs text-center text-muted-foreground">
            Безплатна доставка • 30-дневна гаранция
          </p>
        </div>

        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              isUrgent ? "from-red-500 to-orange-500" : "from-primary to-accent"
            } transition-all duration-1000`}
            style={{ width: `${((totalDuration - totalSeconds) / totalDuration) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Floating Buttons */}
      <div
        className={`hidden md:flex fixed bottom-8 right-8 z-50 flex-col gap-4 transition-all duration-500 ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"
        }`}
      >
        {/* Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-14 h-14 bg-card/90 backdrop-blur-xl border-2 border-border rounded-full flex items-center justify-center hover:scale-110 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-xl"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Main CTA Button */}
        <div className="relative group">
          {/* Urgent Pulse Ring */}
          {isUrgent && (
            <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-75" />
          )}

          {/* Time Badge */}
          <div
            className={`absolute -top-3 -left-3 ${
              isUrgent ? "bg-red-500 animate-bounce" : "bg-orange-500"
            } text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10`}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="tabular-nums">{formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}</span>
            </div>
          </div>

          {/* Main Button */}
          <button
            onClick={() => scrollToElement("#value-stack")}
            className="relative bg-gradient-to-r from-primary via-accent to-primary text-white font-bold px-8 py-6 rounded-2xl shadow-2xl hover:scale-110 transition-all flex items-center gap-4 group-hover:shadow-primary/50 min-w-[240px]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-xs opacity-70 line-through">342 лв</div>
              <div className="text-2xl font-black flex items-baseline gap-2">
                97 лв
                {isUrgent && <Sparkles className="w-4 h-4 animate-pulse" />}
              </div>
            </div>
          </button>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-xl px-4 py-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
            <p className="text-sm font-semibold">Спести 245 лв днес!</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
