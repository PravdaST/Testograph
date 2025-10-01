import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export const Step3StefanStory = () => {
  const [visibleSections, setVisibleSections] = useState<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSections(1), 500),
      setTimeout(() => setVisibleSections(2), 1500),
      setTimeout(() => setVisibleSections(3), 3000),
      setTimeout(() => setVisibleSections(4), 4500),
      setTimeout(() => setVisibleSections(5), 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const results = [
    "Тестостерон: 289 → 794 ng/dL (174% увеличение)",
    "Енергия: От изтощение → Пълна работна седмица + време за семейството",
    'Либидо: От нула → "Жената ми забеляза разликата"',
    "Зала: 3 тренировки седмично, личен рекорд на лежанка",
    "Сън: От 5 часа → 7-8 часа дълбок сън",
    "Увереност: Промоция на работа след 2 месеца"
  ];

  const stats = [
    "87% съобщават значително повече енергия",
    "91% усещат подобрение в либидото",
    "78% отчитат по-добър сън",
    "94% виждат напредък в залата и работата"
  ];

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div
          className={cn(
            "text-center space-y-4 transition-all duration-700",
            visibleSections > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            💡 МАРТИН, 38 ГОДИНИ: ОТ ИЗТОЩЕНИЕ ДО ДОМИНАЦИЯ ЗА 30 ДНИ
          </h1>
          <p className="text-lg text-muted-foreground">
            Маркетинг мениджър, баща на 2 деца. Работеше 10+ часа дневно, нямаше енергия за нищо друго.
          </p>
        </div>

        <div
          className={cn(
            "grid md:grid-cols-2 gap-6 transition-all duration-700",
            visibleSections > 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="bg-card border-2 border-destructive/30 rounded-lg p-6 text-center space-y-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src="/funnel/martin-before.jpg"
                alt="Преди трансформация"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">ПРЕДИ (Ден 0):</p>
              <p className="text-lg font-bold text-destructive">Тестостерон: 289 ng/dL</p>
            </div>
          </div>

          <div className="bg-card border-2 border-primary rounded-lg p-6 text-center space-y-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src="/funnel/martin-after.jpg"
                alt="След трансформация"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">СЛЕД 30 ДНИ:</p>
              <p className="text-lg font-bold text-primary">Тестостерон: 794 ng/dL</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "bg-card border border-border rounded-lg p-6 space-y-4 transition-all duration-700",
            visibleSections > 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h2 className="text-2xl font-bold text-center text-foreground">
            СЛЕД 30 ДНИ НА ПРОТОКОЛА:
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{result}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "text-center space-y-4 transition-all duration-700",
            visibleSections > 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <p className="text-lg font-semibold text-foreground">
            Мартин е един от 341 български мъже които следват протокола.
          </p>
          
          <div className="bg-primary/10 rounded-lg p-6 space-y-3">
            <h3 className="text-xl font-bold text-primary">СРЕДНИ РЕЗУЛТАТИ СЛЕД 30 ДНИ:</h3>
            <div className="grid md:grid-cols-2 gap-2 text-left">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "bg-gradient-card backdrop-blur-md rounded-lg p-8 text-center space-y-4 transition-all duration-700",
            visibleSections > 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h2 className="text-2xl font-bold text-foreground">
            ЕСТЕСТВЕНО. СЛЕДВАЙКИ ТОЧНИЯ ПРОТОКОЛ.
          </h2>
          <p className="text-lg text-muted-foreground">
            Не е магия. Не са хапчета за чудеса.
          </p>
          <p className="text-muted-foreground">
            Безплатният 7-дневен план който получавате е ДОБРО НАЧАЛО - ще усетите първата разлика.
          </p>
          <p className="text-muted-foreground">
            Но Мартин следва ПЪЛНИЯ 30-дневен протокол. Същият който атакува всичките 3 причини за ниски нива едновременно.
          </p>
          <p className="text-lg font-semibold text-foreground">
            Искате същите резултати като Мартин? Нужен ви е пълният протокол.
          </p>
          <p className="text-xl font-bold text-primary">
            И той е на екран разстояние...
          </p>
        </div>
      </div>
    </div>
  );
};
