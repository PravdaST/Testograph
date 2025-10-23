import React from 'react';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Guarantee() {
  const requirements = [
    'Попълваш ежедневния чек-ин (5 въпроса, 2 минути)',
    'Следваш тренировъчния протокол (3-4x седмично)',
    'Следваш хранителния протокол',
    'Вземаш добавката според инструкциите',
    'Прилагаш протокола за сън и стрес'
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-primary-50">
      <Container maxWidth="4xl">
        <SectionHeader
          headline="НАШАТА ГАРАНЦИЯ ЗА РЕЗУЛТАТИ"
          icon={ShieldCheck}
        />

        {/* 3-Step Process */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Поръчваш системата днес</h3>
            <p className="text-3xl font-bold text-primary-600">67 лв</p>
          </div>

          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Даваш 100% от себе си</h3>
            <p className="text-lg text-neutral-700">30 дни</p>
          </div>

          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Оценяваш резултатите</h3>
            <p className="text-sm text-green-600 font-semibold">Работи или пари назад</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Какво означава "100%":
          </h3>
          <div className="space-y-3 max-w-2xl mx-auto">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700">{req}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-200">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="font-bold text-neutral-900 mb-3">Ако СИ ДАЛ 100% и системата не работи за теб:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  <span>Пишеш ни на имейл/telegram</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  <span>Показваш ни check-in записите (автоматични от app)</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  <span className="font-bold">Връщаме 100% от парите без въпроси</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fairness Statement */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Справедлив обмен:</h3>
          <div className="space-y-2 text-lg">
            <p><span className="font-bold">ТИ</span> → Даваш 100% усилие</p>
            <p><span className="font-bold">НИЕ</span> → Гарантираме резултати или пари назад</p>
          </div>
        </div>

        {/* Social Proof Tie-in */}
        <div className="mt-8 text-center">
          <p className="text-lg text-neutral-700">
            127 потребители. 94% виждат резултати.
          </p>
          <p className="text-neutral-600 mt-2">
            <span className="font-semibold">Защо?</span> Защото СЛЕДВАТ системата.
          </p>
          <p className="text-lg font-bold text-primary-700 mt-4">
            Рискът е изцяло наш когато ТИ работиш.
          </p>
        </div>
      </Container>
    </section>
  );
}
