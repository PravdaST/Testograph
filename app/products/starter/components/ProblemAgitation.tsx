"use client";

export function ProblemAgitation() {
  const problems = [
    {
      emoji: "😴",
      title: "Нулева енергия сутрин",
      description: "Въпреки 8 часа сън, буден си уморен. Нямаш сили дори за кафе.",
    },
    {
      emoji: "💪",
      title: "Залата не дава резултати",
      description: "Вдигаш тежести, но мускулите не растат. Силата не се връща.",
    },
    {
      emoji: "🔥",
      title: "Либидото ти вече не е като преди",
      description: "Искането го няма. Уверен остта изчезна. Не си същият.",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Познато ли ти звучи това?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Не си сам. 78% от мъжете над 30 имат намалени нива на тестостерон.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border border-border"
            >
              <div className="text-5xl md:text-6xl mb-4">{problem.emoji}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {problem.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Empathy Statement */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 md:p-10 border-2 border-primary/30 text-center">
          <p className="text-xl md:text-2xl font-bold mb-4">
            Разбираме те. Не си сам.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Години наред мъжете мълчат за това. Притискат се, че всичко е "нормално".
            Но нищо не е нормално да живееш наполовина. Не си длъжен да търпиш това.
          </p>
        </div>
      </div>
    </section>
  );
}
