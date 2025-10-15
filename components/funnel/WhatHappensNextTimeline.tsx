interface WhatHappensNextTimelineProps {
  tier: "premium" | "regular" | "digital";
}

export const WhatHappensNextTimeline = ({ tier }: WhatHappensNextTimelineProps) => {
  const hasPhysicalProduct = tier === "premium" || tier === "regular";

  const steps = [
    {
      time: "След 2 минути",
      icon: "⚡",
      title: "Веднага започваш",
      description: tier === "premium" ? "Достъп до плана и всички бонуси" : tier === "regular" ? "Достъп до плана" : "Достъп до целия дигитален план",
      color: "from-orange-500 to-red-500"
    },
    ...(hasPhysicalProduct ? [{
      time: "Утре",
      icon: "📦",
      title: tier === "premium" ? "3 бутилки при теб" : "Бутилката при теб",
      description: "Безплатна доставка до врата",
      color: "from-blue-500 to-cyan-500"
    }] : []),
    {
      time: "След 7 дни",
      icon: "💪",
      title: "ПЪРВАТА промяна",
      description: "Усещаш силата да се връща",
      color: "from-green-500 to-emerald-500"
    },
    ...(tier === "premium" ? [{
      time: "Всеки ден",
      icon: "🤝",
      title: "Никога не си сам",
      description: "Експертът ти отговаря веднага",
      color: "from-purple-500 to-violet-500"
    }] : [])
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black rounded-xl p-6 md:p-8 border-2 border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
          Какво се случва СЕГА?
        </h3>
        <p className="text-sm md:text-base text-gray-400">
          От момента на поръчката до първия резултат
        </p>
      </div>

      <div className="relative space-y-6">
        {/* Vertical connecting line */}
        <div className="absolute left-6 md:left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-orange-500 via-green-500 to-purple-500 opacity-30"></div>

        {steps.map((step, index) => (
          <div key={index} className="relative flex gap-4 md:gap-6 items-start">
            {/* Icon circle */}
            <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-gray-800`}>
              <span className="text-2xl md:text-3xl">{step.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-5 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs md:text-sm font-bold text-orange-400 uppercase tracking-wide">
                  {step.time}
                </p>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-white mb-1">
                {step.title}
              </h4>
              <p className="text-sm md:text-base text-gray-300">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 pt-6 border-t border-gray-700 text-center">
        <p className="text-base md:text-lg font-black text-white mb-1">
          Започваш ДНЕС. Не утре. ДНЕС.
        </p>
        <p className="text-sm text-gray-400">
          Никакво чакане. Никакви отлагания.
        </p>
      </div>
    </div>
  );
};
