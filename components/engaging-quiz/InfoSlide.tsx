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
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 border-2 border-primary/30 backdrop-blur-sm shadow-2xl">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl md:text-7xl mb-4 animate-bounce">{slide.icon}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {slide.title}
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-3 text-center mb-8">
            {slide.content.map((line, index) => (
              <p
                key={index}
                className={`text-base md:text-lg ${
                  line.startsWith('•') || line.startsWith('✓')
                    ? 'text-foreground font-medium'
                    : line === ''
                    ? 'h-2'
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
            className="w-full text-lg md:text-xl py-6 md:py-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold shadow-lg transition-all hover:scale-105"
          >
            {slide.cta || 'Продължи →'}
          </Button>
        </div>
      </div>
    </div>
  );
};
