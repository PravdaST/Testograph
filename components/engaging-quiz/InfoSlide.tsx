import { Button } from "@/components/ui/button";
import { InfoSlide as InfoSlideType } from "./types";

interface InfoSlideProps {
  slide: InfoSlideType;
  onContinue: () => void;
}

export const InfoSlide = ({ slide, onContinue }: InfoSlideProps) => {
  return (
    <div className="text-center">
      {slide.icon && (
        <div className="text-5xl mb-6 animate-bounce">{slide.icon}</div>
      )}
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
        {slide.title}
      </h2>
      <div className="space-y-3 text-gray-600 mb-8 leading-relaxed">
        {slide.content.map((line, index) => (
          <p key={index} className="text-base">
            {line}
          </p>
        ))}
      </div>
      <Button
        onClick={onContinue}
        size="lg"
        className="w-full sm:w-auto px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all"
      >
        {slide.cta || 'Продължи'}
      </Button>
    </div>
  );
};
