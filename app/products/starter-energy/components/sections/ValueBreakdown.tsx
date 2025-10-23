import React from 'react';
import Container from '../shared/Container';

export default function ValueBreakdown() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-amber-50">
      <Container maxWidth="lg">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-primary-200">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-8">
            ПЪЛНА СТОЙНОСТ
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
              <span className="text-lg text-neutral-700">Приложение с 4 протокола + чек-ин + проследяване</span>
              <span className="text-xl font-semibold text-neutral-900">147 лв</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
              <span className="text-lg text-neutral-700">TESTOUP добавка (30 дози)</span>
              <span className="text-xl font-semibold text-neutral-900">67 лв</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t-2 border-neutral-300 mb-6">
            <span className="text-xl font-bold text-neutral-900">ОБЩА СТОЙНОСТ</span>
            <span className="text-2xl font-bold text-neutral-400 line-through">214 лв</span>
          </div>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white">
            <p className="text-sm font-semibold mb-2">ТВОЯ ЦЕНА</p>
            <p className="text-5xl md:text-6xl font-bold mb-3">67 лв</p>
            <p className="text-lg opacity-90">2.23 лв на ден - по-евтино от кафе</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-green-700">
              Получаваш протоколите на стойност 147 лв БЕЗПЛАТНО.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
