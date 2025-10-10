import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addUTMToUrl, trackCTAClick } from "@/lib/analytics/funnel-tracker";

interface TierFeature {
  name: string;
  digital: boolean | string;
  regular: boolean | string;
  premium: boolean | string;
}

interface TierComparisonTableProps {
  currentTier?: "premium" | "regular" | "digital";
}

export const TierComparisonTable = ({ currentTier }: TierComparisonTableProps) => {
  const features: TierFeature[] = [
    {
      name: "Добавка TESTO UP",
      digital: false,
      regular: "1 бутилка (30 дни)",
      premium: "3 бутилки (90 дни)"
    },
    {
      name: "Дигитален TESTOGRAPH план",
      digital: true,
      regular: true,
      premium: true
    },
    {
      name: "Персонализация на плана",
      digital: "Базова",
      regular: "Напреднала",
      premium: "Пълна"
    },
    {
      name: "Meal Planner",
      digital: false,
      regular: false,
      premium: true
    },
    {
      name: "Sleep Protocol",
      digital: false,
      regular: false,
      premium: true
    },
    {
      name: "Exercise Guide",
      digital: false,
      regular: false,
      premium: true
    },
    {
      name: "Lab Testing Guide",
      digital: false,
      regular: false,
      premium: true
    },
    {
      name: "24/7 Експертна поддръжка",
      digital: false,
      regular: "Email (48ч отговор)",
      premium: "Viber/неограничена"
    },
    {
      name: "30-дневна гаранция",
      digital: true,
      regular: true,
      premium: true
    }
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500 mx-auto" />
      );
    }
    return (
      <span className="text-xs md:text-sm text-center block px-2">
        {value}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-foreground">
          Избери нивото си
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Всички опции работят. Някои просто работят по-бързо.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 p-4 text-left"></th>

              {/* Digital Column */}
              <th className="w-1/4 p-4">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-xl p-6 border-2 border-gray-600">
                  <p className="text-sm text-gray-400 mb-2">START-ER</p>
                  <h3 className="text-2xl font-black text-white mb-2">Digital</h3>
                  <p className="text-4xl font-black text-primary mb-1">47 лв</p>
                  <p className="text-xs text-gray-400">План без добавка</p>
                </div>
              </th>

              {/* Regular Column */}
              <th className="w-1/4 p-4">
                <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-t-xl p-6 border-2 border-blue-500">
                  <p className="text-sm text-blue-300 mb-2">ПОПУЛЯРЕН</p>
                  <h3 className="text-2xl font-black text-white mb-2">Regular</h3>
                  <p className="text-4xl font-black text-blue-400 mb-1">97 лв</p>
                  <p className="text-xs text-gray-400">1 месец система</p>
                </div>
              </th>

              {/* Premium Column */}
              <th className="w-1/4 p-4">
                <div className="bg-gradient-to-b from-orange-600 to-red-700 rounded-t-xl p-6 border-4 border-orange-400 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black">
                    ⭐ НАЙ-ДОБРА СТОЙНОСТ
                  </div>
                  <p className="text-sm text-orange-200 mb-2 mt-2">ПЪЛНА СИЛА</p>
                  <h3 className="text-2xl font-black text-white mb-2">Premium</h3>
                  <p className="text-4xl font-black text-white mb-1">197 лв</p>
                  <p className="text-xs text-orange-200">3 месеца + всичко</p>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-4 text-sm md:text-base font-medium text-foreground">
                  {feature.name}
                </td>
                <td className="p-4 text-center bg-gray-900/50">
                  {renderValue(feature.digital)}
                </td>
                <td className="p-4 text-center bg-blue-950/30">
                  {renderValue(feature.regular)}
                </td>
                <td className="p-4 text-center bg-orange-950/30">
                  {renderValue(feature.premium)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-4"></td>
              <td className="p-4">
                <Button
                  size="lg"
                  variant={currentTier === "digital" ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <a
                    href={addUTMToUrl("https://shop.testograph.eu/collections/digitals", { tier: 'digital', step: 8, content: 'tier_table_desktop' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick(8, 'digital', 'https://shop.testograph.eu/collections/digitals', { position: 'tier_table_desktop' })}
                  >
                    {currentTier === "digital" ? "Избрахте това ✓" : "Избери Digital"}
                  </a>
                </Button>
              </td>
              <td className="p-4">
                <Button
                  size="lg"
                  variant={currentTier === "regular" ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <a
                    href={addUTMToUrl("https://shop.testograph.eu/collections/regular", { tier: 'regular', step: 8, content: 'tier_table_desktop' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick(8, 'regular', 'https://shop.testograph.eu/collections/regular', { position: 'tier_table_desktop' })}
                  >
                    {currentTier === "regular" ? "Избрахте това ✓" : "Избери Regular"}
                  </a>
                </Button>
              </td>
              <td className="p-4">
                <Button
                  size="lg"
                  variant={currentTier === "premium" ? "default" : "outline"}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  asChild
                >
                  <a
                    href={addUTMToUrl("https://shop.testograph.eu/collections/bundles", { tier: 'premium', step: 8, content: 'tier_table_desktop' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick(8, 'premium', 'https://shop.testograph.eu/collections/bundles', { position: 'tier_table_desktop' })}
                  >
                    {currentTier === "premium" ? "Избрахте това ✓" : "Избери Premium"}
                  </a>
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {/* Premium Card - Show first on mobile */}
        <div className="bg-gradient-to-b from-orange-600 to-red-700 rounded-xl p-6 border-4 border-orange-400 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black">
            ⭐ НАЙ-ДОБРА СТОЙНОСТ
          </div>
          <div className="text-center mb-6 mt-2">
            <p className="text-sm text-orange-200 mb-1">ПЪЛНА СИЛА</p>
            <h3 className="text-2xl font-black text-white mb-2">Premium</h3>
            <p className="text-5xl font-black text-white mb-1">197 лв</p>
            <p className="text-sm text-orange-200">3 месеца + всичко</p>
          </div>
          <div className="space-y-2 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-orange-500/30">
                <span className="text-sm text-white">{feature.name}</span>
                <div className="text-white">{renderValue(feature.premium)}</div>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="w-full bg-white text-orange-600 hover:bg-gray-100 font-black"
            asChild
          >
            <a
              href={addUTMToUrl("https://shop.testograph.eu?tier=premium", { tier: 'premium', step: 8, content: 'tier_table_mobile' })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick(8, 'premium', 'https://shop.testograph.eu', { position: 'tier_table_mobile' })}
            >
              {currentTier === "premium" ? "Избрахте това ✓" : "Избери Premium"}
            </a>
          </Button>
        </div>

        {/* Regular Card */}
        <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl p-6 border-2 border-blue-500">
          <div className="text-center mb-6">
            <p className="text-sm text-blue-300 mb-1">ПОПУЛЯРЕН</p>
            <h3 className="text-2xl font-black text-white mb-2">Regular</h3>
            <p className="text-5xl font-black text-blue-400 mb-1">97 лв</p>
            <p className="text-sm text-gray-400">1 месец система</p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            asChild
          >
            <a
              href={addUTMToUrl("https://shop.testograph.eu?tier=single", { tier: 'regular', step: 8, content: 'tier_table_mobile' })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick(8, 'regular', 'https://shop.testograph.eu', { position: 'tier_table_mobile' })}
            >
              {currentTier === "regular" ? "Избрахте това ✓" : "Избери Regular"}
            </a>
          </Button>
        </div>

        {/* Digital Card */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-600">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-1">START-ER</p>
            <h3 className="text-2xl font-black text-white mb-2">Digital</h3>
            <p className="text-5xl font-black text-primary mb-1">47 лв</p>
            <p className="text-sm text-gray-400">План без добавка</p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            asChild
          >
            <a
              href={addUTMToUrl("https://shop.testograph.eu?tier=digital", { tier: 'digital', step: 8, content: 'tier_table_mobile' })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick(8, 'digital', 'https://shop.testograph.eu', { position: 'tier_table_mobile' })}
            >
              {currentTier === "digital" ? "Избрахте това ✓" : "Избери Digital"}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
