import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface Step2ThreeKillersProps {
  userData?: UserData;
}

export const Step2ThreeKillers = ({ userData }: Step2ThreeKillersProps) => {
  const [visibleProblems, setVisibleProblems] = useState<number>(0);

  // Determine which problem to highlight based on user symptoms
  const getHighlightedProblem = (): number | null => {
    if (!userData) return null;

    // Priority order: libido > morningEnergy > weight
    if (userData.libido === "low") return 2; // Problem #3 (index 2) - Ecotoxins
    if (userData.morningEnergy === "low") return 0; // Problem #1 (index 0) - Stress
    if (userData.weight && parseInt(userData.weight) > 90) return 1; // Problem #2 (index 1) - Diet

    return null;
  };

  const highlightedProblem = getHighlightedProblem();

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleProblems(1), 500),
      setTimeout(() => setVisibleProblems(2), 1500),
      setTimeout(() => setVisibleProblems(3), 2500),
      setTimeout(() => setVisibleProblems(4), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const problems = [
    {
      title: "ХРОНИЧЕН СТРЕС И УМОРА",
      description: "Високият кортизол директно блокира производството на тестостерон.",
      results: [
        "Липса на енергия",
        "Раздразнителност",
        "Умствена мъгла",
        "Проблеми със съня"
      ]
    },
    {
      title: "ВЪГЛЕХИДРАТНА ДИЕТА + ЗАСЕДНАЛ ЖИВОТ",
      description: "Инсулиновите скокове унищожават хормоналния баланс.",
      results: [
        "Мазнини в корема",
        "Загуба на мускулна маса",
        "Постоянна умора след хранене",
        "Ниска енергия през деня"
      ]
    },
    {
      title: "ЕКОТОКСИНИ (ПЛАСТМАСИ, ПЕСТИЦИДИ)",
      description: "Имитират естроген и блокират мъжките хормони.",
      results: [
        '"Меко" тяло',
        "Ниско либидо",
        "Слаба ереция",
        "Гинекомастия (гърди при мъже)"
      ]
    }
  ];

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
          {userData?.firstName ? `${userData.firstName}, ` : ""}❌ ЕТО ЗАЩО ИМАШ ТЕЗИ СИМПТОМИ
        </h1>

        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {problems.map((problem, index) => {
              const isHighlighted = highlightedProblem === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-card rounded-lg p-6 space-y-4 transition-all duration-700 w-[85vw] flex-shrink-0 relative",
                    visibleProblems > index ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
                    isHighlighted
                      ? "border-4 border-orange-500 shadow-xl shadow-orange-500/20 animate-pulse"
                      : "border-2 border-destructive/20"
                  )}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                      ⚠️ ТВОЙ #1 ПРОБЛЕМ
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-destructive">{index + 1}</span>
                  </div>

                  <h3 className="text-lg font-bold text-destructive">
                    {problem.title}
                  </h3>

                  <p className="text-muted-foreground">
                    {problem.description}
                  </p>

                  <div className="pt-2">
                    <p className="font-semibold mb-2">Резултат:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {problem.results.map((result, i) => (
                        <li key={i}>• {result}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => {
            const isHighlighted = highlightedProblem === index;
            return (
              <div
                key={index}
                className={cn(
                  "bg-card rounded-lg p-6 space-y-4 transition-all duration-700 relative",
                  visibleProblems > index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  isHighlighted
                    ? "border-4 border-orange-500 shadow-xl shadow-orange-500/20 animate-pulse"
                    : "border-2 border-destructive/20"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                    ⚠️ ТВОЙ #1 ПРОБЛЕМ
                  </div>
                )}

                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-destructive">{index + 1}</span>
                </div>

                <h3 className="text-lg font-bold text-destructive">
                  {problem.title}
                </h3>

                <p className="text-muted-foreground">
                  {problem.description}
                </p>

                <div className="pt-2">
                  <p className="font-semibold mb-2">Резултат:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {problem.results.map((result, i) => (
                      <li key={i}>• {result}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "bg-gradient-to-r from-orange-500 to-red-600 border-2 border-orange-400 rounded-lg p-6 text-center space-y-3 transition-all duration-700 shadow-xl",
            visibleProblems > 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <AlertTriangle className="w-12 h-12 mx-auto text-white drop-shadow-lg" />
          <p className="text-xl font-bold text-white">
            ⚠ ПОВЕЧЕТО МЪЖЕ АТАКУВАТ САМО ЕДИН ПРОБЛЕМ...
          </p>
          <p className="text-lg text-white/90">
            ...и се чудят защо нищо не се подобрява.
          </p>
          <p className="text-lg font-semibold text-white">
            Трябва ви СИСТЕМА която атакува и трите едновременно.
          </p>
        </div>
      </div>
    </div>
  );
};
