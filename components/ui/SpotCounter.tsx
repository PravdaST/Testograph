'use client'

import { useState, useEffect } from "react";

interface SpotCounterProps {
  totalSpots?: number;
  showProgress?: boolean;
}

export const SpotCounter = ({ totalSpots = 50, showProgress = false }: SpotCounterProps) => {
  const [spotsRemaining, setSpotsRemaining] = useState<number>(0);

  useEffect(() => {
    const STORAGE_KEY = 'testograph_spots_remaining';
    const STORAGE_DATE_KEY = 'testograph_spots_date';

    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(STORAGE_DATE_KEY);

    // Check if we need to reset (new day)
    if (storedDate !== today) {
      // Generate random starting number (18-27 spots remaining)
      const randomSpots = Math.floor(Math.random() * 10) + 18;
      localStorage.setItem(STORAGE_KEY, randomSpots.toString());
      localStorage.setItem(STORAGE_DATE_KEY, today);
      setSpotsRemaining(randomSpots);
    } else {
      // Use stored value
      const stored = localStorage.getItem(STORAGE_KEY);
      setSpotsRemaining(stored ? parseInt(stored) : 23);
    }

    // Simulate slow decrease every 3-5 minutes
    const decreaseInterval = setInterval(() => {
      setSpotsRemaining((prev) => {
        if (prev > 10) {
          const newValue = prev - 1;
          localStorage.setItem(STORAGE_KEY, newValue.toString());
          return newValue;
        }
        return prev;
      });
    }, (3 + Math.random() * 2) * 60 * 1000); // 3-5 minutes

    return () => clearInterval(decreaseInterval);
  }, []);

  const percentage = (spotsRemaining / totalSpots) * 100;
  const isLow = spotsRemaining < 15;

  if (showProgress) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Места днес</span>
          <span className={`text-sm font-bold ${isLow ? 'text-destructive' : 'text-primary'}`}>
            {spotsRemaining}/{totalSpots}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isLow ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-primary'}`}>
        {spotsRemaining}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">места днес</p>
    </div>
  );
};
