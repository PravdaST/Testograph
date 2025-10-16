"use client";

export function WhyTestoUp() {
  const benefits = [
    {
      emoji: "⚡",
      title: "Повишава енергията",
      description: "Чувстваш се буден и енергичен от сутрин до вечер. Без умора и вялост.",
    },
    {
      emoji: "💪",
      title: "Подобрява силата",
      description: "Мускулите растат по-лесно. Силата се връща. Тренировките дават резултати.",
    },
    {
      emoji: "🔥",
      title: "Връща либидото",
      description: "Сексуалното желание се връща на нормални нива. Уверен остта се възстановява.",
    },
    {
      emoji: "😴",
      title: "Подобрява съня",
      description: "По-дълбок и качествен сън. Събуждаш се отпочинал и готов за деня.",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Защо TestoUP работи?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            5 активни съставки, клинично доказани да повишават тестостерона естествено
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border border-border"
            >
              <div className="text-5xl md:text-6xl mb-4">{benefit.emoji}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 md:p-10 border-2 border-primary/30 text-center">
          <p className="text-xl md:text-2xl font-bold mb-4">
            Без химия. Само природа. Клинично доказано.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Всяка съставка в TestoUP е избрана на база научни изследвания.
            Произведено в ЕС по най-високи стандарти (GMP сертифициран).
          </p>
        </div>
      </div>
    </section>
  );
}
