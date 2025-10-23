import React from 'react';
import { Users, TrendingUp, Dumbbell, Zap, ArrowRight } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Proof() {
  const stats = [
    { value: '127', label: 'ПОТРЕБИТЕЛИ', icon: Users },
    { value: '94%', label: 'УСПЕХ', icon: TrendingUp, highlight: true },
    { value: '+18%', label: 'СИЛА', icon: Dumbbell },
    { value: '+32%', label: 'ЕНЕРГИЯ', icon: Zap }
  ];

  const timeline = [
    { day: '14 дни', result: 'Енергия, сън, либидо (+15-20%)' },
    { day: '30 дни', result: 'Сила, работоспособност, настроение' },
    { day: '90 дни', result: 'Пълна трансформация (тяло, хормони, живот)', highlight: true }
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-900">
      <Container>
        <SectionHeader
          headline="РАБОТИ ЛИ?"
          align="center"
        />

        {/* Big Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-6 rounded-xl ${
                stat.highlight ? 'bg-primary-600' : 'bg-neutral-800'
              }`}
            >
              <stat.icon className="w-8 h-8 text-white mx-auto mb-4" />
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-300 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Results Timeline */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">След 90 дни:</h3>

          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-24 ${
                  item.highlight ? 'text-primary-400 font-bold text-xl' : 'text-neutral-400 font-semibold'
                }`}>
                  {item.day}
                </div>
                <ArrowRight className="w-6 h-6 text-neutral-600 flex-shrink-0 mt-1" />
                <div className={`flex-1 ${
                  item.highlight ? 'text-white font-semibold text-lg' : 'text-neutral-300'
                }`}>
                  {item.result}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-neutral-400">
              Средно резултати: +2.4 до 3.8 кг чиста мускулна маса
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Само ако следваш системата
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
