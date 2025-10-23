import React from 'react';
import { Dumbbell, Apple, Moon, Pill, X, Check } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Formula() {
  const formulaParts = [
    { percentage: 35, label: 'Тренировки', icon: Dumbbell, description: 'програма, честота, интензитет' },
    { percentage: 30, label: 'Хранене', icon: Apple, description: 'макроси, timing, качество' },
    { percentage: 15, label: 'Сън и стрес', icon: Moon, description: 'възстановяване, кортизол' },
    { percentage: 20, label: 'Добавки', icon: Pill, description: 'правилни съставки, дози, timing' }
  ];

  const othersFeatures = [
    'Продават ти бурканче с хапчета',
    'Казват ти "вземай 2 капсули дневно"',
    'Останалите 80%? "Виж в интернет"',
    'Не работи? "Не си тренирал добре"',
    'Искаш протокол? Плати още 200-300 лв',
    'Искаш план за храна? Плати още 100 лв'
  ];

  const ourFeatures = [
    'Даваме ти ЦЯЛАТА формула (100%)',
    'Точни протоколи за тренировки',
    'Точен план за хранене',
    'Протокол за сън и възстановяване',
    'Добавката с точни дози и timing',
    'Ежедневно проследяване на напредък'
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        <SectionHeader
          headline="100% ФОРМУЛА ЗА УСПЕХ"
          description="Ако нямаш първите 80%, последните 20% са безполезни."
        />

        {/* Formula Breakdown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {formulaParts.map((part, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <part.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{part.percentage}%</div>
              <div className="text-lg font-semibold text-neutral-900 mb-2">{part.label}</div>
              <p className="text-sm text-neutral-600">{part.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Others */}
          <div className="bg-neutral-50 rounded-xl p-8 border-2 border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">ДРУГИТЕ МАРКИ</h3>
            <div className="space-y-3">
              {othersFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-300 text-center">
              <p className="text-lg font-semibold text-neutral-900">Общо: 500+ лв</p>
              <p className="text-sm text-neutral-600">и все още без резултати гарантирани</p>
            </div>
          </div>

          {/* Us */}
          <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-8 border-2 border-primary-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              TESTOGRAPH
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center pt-2">НИЕ</h3>
            <div className="space-y-3">
              {ourFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-primary-300 text-center">
              <p className="text-xl font-bold text-primary-700">Всичко на цената на добавката</p>
              <p className="text-sm text-neutral-700 mt-2">Не искаме допълнителни пари. Искаме ДА УСПЕЕШ.</p>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
            <p className="text-2xl md:text-3xl font-bold mb-4">
              TESTOGRAPH = ПЪЛНА СИСТЕМА ЗА 100% ОПТИМИЗАЦИЯ
            </p>
            <p className="text-lg opacity-90">
              Първата в България система за пълна оптимизация на мъжкото здраве.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
