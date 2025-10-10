import { useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Mail, CheckCircle } from "lucide-react";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface FinalThankYouProps {
  userData?: UserData;
}

export const FinalThankYou = ({ userData }: FinalThankYouProps) => {
  useEffect(() => {
    // Auto-redirect to homepage after 10 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = "/";
    }, 10000);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-primary/5 overflow-x-hidden">
      <div className="max-w-2xl w-full mx-auto space-y-8 animate-scale-in">
        {/* Main Message Card */}
        <GlassCard variant="elevated" className="p-4 md:p-8 lg:p-12 text-center space-y-6 border-2 border-primary/30 w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground break-words">
              Тест, {userData?.firstName && `${userData.firstName}, `}разбрахме!
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-primary">
              Проверете имейла си
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 md:p-6 space-y-4 border-2 border-primary/20">
            <p className="text-sm md:text-lg text-foreground leading-relaxed break-words">
              Изпратих ти <strong className="text-primary">Безплатния 7-дневен Стартов План + Дневник</strong> на имейла който предостави.
            </p>
            <p className="text-xs md:text-base text-muted-foreground break-words">
              Това е добро начало - ще усетиш първата разлика. Но ако искаш ИСТИНСКИ резултати като тези които видя, трябва ти пълният план.
            </p>
            <div className="space-y-2 text-xs md:text-base text-muted-foreground">
              <div className="flex items-start gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="break-words text-left">Може да отнеме 1-2 минути да пристигне</span>
              </div>
              <div className="flex items-start gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="break-words text-left">Не го виждаш? Провери папка Промоции или Спам</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Ще бъдеш пренасочен към началната страница след 10 секунди...
            </p>
            <a
              href="/"
              className="inline-block mt-3 text-primary hover:text-primary/80 font-semibold underline"
            >
              Или кликни тук за да се върнеш сега
            </a>
          </div>
        </GlassCard>

        {/* Success Stories Carousel */}
        <div className="space-y-4 w-full">
          <h2 className="text-xl md:text-3xl font-bold text-center text-foreground px-2">
            Виж Какво Постигат Другите
          </h2>
          <p className="text-sm md:text-base text-center text-muted-foreground px-2">
            Може би си готов за повече от безплатния план?
          </p>
          <SuccessStoriesWall />
        </div>

        {/* Optional: Still interested card */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 md:p-6 text-center border border-border w-full">
          <p className="text-xs md:text-base text-muted-foreground break-words">
            Промени ли си мнението? Офертата все още е налична за ограничено време.
          </p>
          <a
            href="https://www.shop.testograph.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-primary hover:text-primary/80 font-semibold text-sm md:text-base"
          >
            Виж офертите →
          </a>
        </div>
      </div>
    </div>
  );
};
