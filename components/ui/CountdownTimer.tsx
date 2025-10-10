'use client'

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  size?: 'small' | 'large';
  variant?: 'inline' | 'standalone';
}

export const CountdownTimer = ({ size = 'large', variant = 'inline' }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format as HH:MM:SS
      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeRemaining(formatted);

      // Mark as urgent if less than 1 hour
      setIsUrgent(hours < 1);
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const textSizeClass = size === 'large' ? 'text-2xl md:text-3xl' : 'text-base md:text-lg';
  const fontWeightClass = size === 'large' ? 'font-bold' : 'font-semibold';
  const colorClass = isUrgent ? 'text-destructive' : 'text-primary';

  if (variant === 'standalone') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className={`${textSizeClass} ${fontWeightClass} ${colorClass} tabular-nums`}>
          {timeRemaining}
        </span>
      </div>
    );
  }

  return (
    <span className={`${textSizeClass} ${fontWeightClass} ${colorClass} tabular-nums`}>
      {timeRemaining}
    </span>
  );
};
