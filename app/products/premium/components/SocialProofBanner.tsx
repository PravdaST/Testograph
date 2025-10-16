"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function SocialProofBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const notifications = [
    { name: "Атанас", city: "София", minutes: 6 },
    { name: "Борис", city: "Пловдив", minutes: 11 },
    { name: "Валентин", city: "Варна", minutes: 19 },
    { name: "Даниел", city: "Бургас", minutes: 28 },
    { name: "Емил", city: "Русе", minutes: 35 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = notifications[currentIndex];

  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
          <Badge variant="secondary" className="bg-white text-violet-700 font-bold">
            🔥 LIVE
          </Badge>
          <p className="font-semibold animate-fade-in">
            {current.name} от {current.city} купи ПРЕМИУМ пакет преди {current.minutes} минути
          </p>
          <span className="hidden md:block">•</span>
          <p className="text-white/90">⭐ 4.8/5 от 487 отзива • 67% избират този пакет</p>
        </div>
      </div>
    </div>
  );
}
