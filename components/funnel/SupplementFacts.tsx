"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck } from "lucide-react";

interface Ingredient {
  name: string;
  amount: string;
  rda?: string;
}

const supplementFacts: Ingredient[] = [
  {
    name: "Витамин D3 (Холекалциферол)",
    amount: "35 mcg (2400 IU)",
    rda: "700%"
  },
  {
    name: "Витамин E (D-алфа токоферил ацетат)",
    amount: "270 mg",
    rda: "2250%"
  },
  {
    name: "Витамин C (L-аскорбинова киселина)",
    amount: "200 mg",
    rda: "250%"
  },
  {
    name: "Цинков цитрат",
    amount: "50 mg (15 mg елементарен цинк)",
    rda: "150%"
  },
  {
    name: "Магнезиев бисглицинат",
    amount: "400 mg (44 mg ел. магнезий)",
    rda: "11.73%"
  },
  {
    name: "Витамин K2 (MK7)",
    amount: "100 mcg",
    rda: "—"
  },
  {
    name: "Витамин B6 (Пиридоксин хидрохлорид)",
    amount: "10 mg",
    rda: "714%"
  },
  {
    name: "Витамин B12 (цианокобаламин)",
    amount: "600 mcg",
    rda: "24000%"
  },
  {
    name: "Витамин B9 (5-MTHF)",
    amount: "400 mcg",
    rda: "200%"
  },
  {
    name: "Екстракт от Ашваганда (Withania somnifera)",
    amount: "400 mg",
    rda: "—"
  },
  {
    name: "Екстракт от Tribulus Terrestris",
    amount: "600 mg",
    rda: "—"
  },
  {
    name: "Селен (L-селенометионин)",
    amount: "200 mcg",
    rda: "364%"
  }
];

export function SupplementFacts() {
  return (
    <section className="py-12 md:py-16 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 text-sm">
            <FileCheck className="w-4 h-4 mr-2" />
            Пълна Прозрачност
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Supplement Facts
          </h2>
          <p className="text-lg text-muted-foreground">
            Точно това което е на етикета. Нищо повече. Нищо по-малко.
          </p>
        </div>

        {/* Supplement Facts Label */}
        <Card className="max-w-2xl mx-auto border-4 border-black dark:border-white">
          <div className="bg-white dark:bg-black text-black dark:text-white p-6 font-mono">
            {/* Header */}
            <div className="border-b-8 border-black dark:border-white pb-2 mb-4">
              <h3 className="text-3xl font-black">Supplement Facts</h3>
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

            {/* Table Header */}
            <div className="border-b-4 border-black dark:border-white">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold pb-1">
                <div className="col-span-6"></div>
                <div className="col-span-3 text-right">Количество</div>
                <div className="col-span-3 text-right">% ХРС*</div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="divide-y divide-black dark:divide-white">
              {supplementFacts.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 py-2 text-xs"
                >
                  <div className="col-span-6 font-semibold">
                    {ingredient.name}
                  </div>
                  <div className="col-span-3 text-right">
                    {ingredient.amount}
                  </div>
                  <div className="col-span-3 text-right font-bold">
                    {ingredient.rda || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="border-t-4 border-black dark:border-white pt-3 mt-3">
              <p className="text-xs leading-relaxed">
                <strong>*</strong> % Хранителна Референтна Стойност (ХРС) за възрастни.
                <br />
                <strong>—</strong> ХРС не е установена.
              </p>
            </div>
          </div>
        </Card>

        {/* Certifications */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🇪🇺</span>
            </div>
            <p className="text-sm font-semibold">Произведено в ЕС</p>
            <p className="text-xs text-muted-foreground">Сертифицирано GMP</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🔬</span>
            </div>
            <p className="text-sm font-semibold">Лабораторно тествано</p>
            <p className="text-xs text-muted-foreground">Всяка партида</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🌱</span>
            </div>
            <p className="text-sm font-semibold">100% природни</p>
            <p className="text-xs text-muted-foreground">Без химия</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-semibold">No BS Guarantee</p>
            <p className="text-xs text-muted-foreground">Без proprietary blends</p>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-10 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3">
            Защо Показваме Всичко?
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Повечето добавки крият съставките си зад <strong>"proprietary blends"</strong> -
            тайни смеси където не знаеш колко от всяка съставка взимаш. TestoUP показва
            <strong> всяка съставка. Всяка дозировка</strong>. Защото имаме какво да покажем.
            Защото работи.
          </p>
        </div>
      </div>
    </section>
  );
}
