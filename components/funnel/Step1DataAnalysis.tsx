import { useEffect, useState } from "react";

export const Step1DataAnalysis = () => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSteps(1), 1000),
      setTimeout(() => setVisibleSteps(2), 2000),
      setTimeout(() => setVisibleSteps(3), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 25) {
          clearInterval(interval);
          return 25;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    "✓ Обработка на възраст и тегло...",
    "✓ Анализ на симптомите...",
    "✓ Калкулиране на рискови фактори..."
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full border-8 border-primary/20 flex items-center justify-center">
            <div className="text-5xl font-bold text-primary">
              {percentage}%
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-32 h-32 rounded-full border-8 border-primary border-t-transparent animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          🔬 АНАЛИЗИРАМЕ ВАШИЯ ХОРМОНАЛЕН ПРОФИЛ
        </h1>

        <div className="space-y-4 text-left max-w-md mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "text-lg text-muted-foreground transition-all duration-500",
                visibleSteps > index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="pt-8 space-y-4 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">ЗНАЕХТЕ ЛИ:</h2>
          <ul className="space-y-2 text-left max-w-lg mx-auto">
            <li>• 42% от българските мъже над 30 имат клинично ниски нива на тестостерон</li>
            <li>• Средните нива са спаднали с 22% за последните 20 години</li>
            <li>• Повечето мъже губят 1-2% тестостерон годишно след 30-та година</li>
          </ul>
          <p className="pt-4 italic">Вашият персонализиран доклад се зарежда...</p>
        </div>
      </div>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
