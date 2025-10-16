"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function SocialProofBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const notifications = [
    { name: "Николай", city: "София", minutes: 12 },
    { name: "Петър", city: "Пловдив", minutes: 18 },
    { name: "Владимир", city: "Варна", minutes: 27 },
    { name: "Александър", city: "Бургас", minutes: 34 },
    { name: "Христо", city: "Стара Загора", minutes: 41 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = notifications[currentIndex];

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
          <Badge variant="secondary" className="bg-white text-orange-700 font-bold">
            🔥 LIVE
          </Badge>
          <p className="font-semibold animate-fade-in">
            {current.name} от {current.city} купи МАКС пакет преди {current.minutes} минути
          </p>
          <span className="hidden md:block">•</span>
          <p className="text-white/90">⭐ 4.8/5 от 487 отзива</p>
        </div>
      </div>
    </div>
  );
}
