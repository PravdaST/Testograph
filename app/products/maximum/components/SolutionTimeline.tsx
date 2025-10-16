"use client";

export function SolutionTimeline() {
  const phases = [
    {
      days: "Ден 1-30",
      title: "Адаптация и първи резултати",
      description: "Тялото започва да реагира на протокола. Първите промени са забележими.",
      results: [
        "Подобрена енергия сутрин",
        "По-добър и дълбок сън",
        "Първи признаци на повишено либидо",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      days: "Ден 31-60",
      title: "Стабилизация и ускорение",
      description: "Хормоналната система се стабилизира. Резултатите стават по-видими.",
      results: [
        "Значително повишена енергия",
        "Тренировките дават видими резултати",
        "Либидото се връща на нормални нива",
        "Подобрен фокус и концентрация",
      ],
      color: "from-violet-500 to-purple-500",
    },
    {
      days: "Ден 61-90",
      title: "Видима трансформация",
      description: "Промените са явни - за теб и за околните. Усещаш се като нов човек.",
      results: [
        "Мускулна маса и сила растат видимо",
        "Либидото е на пиков ниво",
        "Уверен остта и драйвът са върнати",
        "Телесни мазнини намаляват",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      days: "Ден 91-120",
      title: "Максимални резултати",
      description: "Пълна оптимизация. Това е новият ти нормален режим.",
      results: [
        "Пикова физическа форма",
        "Хормоналното здраве е оптимизирано",
        "Консистентна високаенергия",
        "Сексуалното здраве е върнато напълно",
        "Нова версия на себе си",
      ],
      color: "from-red-600 to-orange-700",
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Как МАКС пакетът ще промени живота ти за 120 дни
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Пълна 4-месечна трансформация. Видими резултати. Траен успех.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8 md:space-y-12">
          {phases.map((phase, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-8 md:left-12 top-24 md:top-32 w-1 h-full bg-gradient-to-b from-orange-600 to-transparent" />
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
                    <span className="text-sm md:text-base font-bold text-orange-600">
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
        <div className="mt-12 md:mt-16 text-center bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-xl p-6 md:p-10 border-2 border-orange-600/30">
          <p className="text-xl md:text-2xl font-bold mb-2">
            120 дни. Пълна трансформация. Траен резултат.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Това не е временна промяна. Това е нов начин на живот. Оптимизиран. Мощен. Траен.
          </p>
        </div>
      </div>
    </section>
  );
}
