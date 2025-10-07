import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";

interface Step2cChoiceProps {
  onProceed: (choice: number) => void;
  userData?: any;
}

export const Step2cChoice = ({ onProceed, userData }: Step2cChoiceProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  // Auto-forward after 15 seconds if user doesn't select (longer for interactive step)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selected === null) {
        // Default to first choice if no selection made
        onProceed(0);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [selected, onProceed]);

  const choices = [
    {
      id: 0,
      emoji: "😴",
      label: "Умора & Стрес",
      description: "Изтощен след обяд. Нулева енергия."
    },
    {
      id: 1,
      emoji: "🍔",
      label: "Корем & Тегло",
      description: "Корем който не се маха. Загуба на мускули."
    },
    {
      id: 2,
      emoji: "💜",
      label: "Либидо Проблеми",
      description: "Загуба на либидо. Неудобни моменти."
    }
  ];

  const handleSelect = (id: number) => {
    setSelected(id);
    // Auto-proceed after selection with slight delay for feedback
    setTimeout(() => {
      onProceed(id);
    }, 1500);
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Headline */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Кое от тези 3<br />
            <span className="text-primary">те убива най-много?</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            (Избери 1. Ще персонализирам плана специално за теб)
          </p>
        </div>

        {/* 3 HUGE Choice Buttons - Thumb-friendly */}
        <div className="space-y-4">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              className={cn(
                "w-full p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 active:scale-95 min-h-[80px]",
                selected === choice.id
                  ? "bg-primary/20 border-primary shadow-xl shadow-primary/30 scale-105"
                  : "bg-card/60 border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{choice.emoji}</div>
                <div className="text-left flex-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {choice.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {choice.description}
                  </p>
                </div>
                {selected === choice.id && (
                  <div className="text-primary text-2xl animate-in fade-in zoom-in">
                    ✓
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {selected !== null ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-success/10 border border-success/30 rounded-xl p-4">
              <p className="text-sm text-success font-semibold">
                ✓ Добре. Ще атакуваме първо ТАМ.
              </p>
            </div>
          </div>
        ) : (
          <AutoAdvanceIndicator totalSeconds={15} className="pt-4" />
        )}
      </div>
    </div>
  );
};
