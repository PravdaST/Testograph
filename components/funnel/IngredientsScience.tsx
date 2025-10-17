"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, TrendingUp, Shield, Zap, Heart, ChevronDown, ChevronUp, Users, Award, CheckCircle, MapPin, Microscope, Leaf, ShieldCheck, Hand } from "lucide-react";
import Image from "next/image";

interface Ingredient {
  id: number;
  ingredient: string;
  dosage: string;
  icon?: React.ReactNode;
  scientificName?: string;
  researchFindings?: string[];
  clinicalDose?: string;
  ourDose?: string;
  studies?: string;
  keyBenefit: string;
  accentColor: string;
  color: string;
  rda?: string;
  isTopIngredient?: boolean;
}

const allIngredients: Ingredient[] = [
  // TOP 5 with full details
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
    color: "green",
    isTopIngredient: true
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
    color: "orange",
    isTopIngredient: true
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
    color: "blue",
    isTopIngredient: true
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
    color: "purple",
    isTopIngredient: true
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
    color: "red",
    isTopIngredient: true
  },
  // Additional 7 ingredients
  {
    id: 6,
    ingredient: "Витамин E",
    dosage: "270mg",
    rda: "2250%",
    keyBenefit: "Мощен антиоксидант за защита на тестикуларните клетки",
    accentColor: "border-amber-500",
    color: "amber",
    isTopIngredient: false
  },
  {
    id: 7,
    ingredient: "Tribulus Terrestris",
    dosage: "600mg",
    keyBenefit: "Традиционна билка за либидо и сексуална функция",
    accentColor: "border-lime-500",
    color: "lime",
    isTopIngredient: false
  },
  {
    id: 8,
    ingredient: "Магнезий Бисглицинат",
    dosage: "44mg",
    rda: "11.7%",
    keyBenefit: "Повишава свободен тестостерон и подобрява сън",
    accentColor: "border-cyan-500",
    color: "cyan",
    isTopIngredient: false
  },
  {
    id: 9,
    ingredient: "Витамин K2 (MK-7)",
    dosage: "100mcg",
    keyBenefit: "Насочва калций към костите, подкрепа за cardiovascular здраве",
    accentColor: "border-indigo-500",
    color: "indigo",
    isTopIngredient: false
  },
  {
    id: 10,
    ingredient: "Витамин B6",
    dosage: "10mg",
    rda: "714%",
    keyBenefit: "Регулира хормонална активност и намалява умора",
    accentColor: "border-pink-500",
    color: "pink",
    isTopIngredient: false
  },
  {
    id: 11,
    ingredient: "Витамин B9 (5-MTHF)",
    dosage: "400mcg",
    rda: "200%",
    keyBenefit: "Активната форма на фолат за сперматогенеза",
    accentColor: "border-rose-500",
    color: "rose",
    isTopIngredient: false
  },
  {
    id: 12,
    ingredient: "Витамин C",
    dosage: "200mg",
    rda: "250%",
    keyBenefit: "Антиоксидант, намалява кортизол, подобрява имунитет",
    accentColor: "border-yellow-500",
    color: "yellow",
    isTopIngredient: false
  }
];

export function IngredientsScience() {
  const [showSupplementFacts, setShowSupplementFacts] = useState(false);
  const [activeIngredient, setActiveIngredient] = useState<number | null>(1);
  const [showHint, setShowHint] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Auto-advance on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        setMobileActiveIndex((prev) => (prev + 1) % allIngredients.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance on desktop - sequential 1-12
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) {
        setActiveIngredient((prev) => {
          const nextId = (prev || 0) + 1;
          return nextId > allIngredients.length ? 1 : nextId;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Removed manual badge scroll - using CSS animation instead

  return (
    <section className="py-8 md:py-12 px-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ingredients-drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(20px); }
        }
        @keyframes ingredients-drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(-20px); }
        }
        @keyframes ingredients-drift-vertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .animate-ingredients-drift { animation: ingredients-drift 18s ease-in-out infinite; }
        .animate-ingredients-drift-reverse { animation: ingredients-drift-reverse 22s ease-in-out infinite; }
        .animate-ingredients-drift-vertical { animation: ingredients-drift-vertical 20s ease-in-out infinite; }
        .animate-ingredients-drift-16 { animation: ingredients-drift 16s ease-in-out infinite; }

        /* Infinite horizontal scroll animation */
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }

        /* Hide scrollbar */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Animated SVG Background Lines - Different pattern from Benefits */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ing-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ing-gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ing-gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Curved line 1 - Top right flowing */}
        <path
          d="M 1400 50 Q 1000 150, 700 100 T 200 200"
          stroke="url(#ing-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-ingredients-drift"
        />

        {/* Curved line 2 - Middle cross */}
        <path
          d="M -100 300 Q 300 250, 600 350 T 1300 400"
          stroke="url(#ing-gradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-ingredients-drift-reverse"
        />

        {/* Curved line 3 - Bottom wave */}
        <path
          d="M 1500 650 Q 1100 700, 700 600 T -50 750"
          stroke="url(#ing-gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-ingredients-drift-16"
        />

        {/* Circle accent 1 */}
        <circle
          cx="900"
          cy="200"
          r="100"
          stroke="url(#ing-gradient3)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Circle accent 2 */}
        <circle
          cx="300"
          cy="550"
          r="130"
          stroke="url(#ing-gradient2)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />

        {/* Curved line 4 - Vertical wave */}
        <path
          d="M 500 -50 Q 450 250, 550 500 T 500 850"
          stroke="url(#ing-gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-ingredients-drift-vertical"
        />

        {/* Additional wave for complexity */}
        <path
          d="M 200 150 Q 400 200, 600 150 Q 800 100, 1000 150"
          stroke="url(#ing-gradient2)"
          strokeWidth="1.5"
          fill="none"
          className="animate-ingredients-drift-reverse"
          opacity="0.6"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10">
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

        {/* Compact Bubble Interface - Desktop & Mobile Optimized */}
        <div className="relative">
          {/* Desktop: Product with Vertical Numbers - Sequential 1-12 */}
          <div className="hidden md:block">
            <div className="relative flex items-center justify-center max-w-7xl mx-auto min-h-[800px] gap-8">
              {/* Left Column: Odd numbers 1,3,5,7,9,11 */}
              <div className="w-96 flex flex-col gap-4">
                {allIngredients.filter((_, index) => index % 2 === 0).map((ingredient) => {
                  const isActive = activeIngredient === ingredient.id;
                  return (
                    <div key={ingredient.id} className="relative flex items-center gap-4 justify-end min-h-[44px]">
                      {/* Expandable Bubble - Left Side */}
                      <div className={`absolute right-14 transition-all duration-500 ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                      }`}>
                        {isActive && (
                          <Card className={`p-3 w-72 shadow-xl border-2 border-${ingredient.color}-500 bg-card/95 backdrop-blur-sm`}>
                            <div className="flex items-start gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full bg-${ingredient.color}-500 flex items-center justify-center text-white font-black flex-shrink-0 text-xs`}>
                                {ingredient.id}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm mb-0.5">{ingredient.ingredient}</h4>
                                <Badge variant="outline" className="text-xs">{ingredient.dosage}</Badge>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-primary">{ingredient.keyBenefit}</p>
                          </Card>
                        )}
                      </div>

                      {/* Connecting Line */}
                      {isActive && (
                        <div className="absolute right-10 w-12 h-0.5 bg-gradient-to-r from-transparent to-primary" />
                      )}

                      {/* Number Button - Fixed position */}
                      <button
                        onClick={() => setActiveIngredient(isActive ? null : ingredient.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? `bg-${ingredient.color}-500 scale-110 shadow-xl ring-4 ring-${ingredient.color}-300/50 border-${ingredient.color}-400`
                            : "bg-primary/20 border-primary/40 hover:scale-105 hover:bg-primary/30"
                        }`}
                      >
                        <span className="text-xs font-black text-white">{ingredient.id}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Center: Product - Larger */}
              <div className="relative w-[500px] h-[500px] flex-shrink-0">
                {/* Purple glow effect - vibrant */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-violet-500/30 to-fuchsia-500/30 blur-[80px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-transparent blur-3xl" />
                </div>
                {/* Product backdrop with purple tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl backdrop-blur-sm border border-purple-500/20 -z-5" />

                <Image
                  src="/product/testoup-bottle_v1.webp"
                  alt="TestoUP - 12 активни съставки"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />
              </div>

              {/* Right Column: Even numbers 2,4,6,8,10,12 */}
              <div className="w-96 flex flex-col gap-4">
                {allIngredients.filter((_, index) => index % 2 === 1).map((ingredient) => {
                  const isActive = activeIngredient === ingredient.id;
                  return (
                    <div key={ingredient.id} className="relative flex items-center gap-4 min-h-[44px]">
                      {/* Number Button - Fixed position */}
                      <button
                        onClick={() => setActiveIngredient(isActive ? null : ingredient.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? `bg-${ingredient.color}-500 scale-110 shadow-xl ring-4 ring-${ingredient.color}-300/50 border-${ingredient.color}-400`
                            : "bg-primary/20 border-primary/40 hover:scale-105 hover:bg-primary/30"
                        }`}
                      >
                        <span className="text-xs font-black text-white">{ingredient.id}</span>
                      </button>

                      {/* Connecting Line */}
                      {isActive && (
                        <div className="absolute left-10 w-12 h-0.5 bg-gradient-to-l from-transparent to-primary" />
                      )}

                      {/* Expandable Bubble - Right Side */}
                      <div className={`absolute left-14 transition-all duration-500 ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                      }`}>
                        {isActive && (
                          <Card className={`p-3 w-72 shadow-xl border-2 border-${ingredient.color}-500 bg-card/95 backdrop-blur-sm`}>
                            <div className="flex items-start gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full bg-${ingredient.color}-500 flex items-center justify-center text-white font-black flex-shrink-0 text-xs`}>
                                {ingredient.id}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm mb-0.5">{ingredient.ingredient}</h4>
                                <Badge variant="outline" className="text-xs">{ingredient.dosage}</Badge>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-primary">{ingredient.keyBenefit}</p>
                          </Card>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Product + All 12 Numbers + Centered Bubble OVERLAY */}
          <div className="md:hidden">
            <div className="relative flex flex-col items-center">
              {/* Product with 12 numbers around it AND bubble overlay in center */}
              <div className="relative w-72 h-72 mb-8 sm:w-80 sm:h-80">
                {/* Purple glow effect - vibrant */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-violet-500/30 to-fuchsia-500/30 blur-[60px] rounded-full animate-pulse" />
                </div>
                {/* Product backdrop with purple tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 rounded-3xl backdrop-blur-sm border border-purple-500/20 -z-5" />

                <Image
                  src="/product/testoup-bottle_v1.webp"
                  alt="TestoUP - 12 активни съставки"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />

                {/* Centered Bubble Card OVERLAY - Above product, below numbers */}
                <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
                  {allIngredients.map((ingredient, index) => (
                    <Card
                      key={ingredient.id}
                      className={`p-3 sm:p-4 w-full max-w-[240px] sm:max-w-[260px] transition-all duration-500 ${
                        index === mobileActiveIndex
                          ? `opacity-100 scale-100 border-2 border-${ingredient.color}-500 shadow-2xl`
                          : "opacity-0 scale-90 absolute inset-0 pointer-events-none"
                      } bg-card/95 backdrop-blur-md`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-${ingredient.color}-500 flex items-center justify-center text-white font-black flex-shrink-0 text-sm`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base mb-1 leading-tight">{ingredient.ingredient}</h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{ingredient.dosage}</Badge>
                        </div>
                      </div>

                      {ingredient.scientificName && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground italic mb-1.5">{ingredient.scientificName}</p>
                      )}

                      <p className="text-xs sm:text-sm font-semibold text-primary mb-2 leading-snug">{ingredient.keyBenefit}</p>

                      {ingredient.rda && (
                        <p className="text-[10px] sm:text-xs font-bold text-primary mb-1.5">{ingredient.rda} РДА</p>
                      )}

                      {ingredient.researchFindings && (
                        <ul className="space-y-1 text-[10px] sm:text-xs text-muted-foreground mb-2">
                          {ingredient.researchFindings.slice(0, 2).map((finding, idx) => (
                            <li key={idx} className="flex gap-1.5">
                              <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {ingredient.studies && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          <Beaker className="w-3 h-3 mr-1" />
                          {ingredient.studies}
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>

                {/* All 12 numbers around product - Higher z-index to be above bubble */}
                {allIngredients.map((ingredient, index) => {
                  // Vertical alignment in two columns (left and right) - outside the frame
                  const positions = [
                    { top: "5%", left: "-15%" },    // 1 - left
                    { top: "5%", right: "-15%" },   // 2 - right
                    { top: "20%", left: "-15%" },   // 3 - left
                    { top: "20%", right: "-15%" },  // 4 - right
                    { top: "35%", left: "-15%" },   // 5 - left
                    { top: "35%", right: "-15%" },  // 6 - right
                    { top: "50%", left: "-15%" },   // 7 - left
                    { top: "50%", right: "-15%" },  // 8 - right
                    { top: "65%", left: "-15%" },   // 9 - left
                    { top: "65%", right: "-15%" },  // 10 - right
                    { top: "80%", left: "-15%" },   // 11 - left
                    { top: "80%", right: "-15%" }   // 12 - right
                  ];
                  const isActive = index === mobileActiveIndex;

                  return (
                    <button
                      key={ingredient.id}
                      onClick={() => setMobileActiveIndex(index)}
                      className={`absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-30 ${
                        isActive
                          ? `bg-${ingredient.color}-500 scale-125 shadow-xl ring-2 ring-${ingredient.color}-300/50 border-${ingredient.color}-400`
                          : "bg-primary/30 border-primary/50 hover:scale-110"
                      }`}
                      style={positions[index]}
                    >
                      <span className="text-xs font-black text-white">{index + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress Dots - Below product */}
              <div className="flex justify-center gap-2">
                {allIngredients.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setMobileActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === mobileActiveIndex ? "bg-primary w-6" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Why Dosages Matter - Modern Compact */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Защо дозировките имат значение?
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              TestoUP използва <strong>клинично валидирани дози</strong> от всяка съставка. Затова работи.
            </p>
          </div>

          {/* Infinite Auto-Scroll with Gradient Fades */}
          <div className="relative overflow-hidden">
            {/* Left Gradient Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

            {/* Right Gradient Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Scrolling Container */}
            <div className="flex gap-3 md:gap-4 animate-scroll-left">
              {/* First Set of Badges */}
              <Card className="p-4 text-center border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Рецензирани изследвания</p>
              </Card>

              <Card className="p-4 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Клинични дозировки</p>
              </Card>

              <Card className="p-4 text-center border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Пълна прозрачност</p>
              </Card>

              <Card className="p-4 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Произведено в ЕС</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">GMP</p>
              </Card>

              <Card className="p-4 text-center border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Тествано</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Лаб</p>
              </Card>

              <Card className="p-4 text-center border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">100% природни</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Без химия</p>
              </Card>

              <Card className="p-4 text-center border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Гаранция</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Честност</p>
              </Card>

              {/* Duplicate Set for Seamless Loop */}
              <Card className="p-4 text-center border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Рецензирани изследвания</p>
              </Card>

              <Card className="p-4 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Клинични дозировки</p>
              </Card>

              <Card className="p-4 text-center border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Пълна прозрачност</p>
              </Card>

              <Card className="p-4 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Произведено в ЕС</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">GMP</p>
              </Card>

              <Card className="p-4 text-center border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Тествано</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Лаб</p>
              </Card>

              <Card className="p-4 text-center border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">100% природни</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Без химия</p>
              </Card>

              <Card className="p-4 text-center border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent hover:shadow-lg transition-all min-w-[140px] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold">Гаранция</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Честност</p>
              </Card>
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
      </div>
    </section>
  );
}
