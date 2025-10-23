import React from 'react';
import { HelpCircle, TrendingUp, Award, Heart } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function WhyCheap() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container maxWidth="4xl">
        <SectionHeader
          headline="ЗАЩО ТОЛКОВА ЕВТИНО?"
          description="Валиден въпрос. Ето истината:"
          icon={HelpCircle}
        />

        {/* Price Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-neutral-50 rounded-xl p-8 border-2 border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">ДРУГИ МАРКИ:</h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b border-neutral-300">
                <span>Добавка:</span>
                <span className="font-semibold">70-90 лв</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-300">
                <span>Треньор:</span>
                <span className="font-semibold">200 лв/месец</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-300">
                <span>Нутриционист:</span>
                <span className="font-semibold">150 лв</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-300">
                <span>План за тренировки:</span>
                <span className="font-semibold">100 лв</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-neutral-400">
                <span className="font-bold">ОБЩО:</span>
                <span className="text-2xl font-bold text-red-600">500+ лв</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-8 border-2 border-primary-500">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">TESTOGRAPH:</h3>
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-lg text-neutral-700 mb-4">ВСИЧКО за</p>
              <p className="text-6xl font-bold text-primary-600 mb-4">67 лв</p>
              <p className="text-sm text-neutral-600">2.23 лв на ден</p>
            </div>
          </div>
        </div>

        {/* 3 Reasons */}
        <div className="space-y-8">
          <div className="bg-primary-50 rounded-xl p-8 border border-primary-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Искаме да успееш
                </h4>
                <p className="text-neutral-700">
                  Опитали сме другия подход: Скъпи продукти → хората купуват веднъж → разочароват се → никога повече.
                </p>
                <p className="text-neutral-900 font-semibold mt-2">
                  Новия подход: Евтин старт → виждаш резултати → ставаш клиент завинаги.
                </p>
                <p className="text-primary-700 font-bold mt-2">
                  За нас е по-изгодно ДА УСПЕЕШ.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-8 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Искаме добра репутация
                </h4>
                <p className="text-neutral-700">
                  Българският пазар е пълен с измами. "Чудо хапчета" за 150 лв. Нула резултати.
                  Хората са изгубили доверие.
                </p>
                <p className="text-neutral-900 font-semibold mt-2">
                  НИЕ искаме да сме различни:
                </p>
                <ul className="mt-2 space-y-1 text-neutral-700">
                  <li>• Даваме ти ВСИЧКО (не само хапчета)</li>
                  <li>• На честна цена (не те дерем)</li>
                  <li>• Гарантираме резултати (не само обещания)</li>
                </ul>
                <p className="text-green-700 font-bold mt-2">
                  Когато видиш че работи → разказваш на приятели. Това е най-добрата реклама.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-8 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-600" />
                  Не сме алчни
                </h4>
                <p className="text-neutral-700">
                  Можехме да направим: Добавка 89 лв + Приложение 19 лв/месец + Протоколи 49 лв = 157 лв първия месец.
                </p>
                <p className="text-neutral-900 font-semibold mt-2">
                  Но НЕ. Защото искаме да има колкото се може повече мъже които ще имат достъп до правилната информация и инструменти.
                </p>
                <p className="text-amber-700 font-bold mt-2">
                  67 лв = цената на добавката. Всичко друго е ПОДАРЪК.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Statement */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center">
          <p className="text-xl md:text-2xl font-bold mb-4">
            Не сме като останалите които само искат парите ти.
          </p>
          <p className="text-lg">
            Искаме да УСПЕЕШ. Искаме да видиш РЕЗУЛТАТИ. Искаме да ни ВЯРВАШ.
          </p>
          <p className="text-lg font-semibold mt-4">
            Затова ти даваме 100% системата на цената на 20% (добавката).
          </p>
        </div>
      </Container>
    </section>
  );
}
