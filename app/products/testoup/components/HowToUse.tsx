"use client";

export function HowToUse() {
  const steps = [
    {
      number: "1",
      title: "Вземи 2 капсули дневно",
      description: "Препоръчваме сутрин с храна и вечер преди лягане.",
      detail: "Винаги с достатъчно вода",
      icon: "💊",
    },
    {
      number: "2",
      title: "Следвай редовно",
      description: "За видими резултати е важно да вземаш TestoUP всеки ден без прекъсване.",
      detail: "Минимум 30 дни, оптимално 60-90 дни",
      icon: "📅",
    },
    {
      number: "3",
      title: "Виждаш резултати",
      description: "След 14-21 дни усещаш подобрение. След 30+ дни резултатите са видими.",
      detail: "Повече енергия, сила, либидо",
      icon: "✨",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Как да използваш TestoUP?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Лесно. Просто. Ефективно.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-background rounded-xl p-6 md:p-8 shadow-lg border border-border hover:border-primary transition-all"
            >
              {/* Step Number */}
              <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-black text-white">{step.number}</span>
              </div>

              {/* Icon */}
              <div className="text-5xl mb-4 mt-6">{step.icon}</div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                {step.description}
              </p>
              <p className="text-sm font-semibold text-primary">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500/50 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold text-lg mb-2">Важно:</p>
              <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
                <li>• Не превишавай препоръчителната доза (2 капсули дневно)</li>
                <li>• Не е заместител на разнообразното хранене</li>
                <li>• Съхранявай на сухо и хладно място</li>
                <li>• Ако имаш здравословни проблеми, консултирай се с лекар</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
