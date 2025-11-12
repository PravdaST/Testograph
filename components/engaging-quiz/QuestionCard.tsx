import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question } from "./types";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface QuestionCardProps {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
}

export const QuestionCard = ({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
}: QuestionCardProps) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [question, value]);

  const handleButtonClick = (optionValue: string) => {
    onChange(optionValue);
    setTimeout(onNext, 250); // Auto-advance with a slight delay
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (value as string)?.trim()) {
      onNext();
    }
  };

  const canProceed = value !== undefined && value !== null && String(value).trim() !== '';

  // Check if this question has age group avatars
  const hasAvatars = question.visualComponent === 'AgeGroupIcons';

  // Map for age group avatar images
  const ageGroupImages: Record<string, string> = {
    '25-35': '/quiz-visuals/age-25-35.png',
    '36-45': '/quiz-visuals/age-36-45.png',
    '46-55': '/quiz-visuals/age-46-55.png',
    '56+': '/quiz-visuals/age-56-plus.png',
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-base text-gray-600 mt-2">
            {question.subtitle}
          </p>
        )}
      </div>

      <div className="mb-8">
        {question.type === 'buttons' && (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map((option) => {
              const isSelected = value === option.value;
              const avatarSrc = hasAvatars ? ageGroupImages[option.value] : null;

              return (
                <button
                  key={option.value}
                  onClick={() => handleButtonClick(option.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  {/* Checkbox Circle (kegel-plan style) */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-white' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-4 h-4 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Text */}
                  <span className={`flex-1 text-base font-medium ${
                    isSelected ? 'text-white' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </span>

                  {/* Avatar (if applicable) */}
                  {avatarSrc && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={avatarSrc}
                        alt={`Age ${option.value}`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {(question.type === 'text' || question.type === 'email') && (
          <Input
            type={question.type === 'email' ? 'email' : 'text'}
            value={inputValue as string}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={question.placeholder}
            className="h-14 text-lg text-center bg-white border-2 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            autoFocus
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-8">
        {!isFirst && (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="bg-white border-2 border-gray-300 hover:bg-[#e6e6e6] text-gray-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        )}
        {(question.type === 'text' || question.type === 'email') && (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            Напред <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
