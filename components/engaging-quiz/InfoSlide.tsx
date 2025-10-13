import { Button } from "@/components/ui/button";
import { InfoSlide as InfoSlideType } from "./types";

interface InfoSlideProps {
  slide: InfoSlideType;
  onContinue: () => void;
}

export const InfoSlide = ({ slide, onContinue }: InfoSlideProps) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl md:rounded-2xl p-6 md:p-10 border-2 border-primary/30 backdrop-blur-sm shadow-2xl">
          {/* Icon */}
          <div className="text-center mb-4 md:mb-6">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">{slide.icon}</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
              {slide.title}
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-2 md:space-y-3 text-center mb-6 md:mb-8">
            {slide.content.map((line, index) => (
              <p
                key={index}
                className={`text-sm md:text-base lg:text-lg ${
                  line.startsWith('•') || line.startsWith('✓')
                    ? 'text-foreground font-medium'
                    : line === ''
                    ? 'h-1 md:h-2'
                    : 'text-muted-foreground'
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full text-base md:text-lg lg:text-xl py-5 md:py-6 lg:py-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-lg transition-all hover:scale-105"
          >
            {slide.cta || 'Продължи →'}
          </Button>
        </div>
      </div>
    </div>
  );
};
