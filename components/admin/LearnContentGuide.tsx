'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Info,
  ChevronUp,
  ChevronDown,
  FileText,
  Sparkles,
  LayoutGrid,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LearnContentGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-500" />
            <CardTitle>Упътване за използване</CardTitle>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6 border-t pt-6">
          {/* Какво е Cluster и Pillar */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Какво е Cluster и Pillar?
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="font-semibold text-purple-600 mb-1">
                  🌟 Cluster Guide (3,500 думи)
                </div>
                <p className="text-muted-foreground">
                  Обща, обзорна статия която покрива широка тема в мъжкото здраве. Служи като главна врата към дадена категория знания.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Пример:</strong> Тестостерон - Пълно ръководство за мъже
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="font-semibold text-blue-600 mb-1">
                  📚 Pillar Article (5,500 думи)
                </div>
                <p className="text-muted-foreground">
                  Задълбочена статия която детайлно разглежда конкретна подтема. Всеки Pillar е свързан с един Cluster и го допълва.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Пример:</strong> Как да повишиш тестостерона естествено
                </p>
              </div>
            </div>
          </div>

          {/* Конкретен пример */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Конкретен пример: Категория Testosterone
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30">
                <div className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                  🌟 CLUSTER: Тестостерон - Пълно ръководство за мъже
                </div>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <p>• Какво е тестостерон (общ преглед)</p>
                  <p>• Ниски нива - признаци и симптоми</p>
                  <p>• Методи за повишаване</p>
                  <p className="text-blue-600 mt-2">
                    → Съдържа линкове към 6 pillar статии за специфични теми
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-600 mb-1 text-xs">
                    📚 PILLAR: Естествени методи за тестостерон
                  </div>
                  <div className="text-muted-foreground text-xs space-y-1">
                    <p>• Храни, упражнения, добавки</p>
                    <p>• Lifestyle промени</p>
                    <p className="text-green-600 mt-1">↑ Линк към cluster</p>
                    <p className="text-green-600">
                      → Линк към Симптоми на нисък тестостерон
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-600 mb-1 text-xs">
                    📚 PILLAR: Хормонална терапия TRT
                  </div>
                  <div className="text-muted-foreground text-xs space-y-1">
                    <p>• Какво е TRT</p>
                    <p>• Предимства и рискове</p>
                    <p className="text-green-600 mt-1">↑ Линк към cluster</p>
                    <p className="text-green-600">→ Линк към Странични ефекти</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="font-semibold text-green-600 mb-2">
                  🔗 Вътрешен LinkBuilding
                </div>
                <div className="text-muted-foreground text-xs space-y-1">
                  <p>
                    <strong>Cluster статия:</strong> Линкове към всички pillars в категорията
                  </p>
                  <p>
                    <strong>Всеки Pillar:</strong> Линк обратно към cluster + 2-3 related pillars
                  </p>
                  <p className="text-green-600 mt-2">
                    → Читателят остава на платформата защото има къде да се движи!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Обяснение на категориите */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-green-500" />
              Обяснение на категориите
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-purple-600 mb-1">🧬 Testosterone</div>
                <div className="text-xs text-muted-foreground">
                  Тестостерон, хормони, TRT, естествени методи
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-pink-600 mb-1">💪 Потенция</div>
                <div className="text-xs text-muted-foreground">
                  Еректилна функция, либидо, сексуално здраве
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-blue-600 mb-1">🏋️ Fitness</div>
                <div className="text-xs text-muted-foreground">
                  Тренировки, мускулна маса, сила, кондиция
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-green-600 mb-1">🥗 Хранене</div>
                <div className="text-xs text-muted-foreground">
                  Диети, макронутриенти, хранителен режим
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-orange-600 mb-1">💊 Добавки</div>
                <div className="text-xs text-muted-foreground">
                  Витамини, минерали, суплементи, TestoUP
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold text-indigo-600 mb-1">🌿 Lifestyle</div>
                <div className="text-xs text-muted-foreground">
                  Сън, стрес, навици, ежедневие
                </div>
              </div>
            </div>
          </div>

          {/* Как да създаваш съдържание */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-500" />
              Как да създаваш съдържание
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold mb-2">Стъпка 1: Избери режим</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                  <li>
                    <strong>Предложения:</strong> AI генерира 10 cluster идеи
                  </li>
                  <li>
                    <strong>Cluster Guide:</strong> Създай overview статия за категория
                  </li>
                  <li>
                    <strong>Pillar Article:</strong> Създай задълбочена подтема
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold mb-2">
                  Стъпка 2: Въведи заглавие и категория
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                  <li>Избери ясно, SEO-оптимизирано заглавие</li>
                  <li>Добави keywords (опционално)</li>
                  <li>AI ще оптимизира съдържанието автоматично</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="font-semibold mb-2">Стъпка 3: Генерирай с AI</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                  <li>Cluster: ~10-15 секунди</li>
                  <li>Pillar: ~15-20 секунди</li>
                  <li>Автоматично генериране на hero image</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Добри практики */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">💡 Добри практики</h4>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>✅ Създавай cluster преди pillars в дадена категория</li>
                <li>✅ Всеки cluster трябва да има 4-8 свързани pillars</li>
                <li>✅ Използвай AI Suggestions за идеи</li>
                <li>✅ Естествен български език (НЕ директен превод!)</li>
                <li>✅ Pillars трябва да linkват обратно към cluster-a си</li>
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
