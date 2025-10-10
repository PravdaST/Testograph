'use client'

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ActivityMessage {
  name: string;
  age: number;
  city: string;
  action: string;
  timeAgo: string;
}

const activities: ActivityMessage[] = [
  {
    name: "Мартин",
    age: 34,
    city: "София",
    action: "взе доклада си",
    timeAgo: "преди 2 минути"
  },
  {
    name: "Георги",
    age: 41,
    city: "Пловдив",
    action: "завърши анализа",
    timeAgo: "преди 34 секунди"
  },
  {
    name: "Стоян",
    age: 29,
    city: "Варна",
    action: "започна формата",
    timeAgo: "преди минута"
  },
  {
    name: "Димитър",
    age: 37,
    city: "Бургас",
    action: "получи PDF-а",
    timeAgo: "преди 3 минути"
  },
  {
    name: "Петър",
    age: 52,
    city: "София",
    action: "завърши анализа",
    timeAgo: "преди 47 секунди"
  },
  {
    name: "Емил",
    age: 48,
    city: "Пловдив",
    action: "взе доклада си",
    timeAgo: "преди 5 минути"
  },
  {
    name: "Иван",
    age: 31,
    city: "Варна",
    action: "започна формата",
    timeAgo: "преди минута"
  },
  {
    name: "Христо",
    age: 44,
    city: "София",
    action: "получи PDF-а",
    timeAgo: "преди 2 минути"
  },
  {
    name: "Николай",
    age: 39,
    city: "Бургас",
    action: "завърши анализа",
    timeAgo: "преди 4 минути"
  },
  {
    name: "Васил",
    age: 35,
    city: "Пловдив",
    action: "взе доклада си",
    timeAgo: "преди минута"
  }
];

export const LiveActivityNotifications = () => {
  const [currentActivity, setCurrentActivity] = useState<ActivityMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      // Pick random activity
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];

      setCurrentActivity(randomActivity);
      setIsVisible(true);

      // Hide after 8 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // Initial delay
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 5000);

    // Repeat every 20-30 seconds
    const interval = setInterval(() => {
      const randomDelay = 20000 + Math.random() * 10000; // 20-30s
      setTimeout(() => {
        showNotification();
      }, randomDelay);
    }, 30000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  if (!currentActivity || !isVisible) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 z-30 transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg shadow-xl p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {currentActivity.name}, {currentActivity.age}г., {currentActivity.city}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentActivity.action} {currentActivity.timeAgo}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
