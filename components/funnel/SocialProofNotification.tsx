import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const names = [
  "Георги от София",
  "Мартин от Пловдив",
  "Иван от Варна",
  "Стефан от Бургас",
  "Димитър от Стара Загора",
  "Николай от Русе",
  "Петър от Плевен",
  "Христо от Велико Търново"
];

const actions = [
  "започна плана",
  "закупи премиум пакета",
  "се присъедини към програмата",
  "взе TESTO UP",
  "потвърди поръчката си"
];

export const SocialProofNotification = () => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ name: "", action: "" });

  useEffect(() => {
    const showNotification = () => {
      // Random notification
      const name = names[Math.floor(Math.random() * names.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];

      setNotification({ name, action });
      setShow(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShow(false);
      }, 5000);
    };

    // Show first notification after 8-15 seconds
    const firstDelay = (Math.random() * 7000) + 8000;
    const firstTimer = setTimeout(showNotification, firstDelay);

    // Then show every 20-40 seconds
    const interval = setInterval(() => {
      if (!show) {
        showNotification();
      }
    }, (Math.random() * 20000) + 20000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [show]);

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 max-w-xs transition-all duration-500 ease-in-out",
        show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-card border-2 border-primary/50 rounded-lg shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
          ✓
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{notification.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{notification.action}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Преди 2 минути</p>
        </div>
      </div>
    </div>
  );
};
