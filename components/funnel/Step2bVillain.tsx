import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AutoAdvanceIndicator } from "./AutoAdvanceIndicator";

interface Step2bVillainProps {
  onProceed: () => void;
  userData?: any;
}

export const Step2bVillain = ({ onProceed, userData }: Step2bVillainProps) => {
  // Auto-forward after 10 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onProceed();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onProceed]);
  // Determine the #1 villain based on user data
  const getVillain = () => {
    if (userData?.libido === "low") {
      return {
        emoji: "🧪",
        title: "ЕСТРОГЕНЪТ",
        subtitle: "(блокира тестостерона)",
        description: "Естрогенът те прави СЛАБ като жена. Пластмаса, соя, пестициди - пълни с естроген. Блокират тестостерона. Нулево либидо. Слаба ерекция. Загуба на мускули.",
        stat: "71% от мъжете над 35 - АТАКУВАНИ от естроген",
        color: "from-purple-500/20 to-violet-500/20 border-purple-500/40"
      };
    }
    if (userData?.morningEnergy === "low") {
      return {
        emoji: "😰",
        title: "КОРТИЗОЛЪТ",
        subtitle: "(блокира тестостерона)",
        description: "Кортизолът те УБИВА отвътре. Стресът вдига кортизола. Кортизолът убива тестостерона. Всеки ден - по-слаб. Корем. Мазнини. Нулева енергия.",
        stat: "64% от мъжете над 35 - АТАКУВАНИ от кортизол",
        color: "from-destructive/20 to-red-500/20 border-destructive/40"
      };
    }
    if (userData?.weight && parseInt(userData.weight) > 90) {
      return {
        emoji: "🍔",
        title: "ИНСУЛИНЪТ",
        subtitle: "(мазнините произвеждат естроген)",
        description: "Инсулинът те прави ДЕБЕЛ и безполезен. Въглехидрати → инсулин → мазнини в корема. Мазнините произвеждат естроген. Естрогенът блокира тестостерона. Ставаш по-дебел всеки ден.",
        stat: "58% от мъжете над 35 - АТАКУВАНИ от инсулин",
        color: "from-orange-500/20 to-amber-500/20 border-orange-500/40"
      };
    }

    // Default
    return {
      emoji: "😰",
      title: "СТРЕСЪТ",
      subtitle: "(блокира тестостерона)",
      description: "Кортизолът те УБИВА отвътре. Стресът вдига кортизола. Кортизолът убива тестостерона. Всеки ден - по-слаб.",
      stat: "64% от мъжете над 35 - АТАКУВАНИ от кортизол",
      color: "from-destructive/20 to-red-500/20 border-destructive/40"
    };
  };

  const villain = getVillain();

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-5">
        {/* Headline */}
        <div>
          <p className="text-xs text-destructive uppercase tracking-wide mb-1 font-bold">ОТКРИХМЕ ГО ПРЕДИ 3 ГОДИНИ:</p>
          <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
            {userData?.firstName ? `${userData.firstName}, ` : ""}знаеш ли кой те УБИВА всеки ден?
          </h1>
        </div>

        {/* Villain Card - ONE BIG FOCUS */}
        <div className={`bg-gradient-to-br ${villain.color} border-2 rounded-2xl p-5 space-y-4 shadow-2xl`}>
          {/* Giant Emoji */}
          <div className="text-6xl">
            {villain.emoji}
          </div>

          {/* Villain Name */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {villain.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {villain.subtitle}
            </p>
          </div>

          {/* What it does */}
          <div className="bg-card/60 rounded-lg p-3 border border-border text-left">
            <p className="text-sm text-foreground leading-snug font-medium">
              {villain.description}
            </p>
          </div>

          {/* Stat */}
          <div className="bg-destructive/20 border border-destructive/40 rounded-lg p-2">
            <p className="text-xs font-bold text-destructive text-center">
              ⚠️ {villain.stat}
            </p>
          </div>
        </div>

        <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-3 text-left animate-pulse">
          <p className="text-xs font-semibold text-foreground">
            ⚠️ Колкото по-дълго чакаш, толкова по-тежко става
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            След година? Още по-зле. След 3 години? Почти невъзможно.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Button
            onClick={onProceed}
            size="lg"
            className="w-full text-lg py-5 bg-gradient-to-r from-destructive to-orange-600 hover:from-destructive/90 hover:to-orange-600/90 font-bold shadow-xl"
          >
            Как го СПИРАМ?
          </Button>

          <AutoAdvanceIndicator totalSeconds={10} />
        </div>
      </div>
    </div>
  );
};
