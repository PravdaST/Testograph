"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

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
    <div className="bg-green-500 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
          <Badge variant="secondary" className="bg-white text-green-700 font-bold">
            🔥 LIVE
          </Badge>
          <p className="font-semibold animate-fade-in">
            {current.name} от {current.city} купи СТАРТ пакет преди {current.minutes} минути
          </p>
          <span className="hidden md:block">•</span>
          <p className="text-white/90">⭐ 4.8/5 от 487 отзива</p>
        </div>
      </div>
    </div>
  );
}
