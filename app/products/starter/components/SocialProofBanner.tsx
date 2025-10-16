"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function SocialProofBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const notifications = [
    { name: "Мартин", city: "София", minutes: 8 },
    { name: "Георги", city: "Пловдив", minutes: 14 },
    { name: "Иван", city: "Варна", minutes: 23 },
    { name: "Димитър", city: "Бургас", minutes: 31 },
    { name: "Стефан", city: "Русе", minutes: 47 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = notifications[currentIndex];

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Live Badge + Message */}
          <div className="flex items-center gap-2.5 flex-1 justify-center sm:justify-start">
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold px-2.5 py-0.5 text-xs">
              LIVE
            </Badge>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-foreground font-medium text-sm">
                {current.name} от {current.city} купи СТАРТ преди {current.minutes}м
              </p>
            </div>
          </div>

          {/* Rating - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500"
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.8</span>
            <span className="text-xs text-muted-foreground">(487 отзива)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
