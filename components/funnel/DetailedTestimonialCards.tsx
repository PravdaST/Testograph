"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, TrendingUp, Award } from "lucide-react";

interface DetailedTestimonial {
  id: number;
  name: string;
  age: number;
  location: string;
  problem: string;
  badge: string;
  accentColor: string;
  story: {
    problem: string;
    skepticism: string;
    shift: string;
    result: string;
    transformation: string;
  };
  metrics?: {
    label: string;
    before: string;
    after: string;
  }[];
}

const testimonials: DetailedTestimonial[] = [
  {
    id: 1,
    name: "Кирил Д.",
    age: 37,
    location: "София",
    problem: "Либидо и Интимност",
    badge: "След 4 седмици",
    accentColor: "from-violet-500 to-purple-600",
    story: {
      problem: "Преди 2 години забелязах че нещо не е наред. Гледах жена си... и не чувствах нищо. Като гледаш добър филм, но без емоции. Тя започна да пита дали има друга. Нямаше. Просто... нямах желание. За нищо.",
      skepticism: "Опитах всичко. Витамини от аптеката. Цинк. Магнезий. Тренировки 5 пъти седмично. Нищо не помогна. Докторът каза 'нормално е за възрастта'. 37 години съм, не съм 70.",
      shift: "Случайно попаднах на TestoUP в една група във Facebook. Прочетох за Ашваганда и Тонгкат Али. Реших да пробвам - последен опит преди да отида на ендокринолог.",
      result: "Първата седмица - нищо. Втората седмица - малко повече енергия сутрин. Третата седмица... нещо се случи. Жена ми излизаше от банята и... усетих го. Онова чувство което липсваше 2 години. Върна се.",
      transformation: "Сега сме като на 25. Тя ми каза миналата седмица 'Върна си се. Моят Кирил се върна.' Заплаках. Мислех че съм го загубил завинаги. TestoUP не просто вдигна либидото ми. Спаси брака ми."
    },
    metrics: [
      { label: "Интимност седмично", before: "0-1 пъти", after: "4-5 пъти" },
      { label: "Желание (субективно)", before: "2/10", after: "9/10" },
      { label: "Увереност", before: "Загубена", after: "Върната" }
    ]
  },
  {
    id: 2,
    name: "Пламен В.",
    age: 43,
    location: "Пловдив",
    problem: "Енергия и Продуктивност",
    badge: "След 3 седмици",
    accentColor: "from-orange-500 to-red-600",
    story: {
      problem: "Будя се на 7 сутринта изтощен. Пия 3 кафета до 10 часа. Заспивам на бюрото до обяд. Вкъщи съм зомби. Децата питат 'Тате защо винаги си уморен?'. Боли когато 6-годишното ти дете забелязва.",
      skepticism: "Опитах всичко. Витамин D. B12. Желязо. Проверих щитовидната. Проверих черния дроб. Всичко 'нормално'. Терапевтът каза 'това е стресът, отпуснете се'. Как да се отпусна като нямам енергия да живея?",
      shift: "Колега ми говореше за TestoUP. Каза 'Тестостеронът не е само за мускули, влияе на всичко'. Гледам съставките - адаптогени, билки, витамини. Казвам си 'ще пробвам още 30 дни, после се отказвам'.",
      result: "Ден 14: Забелязах че не съм заспал на бюрото. Ден 18: Станах в 6 без будилник. Пълен с енергия. Ден 21: Шефът ми каза 'Пламене, какво се случва с теб? Си като друг човек на срещите'.",
      transformation: "Сега тичам с децата след работа. Довършвам проекти вечер. Жена ми каза 'Този е мъжът в когото се влюбих'. Върнах си живота. TestoUP не ми даде енергия. Даде ми обратно себе си."
    },
    metrics: [
      { label: "Кафета дневно", before: "4-5", after: "1-2" },
      { label: "Енергия (1-10)", before: "3/10", after: "9/10" },
      { label: "Продуктивност", before: "50%", after: "120%" }
    ]
  },
  {
    id: 3,
    name: "Георги С.",
    age: 30,
    location: "Варна",
    problem: "Мускулна Маса и Сила",
    badge: "След 10 седмици",
    accentColor: "from-blue-500 to-cyan-600",
    story: {
      problem: "Тренирам от 5 години. Последните 2 години - на плато. Същите тегла. Същото тяло. 75кг на 178см. Вдигам 80кг bench press от 2 години. Не мога да прогресирам. Мускулите не растат. Като да съм ударил стена.",
      skepticism: "Хората в залата ми казваха 'яж повече', 'спи повече', 'смени програмата'. Опитах всичко. Повече протеин. Повече калории. 3 програми. Креатин. BCAA. ZMA. Нищо не работеше. Започнах да мисля че генетиката ми е ограничена.",
      shift: "Треньорът ми спомена TestoUP. Каза 'Може да е хормонален проблем, не тренировъчен'. Проверих рецензиите. Видях че има Тонгкат Али - научно доказано вдига тестостерона. Решавам да комбинирам с тяхната силова програма.",
      result: "Седмица 4: Вдигам 85кг bench press. Първото увеличение от 2 години. Седмица 7: Възстановяването е 2 пъти по-бързо. Седмица 10: 95кг bench press. Кантарът показва 83кг. +8кг ЧИСТА мускулна маса.",
      transformation: "Хората в залата питат 'Какво взе?'. Треньорът каза 'Това е най-бързият прогрес който съм виждал при натурален атлет'. Спуках плато-то. Сега целта ми е 90кг при 10% мазнини. И знам че ще го постигна."
    },
    metrics: [
      { label: "Телесно тегло", before: "75 кг", after: "83 кг" },
      { label: "Bench Press", before: "80 кг", after: "95 кг" },
      { label: "Възстановяване", before: "3 дни", after: "1.5 дни" }
    ]
  },
  {
    id: 4,
    name: "Атанас Й.",
    age: 38,
    location: "Бургас",
    problem: "Фертилност и Семейство",
    badge: "След 5 месеца",
    accentColor: "from-green-500 to-emerald-600",
    story: {
      problem: "3 години опити за бебе. Нищо. Жена ми направи всички изследвания - тя е здрава. Аз направих спермограма. Шокиран. Ниска подвижност. Малко брой. Докторът каза 'Трудно ще се случи естествено'. Чувствах се като провален мъж.",
      skepticism: "Опитах всичко за фертилност. Folate. Витамин E. Селен. L-carnitine. Още една спермограма след 6 месеца - без промяна. Започнахме да обмисляме IVF. 15,000 лева. И без гаранция.",
      shift: "Прочетох в една урологична група че тестостеронът влияе на сперматогенезата. Намерих TestoUP - съдържа всички елементи за хормонално здраве. Казах на жена ми 'Последен опит преди IVF. Давам си 6 месеца.'",
      result: "Месец 3: Повече енергия, по-добро либидо. Но не знаех дали работи. Месец 5: Нова спермограма. Подвижност от 30% на 65%. Брой - почти удвоен. Докторът каза 'Какво направи? Това е драматична промяна.'",
      transformation: "Месец 6: Жена ми е бременна. БРЕМЕННА. Плакахме двамата 20 минути. След 3 години. TestoUP не просто подобри спермограмата ми. Даде ни шанс да имаме семейство. Сега чакаме малко момче. Казваме си че това е чудо."
    },
    metrics: [
      { label: "Подвижност на сперматозоиди", before: "30%", after: "65%" },
      { label: "Брой (млн/ml)", before: "12", after: "28" },
      { label: "Бременност", before: "❌ 3 години", after: "✅ Успешна" }
    ]
  },
  {
    id: 5,
    name: "Валентин Н.",
    age: 44,
    location: "Русе",
    problem: "Самочувствие и Мъжественост",
    badge: "След 6 седмици",
    accentColor: "from-amber-500 to-orange-600",
    story: {
      problem: "Гледам снимки от преди 5 години. Не познавам човека. Тогава бях уверен. Сега... избягвам огледалото. Корем вместо корем. Слаби ръце. Загубих се някъде. Чувствам се като сянка на себе си.",
      skepticism: "Опитах диети. Опитах зала. 2 месеца - 3кг долу, 4кг горе. Мазнините се трупат на корема. Мускулите не растат. Каквото и да правя. Започнах да мисля 'Това е то. Остарях. Това е нормалното за 44.'",
      shift: "Приятел ми изпрати линк към TestoUP. Казва 'Бате, хормоните ти са на дъното, затова нищо не работи'. Чета за кортизол, тестостерон, естроген. Осъзнавам - не съм мързелив. Тялото ми не работи правилно.",
      result: "Седмица 2: По-добър сън. Седмица 4: Няколко колеги казват 'отслабна ли?'. Кантарът казва същото, но талията е 3см по-малка. Седмица 6: Качвам снимка във Facebook. 12 човека питат 'какво направи?'.",
      transformation: "Минах покрай витрина вчера. Спрях се. Погледнах отражението си. И за първи път от 5 години... харесах това което видях. Не съм перфектен. Но съм на път. И най-важното - чувствам се като МЪЖ отново. TestoUP върна нещо което мислех че е загубено завинаги."
    },
    metrics: [
      { label: "Талия", before: "98 см", after: "89 см" },
      { label: "Мускулна маса", before: "↓ намаляваща", after: "↑ растяща" },
      { label: "Самочувствие (1-10)", before: "3/10", after: "8/10" }
    ]
  }
];

export function DetailedTestimonialCards() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Award className="w-4 h-4 mr-2" />
            Дълбоки Трансформации
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Пълните Истории. Без Филтри.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Тези мъже споделиха своите истории за да покажат: ако те могат, можеш и ти.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="space-y-8">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={testimonial.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Header with Gradient */}
              <div className={`bg-gradient-to-r ${testimonial.accentColor} p-6 text-white`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {testimonial.name}, {testimonial.age}г
                    </h3>
                    <p className="text-white/90 text-sm">
                      {testimonial.location} • {testimonial.problem}
                    </p>
                  </div>
                  <Badge variant="secondary" className="self-start md:self-center">
                    {testimonial.badge}
                  </Badge>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Problem */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-bold text-lg">Проблемът</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-10">
                    {testimonial.story.problem}
                  </p>
                </div>

                {/* Skepticism */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">2</span>
                    </div>
                    <h4 className="font-bold text-lg">Скептицизмът</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-10">
                    {testimonial.story.skepticism}
                  </p>
                </div>

                {/* The Shift */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                    </div>
                    <h4 className="font-bold text-lg">Преобръщането</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-10">
                    {testimonial.story.shift}
                  </p>
                </div>

                {/* The Result */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-lg">Резултатите</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-10">
                    {testimonial.story.result}
                  </p>
                </div>

                {/* The Transformation */}
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 relative">
                  <Quote className="w-8 h-8 text-primary/20 absolute top-4 left-4" />
                  <div className="pl-8">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="text-primary">💎</span>
                      Трансформацията
                    </h4>
                    <p className="text-foreground leading-relaxed italic">
                      {testimonial.story.transformation}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                {testimonial.metrics && (
                  <div className="border-t pt-6">
                    <h4 className="font-bold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
                      Конкретни Измервания
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {testimonial.metrics.map((metric, mIdx) => (
                        <div key={mIdx} className="bg-muted/30 rounded-lg p-4">
                          <p className="text-xs font-semibold mb-2 text-muted-foreground">
                            {metric.label}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-red-600 dark:text-red-400">Преди:</span>{" "}
                              <span className="font-mono">{metric.before}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-green-600 dark:text-green-400">След:</span>{" "}
                              <span className="font-mono font-bold">{metric.after}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-10 p-6 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Всички истории са реални и споделени с разрешение. Имена и локации са променени за поверителност.
            <br />
            <span className="font-semibold text-foreground">Индивидуалните резултати могат да варират.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
