import { CheckCircle2, Sparkles } from "lucide-react";

interface ValueItem {
  title: string;
  description: string;
  value: string;
}

export const ValueStack = () => {
  const items: ValueItem[] = [
    {
      title: "Персонализиран PDF доклад с оценка",
      description: "Точна оценка на нивата ти на тестостерон с цифри и персонален анализ на състоянието ти",
      value: "67 лв"
    },
    {
      title: "7-дневен план за ъпгрейд",
      description: "Конкретни действия ден-по-ден: храна, тренировки, леден душ, слънце, навици",
      value: "49 лв"
    },
    {
      title: "Достъп до AI експертния чат 24/7",
      description: "Задавай въпроси на Т.Богданов винаги когато имаш нужда - качи PDF-а и питай каквото искаш",
      value: "81 лв"
    },
    {
      title: "100% дискретно и сигурно",
      description: "Данните ти са криптирани, никога не се споделят. Никой няма да научи.",
      value: "Безценно"
    }
  ];

  const totalValue = 197;

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>

      <div className="relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-3xl border-2 border-primary/30 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              Безплатна оферта (Ограничена)
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Това получаваш <span className="text-primary">БЕЗПЛАТНО</span>
          </h3>
          <p className="text-muted-foreground">
            (Ако действаш в следващите 15 минути)
          </p>
        </div>

        {/* Value Items */}
        <div className="space-y-4 mb-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-primary">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Value Breakdown */}
        <div className="border-t-2 border-dashed border-border/50 pt-6 space-y-4">
          {/* Total Value */}
          <div className="flex items-center justify-between text-xl">
            <span className="font-semibold text-muted-foreground">ОБЩА СТОЙНОСТ:</span>
            <span className="font-bold text-muted-foreground line-through">{totalValue} лв</span>
          </div>

          {/* Price Today */}
          <div className="flex items-center justify-between text-3xl mb-2">
            <span className="font-bold text-foreground">ЦЕНА ДНЕС:</span>
            <div className="text-right">
              <span className="font-black text-success text-5xl">0 лв</span>
            </div>
          </div>

          {/* You Save */}
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold text-muted-foreground">СПЕСТЯВАШ:</span>
            <span className="font-bold text-success">{totalValue} лв (100%)</span>
          </div>

          {/* Fine Print */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-6">
            <p className="text-sm text-warning font-medium text-center">
              ⚠️ След като запълним 200-те места, цената става 47 лв
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};