import React from 'react';
import { Check, Star, Zap, Shield, Truck, Lock, Award } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';
import Button from '../shared/Button';

export default function Pricing() {
  const packages = [
    {
      name: 'STARTER',
      tagline: 'Започни правилно',
      price: 67,
      originalPrice: 214,
      duration: '30 дни',
      dailyCost: '2.23 лв/ден',
      savings: '147 лв (69%)',
      features: [
        '1x TESTOUP добавка (30 дози)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      recommended: false
    },
    {
      name: 'PERFORMANCE',
      tagline: 'Ускори резултатите',
      price: 127,
      originalPrice: 526,
      duration: '60 дни',
      dailyCost: '2.12 лв/ден',
      savings: '399 лв (76%)',
      badge: 'ПОПУЛЯРЕН',
      features: [
        '2x TESTOUP добавка (60 дози)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      bonuses: [
        'NUTRITION TRACKER APP',
        'TRAINING TRACKER APP'
      ],
      recommended: true
    },
    {
      name: 'COMPLETE SYSTEM',
      tagline: 'Пълна трансформация',
      price: 179,
      originalPrice: 887,
      duration: '90 дни',
      dailyCost: '1.99 лв/ден',
      savings: '708 лв (80%)',
      badge: 'MAX VALUE',
      features: [
        '3x TESTOUP добавка (90 дози)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      bonuses: [
        'Nutrition Tracker',
        'Training Tracker',
        'Sleep Optimizer',
        'Body Metrics',
        'Supplement Scheduler'
      ],
      extras: ['БЕЗПЛАТНА доставка', 'Приоритетна поддръжка'],
      recommended: false
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <Container>
        <SectionHeader
          headline="ИЗБЕРИ СВОЯ ПАКЕТ"
          description="Всички пакети с 30-дневна гаранция"
        />

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                pkg.recommended
                  ? 'border-primary-500 shadow-xl scale-105'
                  : 'border-neutral-200'
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary-600 text-white rounded-full font-bold text-sm flex items-center gap-2">
                  {pkg.badge === 'ПОПУЛЯРЕН' ? <Star className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {pkg.badge}
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 pt-4">
                <h3 className="text-2xl font-bold text-neutral-900">{pkg.name}</h3>
                <p className="text-neutral-600 mt-2">"{pkg.tagline}"</p>
              </div>

              {/* Pricing */}
              <div className="bg-primary-50 rounded-xl p-4 mb-6 text-center">
                <div className="text-sm text-neutral-600 line-through mb-1">
                  Стойност: {pkg.originalPrice} лв
                </div>
                <div className="text-4xl font-bold text-primary-600">{pkg.price} лв</div>
                <div className="text-sm text-neutral-600 mt-1">({pkg.dailyCost})</div>
                <div className="text-sm font-semibold text-green-600 mt-2">
                  СПЕСТЯВАШ: {pkg.savings}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}

                {pkg.bonuses && (
                  <>
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="flex items-center gap-2 text-primary-600 font-semibold mb-3">
                        <Zap className="w-4 h-4" />
                        БОНУС APPS:
                      </div>
                      {pkg.bonuses.map((bonus, idx) => (
                        <div key={idx} className="flex items-start gap-3 ml-6 mb-2">
                          <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-neutral-700">{bonus}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {pkg.extras && (
                  <div className="pt-4 border-t border-neutral-200 space-y-2">
                    {pkg.extras.map((extra, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <Star className="w-4 h-4" />
                        {extra}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button
                variant={pkg.recommended ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
              >
                {pkg.recommended ? `ИЗБИРАМ ${pkg.name}` : `ЗАПОЧНИ С ${pkg.name}`}
              </Button>
            </div>
          ))}
        </div>

        {/* Package Guidance */}
        <div className="bg-neutral-50 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-neutral-900 text-center mb-8">
            КОЙ ПАКЕТ Е ЗА ТЕБ?
          </h3>
          <div className="space-y-6">
            <div className="border-l-4 border-neutral-300 pl-6">
              <h4 className="text-lg font-bold text-neutral-900 mb-2">STARTER (67 лв)</h4>
              <ul className="space-y-1 text-neutral-700">
                <li>• Искаш да тестваш дали системата работи</li>
                <li>• Имаш вече опит с тренировки</li>
                <li>• Искаш минимална инвестиция</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-6 bg-primary-50 py-4 rounded-r-lg">
              <h4 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-600" />
                PERFORMANCE (127 лв) - ПРЕПОРЪЧАН
              </h4>
              <ul className="space-y-1 text-neutral-700">
                <li>• Сериозен си за резултатите</li>
                <li>• Искаш да проследяваш всичко точно</li>
                <li>• 2 месеца = достатъчно време за видими резултати</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h4 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                COMPLETE (179 лв) - НАЙ-ДОБРА СТОЙНОСТ
              </h4>
              <ul className="space-y-1 text-neutral-700">
                <li>• Искаш ПЪЛНА трансформация</li>
                <li>• Сериозен си за дългосрочни резултати</li>
                <li>• Искаш ВСИЧКИ инструменти</li>
                <li>• 3 месеца = постоянна промяна</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Shield, label: '30-дневна гаранция', sub: 'Пари назад' },
            { icon: Award, label: 'БАБХ регистрация', sub: 'Официално одобрено' },
            { icon: Lock, label: 'Сигурно плащане', sub: 'SSL криптиране' },
            { icon: Truck, label: 'Доставка 1-3 дни', sub: 'Бързо и сигурно' }
          ].map((badge, index) => (
            <div key={index} className="text-center p-4 bg-neutral-50 rounded-xl hover:shadow-md transition-shadow">
              <badge.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-900">{badge.label}</p>
              <p className="text-xs text-neutral-600">{badge.sub}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
