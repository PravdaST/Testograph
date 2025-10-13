import { Button } from "@/components/ui/button";
import { InfoSlide as InfoSlideType } from "./types";

interface InfoSlideProps {
  slide: InfoSlideType;
  onContinue: () => void;
}

export const InfoSlide = ({ slide, onContinue }: InfoSlideProps) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-violet-500/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-violet-500/10 rounded-xl md:rounded-2xl p-6 md:p-10 border-2 border-primary/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/20 to-transparent rounded-tr-full"></div>

          {/* Icon with enhanced animation */}
          <div className="text-center mb-4 md:mb-6 relative">
            {/* Glow effect behind icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            </div>

            <div className="relative text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce inline-block">
              {slide.icon}
              {/* Add sparkle effect */}
              <span className="absolute -top-1 -right-1 text-2xl animate-pulse">✨</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4 relative">
              {slide.title}
              {/* Underline decoration */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
            </h2>
          </div>

          {/* Content with enhanced styling */}
          <div className="space-y-2 md:space-y-3 text-center mb-6 md:mb-8">
            {slide.content.map((line, index) => (
              <p
                key={index}
                className={`text-sm md:text-base lg:text-lg transition-all hover:scale-105 ${
                  line.startsWith('•') || line.startsWith('✓')
                    ? 'text-foreground font-medium bg-primary/5 py-2 rounded-lg px-4 inline-block'
                    : line === ''
                    ? 'h-1 md:h-2'
                    : 'text-muted-foreground'
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Enhanced CTA Button */}
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full text-base md:text-lg lg:text-xl py-5 md:py-6 lg:py-8 bg-gradient-to-r from-primary via-violet-600 to-accent hover:from-primary/90 hover:via-violet-600/90 hover:to-accent/90 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">{slide.cta || 'Продължи →'}</span>
          </Button>
        </div>
      </div>

      {/* Custom animations styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
