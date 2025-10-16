"use client";

import { Shield, CheckCircle, Undo2 } from "lucide-react";

export function GuaranteeSection() {
  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-yellow-400/10 via-amber-400/10 to-orange-400/10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-400 rounded-2xl p-8 md:p-12 shadow-2xl border-4 border-yellow-500">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
              <Shield className="w-12 h-12 md:w-14 md:h-14 text-yellow-500" />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              30-ДНЕВНА ГАРАНЦИЯ
            </h2>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              Нулев риск. Ако не видиш резултати, връщаме ти парите.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 rounded-xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Стъпка 1</h3>
              <p className="text-sm text-gray-700">
                Следвай протокола 30 дни
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Стъпка 2</h3>
              <p className="text-sm text-gray-700">
                Ако не усетиш подобрение
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-6 text-center">
              <Undo2 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Стъпка 3</h3>
              <p className="text-sm text-gray-700">
                Изпрати имейл - парите са ти
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white/90 rounded-xl p-6 md:p-8 mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-900">
              Как работи гаранцията:
            </h3>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0 mt-1">✓</span>
                <span>Следваш протокола стриктно за 30 дни</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0 mt-1">✓</span>
                <span>
                  Ако не усетиш подобрение в енергия, либидо или сила - пишеш ни
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0 mt-1">✓</span>
                <span>Получаваш пълно възстановяване без въпроси</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0 mt-1">✓</span>
                <span>Без малък шрифт. Без усложнения.</span>
              </li>
            </ul>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-gray-800 font-semibold">
              Досега само 3% от клиентите са поискали връщане на пари
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Защото протоколът наистина работи.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
