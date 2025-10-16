"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, TrendingUp, Shield, Zap, Heart, ChevronDown, ChevronUp, Users, Award, CheckCircle, MapPin, Microscope, Leaf, ShieldCheck, Hand } from "lucide-react";
import Image from "next/image";

interface TopIngredient {
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
  accentColor: string;
  color: string;
}

interface CompactIngredient {
  name: string;
  amount: string;
  rda?: string;
  benefit: string;
}

const topIngredients: TopIngredient[] = [
  {
    id: 1,
    ingredient: "Ашваганда",
    dosage: "400mg",
    icon: <TrendingUp className="w-6 h-6" />,
    scientificName: "Withania somnifera",
    researchFindings: [
      "Повишава тестостерон с 15-17% за 8 седмици",
      "Намалява кортизол (стрес хормон) с до 28%",
      "Подобрява качество на сперма с 167%"
    ],
    clinicalDose: "300-600mg дневно",
    ourDose: "400mg (оптимална клинична доза)",
    studies: "43+ клинични изследвания",
    keyBenefit: "Адаптоген #1 за тестостерон и стрес",
    accentColor: "border-green-500",
    color: "green"
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
      "90% от българите имат дефицит през зимата"
    ],
    clinicalDose: "2000-4000 IU дневно",
    ourDose: "2400 IU (700% РДА)",
    studies: "100+ клинични изследвания",
    keyBenefit: "Хормонален фундамент",
    accentColor: "border-orange-500",
    color: "orange"
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
      "Подобрява подвижност и морфология на сперма"
    ],
    clinicalDose: "11-15mg дневно",
    ourDose: "15mg елементарен цинк (150% РДА)",
    studies: "80+ клинични изследвания",
    keyBenefit: "Критичен за мъжко репродуктивно здраве",
    accentColor: "border-blue-500",
    color: "blue"
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
      "Подобрява морфология на сперма"
    ],
    clinicalDose: "55-200mcg дневно",
    ourDose: "200mcg (364% РДА - терапевтична доза)",
    studies: "50+ клинични изследвания",
    keyBenefit: "Фертилност и антиоксидантна защита",
    accentColor: "border-purple-500",
    color: "purple"
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
      "Дефицитът причинява хронична умора"
    ],
    clinicalDose: "2.4-100mcg дневно",
    ourDose: "600mcg (24000% РДА - мега доза за енергия)",
    studies: "200+ клинични изследвания",
    keyBenefit: "Експлозивна енергия и възстановяване",
    accentColor: "border-red-500",
    color: "red"
  }
];

const compactIngredients: CompactIngredient[] = [
  {
    name: "Витамин E",
    amount: "270mg",
    rda: "2250%",
    benefit: "Мощен антиоксидант за защита на тестикуларните клетки"
  },
  {
    name: "Tribulus Terrestris",
    amount: "600mg",
    rda: undefined,
    benefit: "Традиционна билка за либидо и сексуална функция"
  },
  {
    name: "Магнезий Бисглицинат",
    amount: "44mg",
    rda: "11.7%",
    benefit: "Повишава свободен тестостерон и подобрява сън"
  },
  {
    name: "Витамин K2 (MK-7)",
    amount: "100mcg",
    rda: undefined,
    benefit: "Насочва калций към костите, подкрепя cardiovascular здраве"
  },
  {
    name: "Витамин B6",
    amount: "10mg",
    rda: "714%",
    benefit: "Регулира хормонална активност и намалява умора"
  },
  {
    name: "Витамин B9 (5-MTHF)",
    amount: "400mcg",
    rda: "200%",
    benefit: "Активната форма на фолат за сперматогенеза"
  },
  {
    name: "Витамин C",
    amount: "200mg",
    rda: "250%",
    benefit: "Антиоксидант, намалява кортизол, подобрява имунитет"
  }
];

export function IngredientsScience() {
  const [showSupplementFacts, setShowSupplementFacts] = useState(false);
  const [activeIngredient, setActiveIngredient] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(true);

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Beaker className="w-4 h-4 mr-2" />
            Научна Валидация
          </Badge>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="outline" className="bg-background">
              <Beaker className="w-3 h-3 mr-1.5 text-blue-600" />
              <span className="text-xs font-semibold">200+ изследвания</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Users className="w-3 h-3 mr-1.5 text-green-600" />
              <span className="text-xs font-semibold">10,000+ мъже</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Award className="w-3 h-3 mr-1.5 text-purple-600" />
              <span className="text-xs font-semibold">Клинични дози</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <CheckCircle className="w-3 h-3 mr-1.5 text-emerald-600" />
              <span className="text-xs font-semibold">ЕС сертификат</span>
            </Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Кои съставки работят (и защо)
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Без излъгвания. Без безполезен прашец. Само съставки с доказан ефект в клинични дозировки.
          </p>
        </div>

        {/* Interactive Product Split Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
          {/* Left: Product Image with Hotspots */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Product Image */}
              <div className="relative w-full h-full">
                <Image
                  src="/product/testoup-bottle_v1.webp"
                  alt="TestoUP бутилка"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-40 animate-pulse -z-10" />
              </div>

              {/* Pulsing Hint Bubble */}
              {showHint && !activeIngredient && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl animate-bounce flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  Натисни съставките →
                </div>
              )}

              {/* Interactive Hotspots */}
              <div className="absolute inset-0">
                {topIngredients.map((ingredient, index) => {
                  const positions = [
                    { top: "15%", left: "20%" },   // Top-left
                    { top: "30%", right: "15%" },  // Top-right
                    { top: "50%", left: "10%" },   // Middle-left
                    { top: "65%", right: "20%" },  // Middle-right
                    { bottom: "15%", left: "25%" } // Bottom
                  ];

                  const isActive = activeIngredient === ingredient.id;

                  return (
                    <button
                      key={ingredient.id}
                      onClick={() => {
                        setActiveIngredient(ingredient.id);
                        setShowHint(false);
                      }}
                      className={`absolute w-8 h-8 rounded-full border-4 transition-all duration-300 cursor-pointer group ${
                        isActive
                          ? `bg-${ingredient.color}-500 border-${ingredient.color}-400 scale-125 shadow-lg`
                          : "bg-primary/20 border-primary/40 hover:scale-110 hover:bg-primary/40"
                      } ${!activeIngredient ? "animate-pulse" : ""}`}
                      style={positions[index]}
                    >
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-white">
                        {index + 1}
                      </span>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                          {ingredient.ingredient}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Ingredients List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-6">Топ 5 активни съставки:</h3>

            {topIngredients.map((ingredient, index) => {
              const isActive = activeIngredient === ingredient.id;

              return (
                <button
                  key={ingredient.id}
                  onClick={() => {
                    setActiveIngredient(ingredient.id);
                    setShowHint(false);
                  }}
                  className={`w-full text-left transition-all duration-300 ${
                    isActive
                      ? `bg-${ingredient.color}-500/10 border-${ingredient.color}-500 scale-105 shadow-xl`
                      : "bg-card/50 border-border/50 hover:border-primary/50"
                  } border-2 rounded-xl p-4 cursor-pointer`}
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 ${
                      isActive ? `bg-${ingredient.color}-500` : "bg-muted"
                    }`}>
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-lg">{ingredient.ingredient}</h4>
                        <Badge variant="outline" className="text-xs font-semibold flex-shrink-0">
                          {ingredient.dosage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground italic mb-2">
                        {ingredient.scientificName}
                      </p>

                      {/* Expanded Details */}
                      {isActive && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in duration-300">
                          <p className="text-sm font-semibold text-primary">
                            {ingredient.keyBenefit}
                          </p>
                          <ul className="space-y-1">
                            {ingredient.researchFindings.map((finding, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Beaker className="w-3 h-3 mr-1" />
                              {ingredient.studies}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ingredients Table - Compact Format */}
        <div className="mb-10">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 bg-muted/50">
                    <th className="text-left p-4 text-sm font-bold">Съставка</th>
                    <th className="text-left p-4 text-sm font-bold">Доза</th>
                    <th className="text-left p-4 text-sm font-bold hidden md:table-cell">% РДА</th>
                    <th className="text-left p-4 text-sm font-bold">Ключов Ефект</th>
                    <th className="text-center p-4 text-sm font-bold hidden lg:table-cell">Проучвания</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TOP 5 Ingredients */}
                  {topIngredients.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b hover:bg-muted/30 transition-colors border-l-4 ${item.accentColor}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-primary hidden sm:block">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{item.ingredient}</p>
                            <p className="text-xs text-muted-foreground italic">{item.scientificName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {item.dosage}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm font-semibold text-primary">
                          {item.ourDose.match(/\d+%/)?.[0] || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-xs leading-relaxed">{item.keyBenefit}</p>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          <Beaker className="w-3 h-3 mr-1" />
                          {item.studies.replace("+ клинични изследвания", "")}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {/* Additional 7 Ingredients */}
                  {compactIngredients.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold text-sm">{item.name}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {item.amount}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm font-semibold text-primary">
                          {item.rda || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-xs leading-relaxed">{item.benefit}</p>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Why Dosages Matter */}
        <div className="bg-muted/30 border-l-4 border-primary rounded-xl p-8 text-center mb-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Защо дозировките имат значение?
            </h3>
            <p className="text-muted-foreground mb-6">
              Повечето добавки на пазара използват <strong>безполезни дозировки</strong> -
              прашец от съставка, недостатъчен за ефект. TestoUP използва <strong>клинично
              валидирани дози</strong> от всяка съставка. Затова работи.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Рецензирани изследвания</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Клинични дозировки</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Пълна прозрачност</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplement Facts Accordion */}
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowSupplementFacts(!showSupplementFacts)}
            className="w-full bg-card border-2 border-border rounded-xl p-6 hover:border-primary/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Beaker className="w-6 h-6 text-primary" />
              <div className="text-left">
                <h3 className="font-bold text-lg">Хранителни Факти (Официален Етикет)</h3>
                <p className="text-sm text-muted-foreground">Виж точните количества на всяка съставка</p>
              </div>
            </div>
            {showSupplementFacts ? (
              <ChevronUp className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            )}
          </button>

          {showSupplementFacts && (
            <Card className="mt-4 border-4 border-black dark:border-white">
              <div className="bg-white dark:bg-black text-black dark:text-white p-6 font-mono">
                {/* Header */}
                <div className="border-b-8 border-black dark:border-white pb-2 mb-4">
                  <h3 className="text-3xl font-black">Хранителни Факти</h3>
                </div>

                {/* Serving Info */}
                <div className="border-b-4 border-black dark:border-white pb-3 mb-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Размер на дозата:</span>
                    <span>2 капсули</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Дози в опаковка:</span>
                    <span>30</span>
                  </div>
                </div>

                {/* Table */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-12 gap-2 font-bold pb-1 border-b-4 border-black dark:border-white">
                    <div className="col-span-6">Съставка</div>
                    <div className="col-span-3 text-right">Количество</div>
                    <div className="col-span-3 text-right">% ХРС*</div>
                  </div>

                  {[
                    ["Витамин D3", "35mcg (2400 IU)", "700%"],
                    ["Витамин E", "270mg", "2250%"],
                    ["Витамин C", "200mg", "250%"],
                    ["Цинков цитрат", "50mg (15mg ел.)", "150%"],
                    ["Магнезиев бисглицинат", "400mg (44mg ел.)", "11.7%"],
                    ["Витамин K2 (MK7)", "100mcg", "—"],
                    ["Витамин B6", "10mg", "714%"],
                    ["Витамин B12", "600mcg", "24000%"],
                    ["Витамин B9 (5-MTHF)", "400mcg", "200%"],
                    ["Ашваганда екстракт", "400mg", "—"],
                    ["Tribulus Terrestris екстракт", "600mg", "—"],
                    ["Селен (L-селенометионин)", "200mcg", "364%"]
                  ].map(([name, amount, rda], idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 py-1 border-b border-black/20 dark:border-white/20">
                      <div className="col-span-6 font-semibold">{name}</div>
                      <div className="col-span-3 text-right">{amount}</div>
                      <div className="col-span-3 text-right font-bold">{rda}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t-4 border-black dark:border-white pt-3 mt-3">
                  <p className="text-xs">
                    <strong>*</strong> % Хранителна Референтна Стойност (ХРС) за възрастни.
                    <br />
                    <strong>—</strong> ХРС не е установена.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Certifications */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-7 h-7 text-green-700 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold">Произведено в ЕС</p>
            <p className="text-xs text-muted-foreground">Сертифицирано GMP</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Microscope className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold">Лабораторно тествано</p>
            <p className="text-xs text-muted-foreground">Всяка партида</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-7 h-7 text-purple-700 dark:text-purple-400" />
            </div>
            <p className="text-sm font-semibold">100% природни</p>
            <p className="text-xs text-muted-foreground">Без химия</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-7 h-7 text-orange-700 dark:text-orange-400" />
            </div>
            <p className="text-sm font-semibold">Гаранция за честност</p>
            <p className="text-xs text-muted-foreground">Без скрити смеси</p>
          </div>
        </div>
      </div>
    </section>
  );
}
