"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, TrendingUp, Award, Users, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";

interface DetailedTestimonial {
  id: number;
  name: string;
  age: number;
  location: string;
  avatarImage: string;
  problem: string;
  category: "libido" | "energy" | "muscle" | "fertility" | "confidence";
  badge: string;
  accentColor: string;
  keyQuote?: string;
  story: {
    problem: string;
    solution: string;
    transformation: string;
  };
  metrics?: {
    label: string;
    before: string;
    after: string;
  }[];
}

interface DetailedTestimonialCardsProps {
  angle?: "libido" | "energy" | "muscle" | "fertility" | "all";
  limit?: number;
}

const testimonials: DetailedTestimonial[] = [
  {
    id: 1,
    name: "Кирил Д.",
    age: 37,
    location: "София",
    avatarImage: "/funnel/georgi-avatar.jpg",
    problem: "Загубено желание",
    category: "libido",
    badge: "След 4 седмици",
    accentColor: "from-violet-500 to-purple-600",
    keyQuote: "Моят Кирил се върна. TestoUP спаси брака ми.",
    story: {
      problem: "2 години гледам жена си и нищо. Нула желание. Тя пита 'Има ли друга?'. Боли. Опитах витамини, магнезий, зала. Нищо. Докторът: 'Нормално за 37'. Не бе нормално.",
      solution: "Попаднах на TestoUP във Facebook група. Последен опит. Седмица 1 и 2 - нищо. Седмица 3... жена ми излезе от банята и усетих го. Онова чувство което липсваше. Върна се.",
      transformation: "Сега сме като на 25. Тя ми каза 'Моят Кирил се върна'. Заплаках. TestoUP спаси брака ми."
    },
    metrics: [
      { label: "Интимност седмично", before: "0-1", after: "4-5" },
      { label: "Желание", before: "2/10", after: "9/10" },
      { label: "Увереност", before: "Загубена", after: "Върната" }
    ]
  },
  {
    id: 2,
    name: "Стоян М.",
    age: 41,
    location: "Пловдив",
    avatarImage: "/funnel/martin-avatar.jpg",
    problem: "Проблеми с ерекцията",
    category: "libido",
    badge: "След 5 седмици",
    accentColor: "from-rose-500 to-pink-600",
    keyQuote: "Първи път от година без anxiety. Без страх. Работи.",
    story: {
      problem: "8 месеца. Всеки път страх. 'Ще работи ли?'. Не работеше. Тя се правеше че е ок. Не беше. Започнах да избягвам близост. По-добре никакъв секс, отколкото провал. Докторът предложи Виагра. 42 съм, не 70.",
      solution: "Прочетох за TestoUP в Telegram група. Хормоналната база трябва да е ок за всичко. Първите 3 седмици - малко по-добра енергия. Седмица 4 - усетих промяна. Седмица 5 - без anxiety. Без таблетка. Просто... работеше.",
      transformation: "Миналата седмица 3 пъти. БЕЗ проблем. Тя ми каза 'Върна си се'. Усмихна се. Аз се усмихнах. Първи път от година се усмихвам преди секс. Не след провал."
    },
    metrics: [
      { label: "Успешни опити", before: "2-3/10", after: "9/10" },
      { label: "Performance anxiety", before: "Постоянна", after: "Почти няма" },
      { label: "Увереност", before: "1/10", after: "8/10" }
    ]
  },
  {
    id: 3,
    name: "Димитър К.",
    age: 39,
    location: "Варна",
    avatarImage: "/funnel/dimitar-avatar.jpg",
    problem: "Загубена атракция",
    category: "libido",
    badge: "След 6 седмици",
    accentColor: "from-indigo-500 to-purple-600",
    keyQuote: "Гледам я и УСЕЩАМ нещо. Отново. След 3 години.",
    story: {
      problem: "Обичам жена си. Но... не я ЖЕЛАЯ. Гледам я и нищо. Гледам случайна жена на улицата и нищо. Проблемът не е тя. Проблемът съм аз. Започнах да мисля че съм асексуален или нещо. 39 години, не 70.",
      solution: "Видях TestoUP в една група. Хормоните контролират желанието. Опитвам. Седмица 3-4 - започнах да забелязвам жени отново. Седмица 6 - жена ми излезе от банята и усетих ЖЕЛАНИЕ. Първи път от 3 години.",
      transformation: "Миналата седмица правих секс и ИСКАХ го. Не 'трябва да го направя'. ИСКАХ го. Тя усети разликата. Каза ми 'това е различно'. Беше различно. Бях различен."
    },
    metrics: [
      { label: "Спонтанно желание", before: "Никога", after: "3-4 пъти седмично" },
      { label: "Атракция към партньор", before: "0/10", after: "8/10" },
      { label: "Качество на секс", before: "Механично", after: "С желание" }
    ]
  },
  {
    id: 4,
    name: "Васил Т.",
    age: 35,
    location: "Бургас",
    avatarImage: "/funnel/ivan-avatar.jpg",
    problem: "Стрес във връзката",
    category: "libido",
    badge: "След 7 седмици",
    accentColor: "from-amber-500 to-orange-600",
    keyQuote: "Спряхме да се карам. Започнахме да правим секс. Просто.",
    story: {
      problem: "Караме се ПОСТОЯННО. 'Не ме докосваш'. 'Не ми обръщаш внимание'. 'Какво стана с нас?'. Нямах отговор. Нямах желание. Нямах енергия. Работех, идвах вкъщи, гледах телефона, спях. Тя плачеше. Аз мълчах.",
      solution: "Тя ми каза 'или нещо променяш или свършва'. Паникьосах. Видях TestoUP в реклама. Опитах. Седмица 4 - повече енергия. Седмица 6 - забелязах я. Седмица 7 - докоснах я. Тя се изненада. В добър смисъл.",
      transformation: "Миналия месец - 6 пъти секс. Не се караме. Говорим. Смеем се. Тя каза 'това исках. Просто това'. Не ме напускаше. Връзката се върна."
    },
    metrics: [
      { label: "Интимност месечно", before: "0-1", after: "5-6" },
      { label: "Кавги седмично", before: "4-5", after: "0-1" },
      { label: "Емоционална близост", before: "1/10", after: "8/10" }
    ]
  },
  // Additional testimonials for other angles
  {
    id: 5,
    name: "Пламен В.",
    age: 43,
    location: "Пловдив",
    avatarImage: "/funnel/petar-avatar.jpg",
    problem: "Енергия и продуктивност",
    category: "energy",
    badge: "След 3 седмици",
    accentColor: "from-orange-500 to-red-600",
    keyQuote: "От 3 кафета до енергия на 25. За 3 седмици.",
    story: {
      problem: "Будя се в 7 изтощен. 3 кафета до 10. Заспивам на бюрото. Вкъщи - зомби. Детето ми пита 'Тате защо винаги си уморен?'. Боли. Опитах всичко - D, B12, желязо, щитовидна, черен дроб. Всичко 'нормално'. Терапевтът каза 'отпуснете се'. Как бе?",
      solution: "Колега говореше за TestoUP. 'Тестостеронът влияе на всичко, не само мускулите'. Пробвам. Ден 14 - не заспах на бюрото. Ден 18 - ставам в 6 без будилник, пълен с енергия. Ден 21 - шефът каза 'Какво стана с теб? Като друг човек си'.",
      transformation: "Сега тичам с децата след работа. Довършвам проекти вечер. Жена ми каза 'Това е мъжът в когото се влюбих'. TestoUP не ми даде енергия. Върна ми живота."
    },
    metrics: [
      { label: "Кафета дневно", before: "4-5", after: "1-2" },
      { label: "Енергия", before: "3/10", after: "9/10" },
      { label: "Продуктивност", before: "50%", after: "120%" }
    ]
  },
  {
    id: 6,
    name: "Георги С.",
    age: 30,
    location: "Варна",
    avatarImage: "/funnel/avatar-extra1.jpg",
    problem: "Мускули и сила",
    category: "muscle",
    badge: "След 10 седмици",
    accentColor: "from-blue-500 to-cyan-600",
    keyQuote: "+8кг чиста маса. Спукан плато от 2 години.",
    story: {
      problem: "Тренирам от 5 години. Последните 2 - на плато. 75кг на 178см. Вдигам 80кг bench от 2 години. Мускулите не растат. 'Яж повече', 'спи повече', 'смени програмата'. Опитах. Протеин, калории, 3 програми, креатин, BCAA, ZMA. Нищо. Генетиката ми ли е това?",
      solution: "Треньорът спомена TestoUP. 'Може да е хормонално, не тренировъчно'. Видях Тонгкат Али вътре. Пробвам. Седмица 4 - вдигам 85кг. Първото увеличение от 2 години! Седмица 7 - възстановяването 2 пъти по-бързо. Седмица 10 - 95кг bench. Кантарът - 83кг. +8кг чиста мускулна маса.",
      transformation: "Хората в залата питат 'Какво взе?'. Треньорът каза 'Най-бързият прогрес при натурален атлет'. Спуках платото. Следваща цел - 90кг при 10% мазнини. Ще го направя."
    },
    metrics: [
      { label: "Телесно тегло", before: "75 кг", after: "83 кг" },
      { label: "Bench Press", before: "80 кг", after: "95 кг" },
      { label: "Възстановяване", before: "3 дни", after: "1.5 дни" }
    ]
  },
  {
    id: 7,
    name: "Атанас Й.",
    age: 38,
    location: "Бургас",
    avatarImage: "/funnel/avatar-extra2.jpg",
    problem: "Фертилност и семейство",
    category: "fertility",
    badge: "След 5 месеца",
    accentColor: "from-green-500 to-emerald-600",
    keyQuote: "От 30% на 65% подвижност. Жена ми е бременна.",
    story: {
      problem: "3 години опити за бебе. Нищо. Тя е здрава. Аз - спермограма. Ниска подвижност. Малко брой. Докторът: 'Трудно ще стане естествено'. Чувствах се провален. Опитах всичко - folate, E, селен, L-carnitine. Още една спермограма след 6 месеца - без промяна. IVF? 15,000 лева. Без гаранция.",
      solution: "Прочетох че тестостеронът влияе на сперматогенезата. Намерих TestoUP. Последен опит преди IVF. Месец 3 - повече енергия, либидо. Не знаех дали работи. Месец 5 - нова спермограма. Подвижност от 30% на 65%. Брой удвоен. Докторът: 'Какво направи? Драматична промяна'.",
      transformation: "Месец 6: Жена ми е бременна. Плакахме 20 минути. След 3 години. TestoUP не просто подобри спермограмата ми. Даде ни шанс за семейство. Чакаме малко момче. Това е чудо."
    },
    metrics: [
      { label: "Подвижност", before: "30%", after: "65%" },
      { label: "Брой (млн/ml)", before: "12", after: "28" },
      { label: "Бременност", before: "❌ 3г", after: "✅ Успешна" }
    ]
  },
  {
    id: 8,
    name: "Валентин Н.",
    age: 44,
    location: "Русе",
    avatarImage: "/funnel/emil-avatar.jpg",
    problem: "Увереност и тяло",
    category: "confidence",
    badge: "След 6 седмици",
    accentColor: "from-slate-500 to-zinc-600",
    keyQuote: "Харесах отражението си за първи път от 5 години.",
    story: {
      problem: "Гледам снимки от преди 5 години. Не познавам човека. Избягвам огледалото. Корем. Слаби ръце. Загубих се някъде. Опитах диети, зала. 3кг долу, 4кг горе. Мазнините на корема. Мускулите не растат. 'Остарях. Това е нормалното за 44'.",
      solution: "Приятел изпрати линк към TestoUP. 'Бате, хормоните ти са на дъното'. Чета за кортизол, тестостерон, естроген. Осъзнавам - не съм мързелив. Тялото ми не работи. Пробвам. Седмица 2 - по-добър сън. Седмица 4 - 'отслабна ли?'. Кантарът същото, но талията 3см по-малка. Седмица 6 - качвам снимка. 12 души питат 'какво направи?'.",
      transformation: "Минах покрай витрина вчера. Спрях се. Погледнах отражението си. За първи път от 5 години... харесах го. Не съм перфектен. Но съм на път. И най-важното - чувствам се като МЪЖ отново."
    },
    metrics: [
      { label: "Талия", before: "98 см", after: "89 см" },
      { label: "Мускулна маса", before: "↓ намаляваща", after: "↑ растяща" },
      { label: "Самочувствие", before: "3/10", after: "8/10" }
    ]
  }
];

export function DetailedTestimonialCards({
  angle = "all",
  limit
}: DetailedTestimonialCardsProps = {}) {
  // Filter testimonials by angle
  const filteredTestimonials = testimonials
    .filter(t => angle === "all" || t.category === angle)
    .slice(0, limit);

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Award className="w-4 h-4 mr-2" />
            Реални Истории
          </Badge>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="outline" className="bg-background">
              <Users className="w-3 h-3 mr-1.5 text-primary" />
              <span className="text-xs font-semibold">800+ мъже</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Shield className="w-3 h-3 mr-1.5 text-green-600" />
              <span className="text-xs font-semibold">Лекарска валидация</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <TrendingUp className="w-3 h-3 mr-1.5 text-blue-600" />
              <span className="text-xs font-semibold">94% успеваемост</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <CheckCircle className="w-3 h-3 mr-1.5 text-emerald-600" />
              <span className="text-xs font-semibold">Верифицирани истории</span>
            </Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Как Те Го Направиха
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Проблем → Решение → Резултат. Без филтри. Без драма.
          </p>
        </div>

        {/* Testimonial Cards - 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial, idx) => (
            <Card
              key={testimonial.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Simplified Header - No Gradient */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                      <Image
                        src={testimonial.avatarImage}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {testimonial.name}, {testimonial.age}г
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Верифицирана
                  </Badge>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {testimonial.badge}
                </Badge>
              </div>

              {/* Key Quote - Primary Focus */}
              {testimonial.keyQuote && (
                <div className="p-4 bg-primary/5 border-l-4 border-primary">
                  <Quote className="w-5 h-5 text-primary/40 mb-2" />
                  <p className="text-base font-bold leading-relaxed">
                    "{testimonial.keyQuote}"
                  </p>
                </div>
              )}

              {/* Story Content - Compressed */}
              <div className="p-4 space-y-3 flex-1">
                {/* Problem - Collapsed */}
                <div>
                  <h4 className="text-xs font-bold mb-1 text-muted-foreground uppercase">Проблем</h4>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{testimonial.story.problem}</p>
                </div>
                {/* Result */}
                <div>
                  <h4 className="text-xs font-bold mb-1 text-muted-foreground uppercase">Резултат</h4>
                  <p className="text-sm font-medium">{testimonial.story.transformation}</p>
                </div>
              </div>

              {/* Metrics - Compact Vertical */}
              {testimonial.metrics && (
                <div className="p-4 border-t bg-muted/20">
                  <h4 className="text-xs font-bold mb-3 text-muted-foreground uppercase">Измервания</h4>
                  {testimonial.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">{metric.label}:</span>
                      <span>
                        <span className="text-red-500">{metric.before}</span>
                        {" → "}
                        <span className="text-green-600 font-bold">{metric.after}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-10 p-6 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Реални истории. Реални резултати. Имената са променени за поверителност.
            <br />
            <span className="font-semibold text-foreground">Твоите резултати може да са различни.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
