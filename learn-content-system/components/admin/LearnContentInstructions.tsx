'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Sparkles, LayoutGrid, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LearnContentInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-zinc-50">Упътване за използване</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800 p-6 space-y-6">
          {/* What is Cluster/Pillar */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Какво е Cluster и Pillar?
            </h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="font-semibold text-purple-300 mb-1">🌟 Cluster Guide (3,500 думи)</div>
                <p className="text-zinc-400">
                  Обща, обзорна статия която покрива широка тема в астрологията.
                  Служи като &ldquo;главна врата&rdquo; към дадена категория знания.
                </p>
                <p className="text-zinc-500 text-xs mt-2">
                  <strong>Пример:</strong> &ldquo;Пълно ръководство за планетите в астрологията&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="font-semibold text-blue-300 mb-1">📚 Pillar Guide (5,500 думи)</div>
                <p className="text-zinc-400">
                  Задълбочена статия която детайлно разглежда конкретна подтема.
                  Всеки Pillar е свързан с един Cluster и го допълва.
                </p>
                <p className="text-zinc-500 text-xs mt-2">
                  <strong>Пример:</strong> &ldquo;Луната в астрологията - символизъм и значение&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Concrete Example with Internal Linking */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Конкретен пример: Категория &ldquo;Planets&rdquo;
            </h4>
            <div className="space-y-3 text-sm">
              {/* Cluster example */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30">
                <div className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  🌟 CLUSTER: &ldquo;Планети в астрологията - пълно ръководство&rdquo;
                </div>
                <div className="text-zinc-400 space-y-1 text-xs">
                  <p>• Какво са планети (общ преглед)</p>
                  <p>• Класификация на планетите</p>
                  <p>• Накратко за всички 7 планети</p>
                  <p className="text-blue-300 mt-2">→ Съдържа линкове към 7 pillar статии за отделните планети</p>
                </div>
              </div>

              {/* Pillars example */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-300 mb-1 text-xs">
                    📚 PILLAR: &ldquo;Слънцето в астрологията&rdquo;
                  </div>
                  <div className="text-zinc-500 text-xs space-y-1">
                    <p>• Само за Слънцето (5,500 думи)</p>
                    <p>• Слънцето в 12 знака</p>
                    <p>• Слънцето в 12 къщи</p>
                    <p className="text-green-300 mt-1">↑ Линк към cluster</p>
                    <p className="text-green-300">→ Линк към &ldquo;Луната&rdquo;, &ldquo;Асцендент&rdquo;</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-300 mb-1 text-xs">
                    📚 PILLAR: &ldquo;Луната в астрологията&rdquo;
                  </div>
                  <div className="text-zinc-500 text-xs space-y-1">
                    <p>• Само за Луната (5,500 думи)</p>
                    <p>• Луната в 12 знака</p>
                    <p>• Емоционален живот</p>
                    <p className="text-green-300 mt-1">↑ Линк към cluster</p>
                    <p className="text-green-300">→ Линк към &ldquo;Слънцето&rdquo;, &ldquo;Венера&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Linking strategy */}
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="font-semibold text-green-300 mb-2">🔗 Въртешен LinkBuilding</div>
                <div className="text-zinc-400 text-xs space-y-1">
                  <p><strong>Cluster статия:</strong> Линкове към всички 7 pillars (Слънце, Луна, Меркурий, Венера, Марс, Юпитер, Сатурн)</p>
                  <p><strong>Всеки Pillar:</strong> Линк обратно към cluster + 2-3 related pillars</p>
                  <p className="text-green-300 mt-2">→ Читателят остава на платформата защото има къде да се движи!</p>
                </div>
              </div>
            </div>
          </div>

          {/* How to use Dashboard */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-green-400" />
              Как да използваш Dashboard
            </h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Dashboard-ът показва общата структура на съдържанието:</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                <li><strong>Статистики:</strong> Общ брой clusters, pillars, липсващи и без cluster</li>
                <li><strong>Cluster групи:</strong> Всеки cluster с неговите pillars и % завършеност</li>
                <li><strong>Зелени pillars:</strong> Вече създадени и публикувани</li>
                <li><strong>Оранжеви pillars:</strong> Предложени за създаване (липсват)</li>
                <li><strong>Червени pillars:</strong> Без cluster - трябва да им се присвои категория</li>
              </ul>
            </div>
          </div>

          {/* How to create content */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Как да създаваш съдържание
            </h4>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Стъпка 1: Избери тип и категория</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                  <li><strong>Cluster:</strong> Създавай първо за нова категория знания</li>
                  <li><strong>Pillar:</strong> Създавай след cluster, за конкретни подтеми</li>
                  <li><strong>Категории:</strong> Guides, Planets, Signs, Houses, Aspects</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Стъпка 2: Въведи заглавие и ключови думи</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                  <li>Избери ясно, SEO-оптимизирано заглавие</li>
                  <li>Добави релевантни keywords (незадължително)</li>
                  <li>Целеви думи се настройват автоматично според типа</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Стъпка 3: Генерирай с AI</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                  <li>Натисни &ldquo;Генерирай Guide&rdquo; бутона</li>
                  <li>AI ще създаде пълно оптимизирано съдържание</li>
                  <li>Прегледай резултата в preview режим</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Стъпка 4: Публикувай</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                  <li>Провери съдържанието и метриките</li>
                  <li>Редактирай ако е нужно</li>
                  <li>Натисни &ldquo;Публикувай&rdquo; за да го направиш публичен</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50">💡 Добри практики</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <ul className="space-y-1 text-zinc-400">
                  <li>✅ Създавай cluster преди pillars в дадена категория</li>
                  <li>✅ Попълвай липсващите pillars за пълна структура</li>
                  <li>✅ Следи процента на завършеност на всеки cluster</li>
                  <li>✅ Присвоявай категория на orphan pillars</li>
                  <li>✅ Използвай AI Suggestions за идеи за ново съдържание</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Categories Explained */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50">📋 Обяснение на категориите</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-purple-300 mb-1">Planets</div>
                <div className="text-xs text-zinc-500">7 pillars: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-blue-300 mb-1">Signs</div>
                <div className="text-xs text-zinc-500">12 pillars: Всички зодиакални знака</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-green-300 mb-1">Houses</div>
                <div className="text-xs text-zinc-500">12 pillars: 1st-12th House</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-orange-300 mb-1">Aspects</div>
                <div className="text-xs text-zinc-500">5 pillars: Conjunction, Opposition, Trine, Square, Sextile</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-pink-300 mb-1">Guides</div>
                <div className="text-xs text-zinc-500">Общи ръководства и техники</div>
              </div>
            </div>
          </div>

          {/* How to Break Down Topics */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-zinc-50">🎯 Как да разбиеш голяма тема на подтеми?</h4>
            <div className="space-y-3 text-sm">
              <p className="text-zinc-300">Когато имаш широка тема, помисли: &ldquo;Какви са отделните компоненти?&rdquo;</p>

              {/* Example 1 */}
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Пример 1: Тема &ldquo;Планети&rdquo;</div>
                <div className="text-zinc-400 text-xs space-y-1">
                  <p className="text-purple-300">→ CLUSTER: &ldquo;Планети в астрологията - обзор&rdquo;</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Слънцето в астрологията&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Луната в астрологията&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Меркурий в астрологията&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Венера в астрологията&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Марс в астрологията&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Юпитер в астрологията&rdquo;</p>
                    <p className="text-blue-300">└─ PILLAR: &ldquo;Сатурн в астрологията&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Example 2 */}
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Пример 2: Тема &ldquo;Зодиакални знаци&rdquo;</div>
                <div className="text-zinc-400 text-xs space-y-1">
                  <p className="text-purple-300">→ CLUSTER: &ldquo;Зодиакални знаци - пълно ръководство&rdquo;</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Овен - характер и съвместимост&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Телец - характер и съвместимост&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Близнаци - характер и съвместимост&rdquo;</p>
                    <p className="text-zinc-500">... (още 9 знака)</p>
                  </div>
                </div>
              </div>

              {/* Example 3 */}
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                <div className="font-semibold text-zinc-200 mb-2">Пример 3: Тема &ldquo;Астрологични техники&rdquo;</div>
                <div className="text-zinc-400 text-xs space-y-1">
                  <p className="text-purple-300">→ CLUSTER: &ldquo;Астрологични техники за напреднали&rdquo;</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Прогресии - как работят&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Соларни връщания - годишни прогнози&rdquo;</p>
                    <p className="text-blue-300">├─ PILLAR: &ldquo;Синастрия - анализ на връзки&rdquo;</p>
                    <p className="text-blue-300">└─ PILLAR: &ldquo;Транзити - времеви прогнози&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Logic */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="font-semibold text-indigo-300 mb-2">💡 Логиката зад разбиването</div>
                <ul className="space-y-1 text-zinc-400 text-xs">
                  <li>✓ <strong>Cluster = категория</strong> (напр. &ldquo;всички планети&rdquo;)</li>
                  <li>✓ <strong>Pillar = елемент</strong> (напр. &ldquo;една конкретна планета&rdquo;)</li>
                  <li>✓ Ако темата има <strong>естествени подкатегории</strong> → създай cluster + pillars</li>
                  <li>✓ Ако темата е <strong>много широка</strong> → раздели я на логически части</li>
                  <li>✓ <strong>Правило:</strong> 1 cluster = 4-12 pillars (оптимално)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
