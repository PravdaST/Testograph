import React from 'react';
import { TrendingDown, Battery, Clock, Heart } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Problem() {
  const problems = [
    {
      icon: TrendingDown,
      text: 'Силата не мърда'
    },
    {
      icon: Battery,
      text: 'Енергията пада'
    },
    {
      icon: Clock,
      text: 'Възстановяването е бавно'
    },
    {
      icon: Heart,
      text: 'Либидото не е като преди'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-100">
      <Container>
        <SectionHeader
          headline="Тренираш редовно. Ядеш добре. Но резултатите липсват."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-lg font-semibold text-neutral-900">{problem.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto text-center space-y-4">
          <p className="text-lg text-neutral-700">
            Опитвал си креатин, протеин, "тесто бустери".
            Резултат: нищо.
          </p>
          <p className="text-xl font-semibold text-neutral-900">
            Не е виновно усилието ти.
          </p>
          <p className="text-2xl font-bold text-neutral-900">
            Проблемът е че имаш само 20% от формулата.
          </p>
          <p className="text-xl text-primary-700 font-semibold">
            А без 100% - няма как да успееш.
          </p>
        </div>
      </Container>
    </section>
  );
}
