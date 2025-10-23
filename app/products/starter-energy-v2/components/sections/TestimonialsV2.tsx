import React from 'react';
import { Star, User, MapPin, Quote } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function TestimonialsV2() {
  const testimonials = [
    {
      name: 'Георги',
      age: 27,
      city: 'София',
      quote: 'Плато 4 месеца. Лежанка не минаваше 100кг. Всеки тренировъчен ден се питах дали си губя времето. След 6 седмици с TESTOGRAPH: 112кг лежанка. Протоколите ми показаха точно какво правя грешно с тренировките и храната.',
      data: 'Лежанка: 100кг → 112кг'
    },
    {
      name: 'Мартин',
      age: 38,
      city: 'Пловдив',
      quote: '38 години. Чувствах се на 50. Всяка сутрин ставах уморен. Имах енергия за 4 часа работа, после - мъртъв. След 2 месеца с Testograph: Спя като на 25. Енергия ЦЯЛИЙ ден. Жена ми забеляза разликата... в спалнята. Не е само тестостерон. Цялата система работи.',
      data: 'Енергия: 5/10 → 9/10'
    },
    {
      name: 'Иван',
      age: 24,
      city: 'Варна',
      quote: 'Мислех че съм "hard gainer". Опитвах се 2 години да качвам маса. Хапчето само не ми помогна. Testograph ми даде цялата картина: Ядох много малко, тренировах без план, спях 5-6 часа. За 3 месеца: +3.2кг мускулна маса. Първи път виждам ABS.',
      data: 'Тегло: 72кг → 75.2кг (+3.2кг мускули)'
    },
    {
      name: 'Николай',
      age: 31,
      city: 'София',
      quote: 'Купувах "тесто бустери" от iHerb. Харчех 150 лв на месец. Нищо не се промени. С Testograph разбрах ЗАЩО: Вземах ги грешно (timing). Тренировъчната ми програма беше глупост. Ядох твърде малко протеин. Сега имам система. Всичко е на място. Резултатите са ясни.',
      data: 'От 150 лв/месец → 67 лв с резултати'
    },
    {
      name: 'Стоян',
      age: 42,
      city: 'Бургас',
      quote: 'След 35 мъжките хормони падат естествено. Аз съм на 42. Лекарят каза "нормално е за възрастта". Не се съгласих да приема това като неизбежно. Системата ми показа как да оптимизирам всичко - храна, сън, стрес, тренировки. 3 месеца по-късно: Либидо като на 25. Качвам тежести като преди 10 години. Съм по-добър баща защото имам енергия.',
      data: 'Либидо & Сила: Като на 25 години'
    },
    {
      name: 'Кристиан',
      age: 22,
      city: 'София',
      quote: 'Студент съм. Нямам пари за фитнес треньор (200 лв) + нутриционист (150 лв) + добавки (100 лв). Това е всичко в едно за 67 лв. Първи път имам ПЛАН. Знам какво правя. Не гадая. Чек-инът ми показва дали напредвам. 2 месеца: +8кг клек, +15% енергия, по-добър сън от 6/10 на 9/10.',
      data: '+8кг клек, сън 6/10 → 9/10'
    },
    {
      name: 'Димитър',
      age: 29,
      city: 'Пловдив',
      quote: 'Работя нощни смени. Хормоните ми бяха в пода. Не можех да спя добре. Нямах либидо. На 29 се чувствах като на 50. Протоколът за сън ми помогна най-много. Добавката също, но СИСТЕМАТА промени играта. Сега: Спя 7-8 часа качествено. Сутрешна ерекция всеки ден. Енергия за зала след смяна.',
      data: 'Сън: 7-8ч качествен, пълно възстановяване'
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-purple-500/5">
      <AnimatedBackground variant="circles" opacity={0.08} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-current" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">5⭐ Отзиви</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-purple-500" via="via-pink-500" to="to-blue-500">
                КАКВО КАЗВАТ ПОТРЕБИТЕЛИТЕ
              </GradientText>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Реални хора, реални резултати
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <GlassCard key={index} className="group p-8 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-12 h-12 text-primary/30" />
                </div>

                {/* Quote Text */}
                <div className="flex-1 mb-6">
                  <p className="text-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Data/Stats */}
                <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/10">
                  <p className="text-sm font-bold text-primary text-center">
                    📊 {testimonial.data}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">
                        {testimonial.name}, {testimonial.age} год.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{testimonial.city}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              Присъедини се към <GradientText>127 мъже</GradientText> които вече виждат резултати
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
