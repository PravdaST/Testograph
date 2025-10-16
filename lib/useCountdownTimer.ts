"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const STORAGE_KEY = "testograph_offer_end_time";

// Shared function to get/set target time - ensures all timers use same end time
function getTargetTime(): number {
  if (typeof window === "undefined") return Date.now() + 24 * 60 * 60 * 1000;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const targetTime = parseInt(stored, 10);
    // If stored time is in the past, reset to 24 hours from now
    if (targetTime < Date.now()) {
      const newTarget = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, newTarget.toString());
      return newTarget;
    }
    return targetTime;
  }

  // Set 24 hours from now
  const target = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, target.toString());
  return target;
}

export function useCountdownTimer(): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetTime = getTargetTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}
