"use client";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Поръчваш сега",
      description: "Кликваш бутона, попълваш детайли, избираш начин на плащане.",
      detail: "Пакетът пристига за 2-3 работни дни",
      icon: "🛒",
    },
    {
      number: "2",
      title: "Следваш протокола",
      description: "Всеки ден получаваш точни инструкции какво да правиш.",
      detail: "Храна, тренировки, добавки - всичко е планирано",
      icon: "📋",
    },
    {
      number: "3",
      title: "Виждаш резултати",
      description: "След 14-30 дни усещаш промяната - повече енергия, сила, либидо.",
      detail: "Това е само началото",
      icon: "✨",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Толкова лесно е, че не можеш да сгрешиш
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            3 прости стъпки до новия ти живот
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

        <div className="mt-12 text-center bg-muted/50 rounded-xl p-6 md:p-8">
          <p className="text-lg md:text-xl font-semibold">
            Не се изисква опит, диета или часове в залата
          </p>
          <p className="text-muted-foreground mt-2">
            Просто следваш указанията. Всичко е направено да е лесно.
          </p>
        </div>
      </div>
    </section>
  );
}
