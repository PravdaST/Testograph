import { CheckCircle, X } from "lucide-react";

interface QualificationSectionProps {
  tier: "premium" | "regular" | "digital";
}

export const QualificationSection = ({ tier }: QualificationSectionProps) => {
  const forYouItems = [
    "Мъж си на 28-60 години и усещаш че нещо не е наред",
    "Искаш енергия, сила, либидо като преди 10 години",
    "Готов си да следваш плана - не само да четеш и да забравиш",
    "Разбираш че тялото не се оправя само",
    "Искаш да се чувстваш като мъж отново"
  ];

  const notForYouItems = [
    "Търсиш магическо хапче без усилие",
    "Не си готов да правиш промени",
    "Мислиш че 'на мен няма да ми стане'",
    "Искаш да платиш но не да следваш плана",
    "Очакваш резултати без да вложиш труд"
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black rounded-xl p-6 md:p-8 border-2 border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          Нека бъдем честни - това за теб ли е?
        </h2>
        <p className="text-sm md:text-base text-gray-400">
          Не искам да взимам парите ти, ако наистина не си готов за промяна
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FOR YOU */}
        <div className="bg-green-950/30 rounded-lg p-6 border-2 border-green-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-green-400">
              ТОВА Е ЗА ТЕБ АКО:
            </h3>
          </div>
          <ul className="space-y-3">
            {forYouItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm md:text-base text-gray-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* NOT FOR YOU */}
        <div className="bg-red-950/30 rounded-lg p-6 border-2 border-red-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <X className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-red-400">
              НЕ Е ЗА ТЕБ АКО:
            </h3>
          </div>
          <ul className="space-y-3">
            {notForYouItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                <span className="text-sm md:text-base text-gray-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom message */}
      <div className="mt-8 text-center">
        <p className="text-base md:text-lg font-bold text-white mb-2">
          Няма да се опитвам да те убеждавам.
        </p>
        <p className="text-sm md:text-base text-gray-400">
          Ако си готов, ще го почувстваш. Ако не си - по-добре спести парите си.
        </p>
      </div>
    </div>
  );
};
