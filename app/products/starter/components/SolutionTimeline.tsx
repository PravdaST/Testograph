"use client";

export function SolutionTimeline() {
  const phases = [
    {
      days: "Ден 1-7",
      title: "Стартираш протокола",
      description: "Започваш да вземаш TestoUP всеки ден и следваш точните указания от протокола.",
      results: ["Първи признаци на подобрена енергия", "По-добър сън в края на седмицата"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      days: "Ден 8-21",
      title: "Тялото ти се адаптира",
      description: "Хормоналната система започва да реагира. Вижда се реална промяна.",
      results: [
        "Енергия сутрин - няма нужда от 3 кафета",
        "Тренировките стават по-силни",
        "Съня е по-дълбок и качествен",
      ],
      color: "from-violet-500 to-purple-500",
    },
    {
      days: "Ден 22-30",
      title: "Виждаш резултатите",
      description: "Промяната е видима - за теб и за околните.",
      results: [
        "Либидото се връща",
        "Мускулите реагират на тренировките",
        "Уверен остта и фокусът са на върха",
        "Чувстваш се като преди 10 години",
      ],
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Как СТАРТ пакетът ще промени живота ти за 30 дни
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Точен план. Ясни стъпки. Видими резултати.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8 md:space-y-12">
          {phases.map((phase, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-8 md:left-12 top-24 md:top-32 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
              )}

              <div className="flex gap-4 md:gap-6">
                {/* Phase Number */}
                <div className={`flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-xl`}>
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 bg-background rounded-xl p-6 md:p-8 shadow-lg border border-border">
                  <div className="mb-4">
                    <span className="text-sm md:text-base font-bold text-primary">
                      {phase.days}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg">
                      {phase.description}
                    </p>
                  </div>

                  {/* Results */}
                  <div className="space-y-2">
                    <p className="font-semibold text-sm md:text-base">Какво очакваш:</p>
                    <ul className="space-y-2">
                      {phase.results.map((result, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm md:text-base"
                        >
                          <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                          <span>{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Message */}
        <div className="mt-12 md:mt-16 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 md:p-10 border-2 border-primary/30">
          <p className="text-xl md:text-2xl font-bold mb-2">
            30 дни. Това е всичко от което се нуждаеш.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Не са нужни години. Не са нужни скъпи процедури. Просто следваш протокола.
          </p>
        </div>
      </div>
    </section>
  );
}
