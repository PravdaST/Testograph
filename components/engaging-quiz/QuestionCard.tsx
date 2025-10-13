import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question } from "./types";

interface QuestionCardProps {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext: () => void;
  canProceed: boolean;
}

export const QuestionCard = ({
  question,
  value,
  onChange,
  onNext,
  canProceed
}: QuestionCardProps) => {
  const [sliderValue, setSliderValue] = useState<number>(
    typeof value === 'number' ? value : question.min || 0
  );

  // Sync slider value when question changes (fixes value carry-over bug)
  useEffect(() => {
    if (question.type === 'slider') {
      const initialValue = typeof value === 'number' ? value : question.min || 0;
      setSliderValue(initialValue);
    }
  }, [question.id, value, question.min, question.type]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  const handleButtonClick = (optionValue: string) => {
    onChange(optionValue);
    // Auto-advance after selection for buttons (no canProceed check - button click satisfies requirement)
    setTimeout(onNext, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) {
      onNext();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-3xl w-full">
        {/* Question Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="text-base md:text-lg text-muted-foreground">
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Input based on type */}
        <div className="mb-8">
          {question.type === 'slider' && (
            <div className="space-y-6">
              {/* Slider Value Display */}
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-black text-primary tabular-nums">
                  {sliderValue}
                  {question.unit && (
                    <span className="text-4xl md:text-5xl text-muted-foreground ml-2">
                      {question.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Slider */}
              <div className="px-4">
                <input
                  type="range"
                  min={question.min}
                  max={question.max}
                  step={question.step || 1}
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary slider-thumb"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{question.min}{question.unit}</span>
                  <span>{question.max}{question.unit}</span>
                </div>
              </div>
            </div>
          )}

          {question.type === 'buttons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleButtonClick(option.value)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    value === option.value
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {option.icon && (
                      <span className="text-4xl flex-shrink-0">{option.icon}</span>
                    )}
                    <span className="text-lg md:text-xl font-semibold text-foreground">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {(question.type === 'text' || question.type === 'email') && (
            <div className="max-w-xl mx-auto">
              <Input
                type={question.type === 'email' ? 'email' : 'text'}
                value={value as string || ''}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={question.placeholder}
                className="h-16 text-xl text-center"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Next Button (for slider and text inputs) */}
        {(question.type === 'slider' || question.type === 'text' || question.type === 'email') && (
          <div className="flex justify-center">
            <Button
              onClick={onNext}
              disabled={!canProceed}
              size="lg"
              className="text-lg md:text-xl px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Напред →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
