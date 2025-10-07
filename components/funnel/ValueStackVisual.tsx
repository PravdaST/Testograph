interface StackItem {
  name: string;
  value: string | number;
  description: string;
  icon: string;
  isBonus?: boolean;
  highlight?: boolean;
}

interface ValueStackVisualProps {
  items: StackItem[];
  totalValue: number;
  discountedPrice: number;
  savings: number;
  spotsLeft?: number;
  tier: "premium" | "regular" | "digital";
}

export const ValueStackVisual = ({
  items,
  totalValue,
  discountedPrice,
  savings,
  spotsLeft,
  tier
}: ValueStackVisualProps) => {
  const coreItems = items.filter(item => !item.isBonus);
  const bonusItems = items.filter(item => item.isBonus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-foreground">
          Ето ТОЧНО какво получаваш:
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Всяка част от системата е проектирана да те направи по-силен
        </p>
      </div>

      {/* The Stack */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 border-4 border-orange-500 shadow-2xl">

        {/* Core Items */}
        <div className="space-y-4 mb-6">
          {coreItems.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-5 border-2 border-gray-600 hover:border-orange-400 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 text-3xl md:text-4xl shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      {item.name}
                    </h3>
                    <div className="flex-shrink-0">
                      {typeof item.value === 'number' ? (
                        <span className="text-xl md:text-2xl font-black text-green-400">
                          {item.value} лв
                        </span>
                      ) : (
                        <span className="text-base md:text-lg font-bold text-green-400">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-300">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonuses Header */}
        {bonusItems.length > 0 && (
          <>
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <span className="text-yellow-400 font-black text-lg uppercase tracking-wide">
                🎁 Бонуси
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            </div>

            {/* Bonus Items */}
            <div className="space-y-3">
              {bonusItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-4 border-2 border-yellow-500/40 hover:border-yellow-400 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-base md:text-lg font-bold text-yellow-200">
                          {item.name}
                        </h4>
                        <span className="text-base md:text-lg font-bold text-yellow-300 whitespace-nowrap">
                          {item.value} лв
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Total Value Line */}
        <div className="mt-8 pt-6 border-t-2 border-gray-600">
          <div className="flex items-center justify-between text-xl md:text-2xl font-black text-white mb-6">
            <span>ОБЩА СТОЙНОСТ:</span>
            <span className="text-green-400">{totalValue} лв</span>
          </div>

          {/* The Dramatic Price Reveal */}
          <div className="bg-black rounded-xl p-6 md:p-8 space-y-4 relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse"></div>

            <div className="relative z-10 space-y-4">
              {/* Old Price */}
              <div className="text-center">
                <p className="text-sm md:text-base text-gray-400 mb-2">Обикновено:</p>
                <div className="relative inline-block">
                  <div className="text-4xl md:text-6xl font-black text-gray-500 relative">
                    {totalValue} лв
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-2 bg-red-600 rotate-[-8deg] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl text-orange-400 animate-bounce">
                  ↓
                </div>
              </div>

              {/* New Price */}
              <div className="text-center">
                <p className="text-base md:text-xl text-gray-300 mb-3 font-bold">ТВОЯТА ЦЕНА ДНЕС:</p>
                <div className="mb-4">
                  <p className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 animate-pulse">
                    {discountedPrice} лв
                  </p>
                </div>
                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
                  <p className="text-xl md:text-2xl font-black">
                    СПЕСТЯВАШ {savings} лв ({Math.round((savings / totalValue) * 100)}%)
                  </p>
                </div>
              </div>

              {/* Per day breakdown */}
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-lg md:text-xl text-gray-300">
                  Това е само <span className="font-black text-orange-400">{(discountedPrice / 30).toFixed(2)} лв/ден</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  По-евтино от {tier === "premium" ? "2 кафета" : tier === "regular" ? "кафе" : "бутилка вода"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spot Scarcity */}
        {spotsLeft && spotsLeft > 0 && (
          <div className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-4 border-2 border-red-500 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-black text-white">
                  САМО {spotsLeft} МЕСТА ОСТАНАЛИ
                </p>
                <p className="text-sm text-white/90 mt-1">
                  След това цената се връща на {totalValue} лв
                </p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom guarantee note */}
      <div className="text-center">
        <p className="text-base md:text-lg text-muted-foreground">
          + 30-дневна гаранция за връщане на парите
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Ако не проработи - връщаме ти всички {discountedPrice} лв без въпроси
        </p>
      </div>
    </div>
  );
};
