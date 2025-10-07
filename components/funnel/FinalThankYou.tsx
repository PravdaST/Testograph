import { useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Mail, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-2xl mx-auto space-y-8 animate-scale-in">
        {/* Main Message Card */}
        <GlassCard variant="elevated" className="p-8 md:p-12 text-center space-y-6 border-2 border-primary/30">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {userData?.firstName ? `${userData.firstName}, р` : "Р"}азбрахме!
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-primary">
              Проверете имейла си
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 space-y-4 border-2 border-primary/20">
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              Изпратих ти <strong className="text-primary">Безплатния 7-дневен Стартов План + Дневник</strong> на имейла който предостави.
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              Това е добро начало - ще усетиш първата разлика. Но ако искаш ИСТИНСКИ резултати като тези които видя, трябва ти пълният план.
            </p>
            <div className="space-y-2 text-sm md:text-base text-muted-foreground">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Може да отнеме 1-2 минути да пристигне</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Не го виждаш? Провери папка Промоции или Спам</span>
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

        {/* Optional: Still interested card */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 text-center border border-border">
          <p className="text-sm md:text-base text-muted-foreground">
            Промени ли си мнението? Офертата все още е налична за ограничено време.
          </p>
          <a
            href="https://www.shop.testograph.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-primary hover:text-primary/80 font-semibold"
          >
            Виж офертите →
          </a>
        </div>
      </div>
    </div>
  );
};
