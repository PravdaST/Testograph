import React from 'react';
import { Star, User, TrendingUp } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Георги',
      age: 27,
      city: 'София',
      quote: 'Плато 4 месеца. Лежанка не минаваше 100кг. След 6 седмици с TESTOGRAPH: 112кг лежанка. Протоколите ми показаха точно какво правя грешно.',
      stat: 'Лежанка: 100kg → 112kg'
    },
    {
      name: 'Мартин',
      age: 38,
      city: 'Пловдив',
      quote: '38 години. Чувствах се на 50. Всяка сутрин ставах уморен. След 2 месеца с Testograph: Спя като на 25. Енергия ЦЯЛИЙ ден. Жена ми забеляза разликата... в спалнята.',
      stat: 'Енергия: 5/10 → 9/10'
    },
    {
      name: 'Иван',
      age: 24,
      city: 'Варна',
      quote: 'Мислех че съм "hard gainer". Опитвах се 2 години да качвам маса. За 3 месеца: +3.2кг мускулна маса. Първи път виждам ABS.',
      stat: '+3.2кг мускулна маса'
    },
    {
      name: 'Николай',
      age: 31,
      city: 'София',
      quote: 'Купувах "тесто бустери" от iHerb. Харчех 150 лв на месец. Нищо не се промени. С Testograph разбрах ЗАЩО: Вземах ги грешно, програмата беше глупост, ядох твърде малко протеин.',
      stat: 'Спестяване: 150 лв/месец'
    },
    {
      name: 'Стоян',
      age: 42,
      city: 'Бургас',
      quote: 'След 35 мъжките хормони падат. Лекарят каза "нормално е за възрастта". Bullshit. 3 месеца: Либидо като на 25. Качвам тежести като преди 10 години.',
      stat: 'Либидо възстановено'
    },
    {
      name: 'Кристиан',
      age: 22,
      city: 'София',
      quote: 'Студент съм. Нямам пари за треньор (200 лв) + нутриционист (150 лв). Това е всичко в едно за 67 лв. 2 месеца: +8кг клек, +15% енергия, по-добър сън от 6/10 на 9/10.',
      stat: '+8kg клек, сън 6→9/10'
    },
    {
      name: 'Димитър',
      age: 29,
      city: 'Пловдив',
      quote: 'Работя нощни смени. Хормоните ми бяха в пода. Не можех да спя добре. Протоколът за сън ми помогна най-много. Сега: Спя 7-8 часа качествено. Сутрешна ерекция всеки ден.',
      stat: 'Сън: 5h → 8h качествен'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <Container>
        <SectionHeader
          headline="КАКВО КАЗВАТ ПОТРЕБИТЕЛИТЕ"
          description="127 потребители следват системата. 94% казват 'работи'."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-neutral-700 mb-4 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Stat */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{testimonial.stat}</span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-neutral-500" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">
                    {testimonial.name}, {testimonial.age} год.
                  </div>
                  <div className="text-sm text-neutral-600">{testimonial.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
