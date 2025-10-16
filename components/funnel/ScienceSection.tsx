"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Beaker, TrendingUp, Shield, Zap, Heart } from "lucide-react";

interface ResearchData {
  id: number;
  ingredient: string;
  dosage: string;
  icon: React.ReactNode;
  scientificName: string;
  researchFindings: string[];
  clinicalDose: string;
  ourDose: string;
  studies: string;
  keyBenefit: string;
  gradient: string;
}

const researchData: ResearchData[] = [
  {
    id: 1,
    ingredient: "Ашваганда",
    dosage: "400mg",
    icon: <TrendingUp className="w-6 h-6" />,
    scientificName: "Withania somnifera",
    researchFindings: [
      "Повишава тестостерон с 15-17% за 8 седмици",
      "Намалява кортизол (стрес хормон) с до 28%",
      "Подобрява качество на сперма с 167%",
      "Увеличава мускулна маса и сила при спортуващи"
    ],
    clinicalDose: "300-600mg дневно",
    ourDose: "400mg (оптимална клинична доза)",
    studies: "43+ клинични изследвания",
    keyBenefit: "Адаптоген #1 за тестостерон и стрес",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: 2,
    ingredient: "Витамин D3",
    dosage: "2400 IU",
    icon: <Zap className="w-6 h-6" />,
    scientificName: "Холекалциферол",
    researchFindings: [
      "Дефицитът (<30 ng/ml) корелира с 30% по-нисък тестостерон",
      "Добавяне на D3 повишава тестостерон с 20-25%",
      "Критичен за здраве на костите и имунитет",
      "90% от българите имат дефицит през зимата"
    ],
    clinicalDose: "2000-4000 IU дневно",
    ourDose: "2400 IU (оптимална превантивна доза)",
    studies: "100+ клинични изследвания",
    keyBenefit: "Хормонален фундамент",
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    id: 3,
    ingredient: "Цинк",
    dosage: "15mg",
    icon: <Shield className="w-6 h-6" />,
    scientificName: "Цинков цитрат",
    researchFindings: [
      "Есенциален минерал за синтез на тестостерон",
      "Дефицитът води до 40-50% спад в тестостерон",
      "Подобрява подвижност и морфология на сперма",
      "Подкрепя имунна функция и зарастване на рани"
    ],
    clinicalDose: "11-15mg дневно",
    ourDose: "15mg елементарен цинк (150% РДА)",
    studies: "80+ клинични изследвания",
    keyBenefit: "Критичен за мъжко репродуктивно здраве",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    id: 4,
    ingredient: "Селен",
    dosage: "200mcg",
    icon: <Heart className="w-6 h-6" />,
    scientificName: "L-селенометионин",
    researchFindings: [
      "Критичен за подвижност на сперматозоидите",
      "Антиоксидант - защитава от оксидативен стрес",
      "Подобрява морфология на сперма",
      "Подкрепа за тироидна функция"
    ],
    clinicalDose: "55-200mcg дневно",
    ourDose: "200mcg (364% РДА - терапевтична доза)",
    studies: "50+ клинични изследвания",
    keyBenefit: "Фертилност и антиоксидантна защита",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    id: 5,
    ingredient: "Витамин B12",
    dosage: "600mcg",
    icon: <Zap className="w-6 h-6" />,
    scientificName: "Цианокобаламин",
    researchFindings: [
      "Критичен за производство на енергия",
      "Подкрепя нервна система и когнитивна функция",
      "Необходим за производство на червени кръвни клетки",
      "Дефицитът причинява хронична умора"
    ],
    clinicalDose: "2.4-100mcg дневно",
    ourDose: "600mcg (24000% РДА - мега доза за енергия)",
    studies: "200+ клинични изследвания",
    keyBenefit: "Експлозивна енергия и възстановяване",
    gradient: "from-red-500 to-orange-600"
  }
];

export function ScienceSection() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Beaker className="w-4 h-4 mr-2" />
            Научна Валидация
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Науката Зад TestoUP
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Всяка съставка е подбрана на база <strong>клинични изследвания</strong>.
            Всяка дозировка е <strong>оптимизирана</strong> за максимален ефект.
          </p>
        </div>

        {/* Research Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {researchData.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${item.gradient} p-6 text-white`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    {item.icon}
                  </div>
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {item.dosage}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">{item.ingredient}</h3>
                <p className="text-sm opacity-90 italic">{item.scientificName}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Key Benefit */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-bold text-center">
                    {item.keyBenefit}
                  </p>
                </div>

                {/* Research Findings */}
                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                    Доказани Ефекти:
                  </h4>
                  <ul className="space-y-2">
                    {item.researchFindings.slice(0, 3).map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dosage Comparison */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Клинична доза:</span>
                    <span className="font-semibold">{item.clinicalDose}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">TestoUP доза:</span>
                    <span className="font-bold text-primary">{item.ourDose}</span>
                  </div>
                </div>

                {/* Studies */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Beaker className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.studies}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Защо Дозировките Имат Значение?
            </h3>
            <p className="text-muted-foreground mb-6">
              Повечето добавки на пазара използват <strong>"pixie dust" дозировки</strong> -
              прашец от съставка, недостатъчен за ефект. TestoUP използва <strong>клинично
              валидирани дози</strong> от всяка съставка. Това означава реални резултати,
              не маркетинг.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Peer-reviewed изследвания</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Клинични дозировки</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Прозрачност на етикета</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
