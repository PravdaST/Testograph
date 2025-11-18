import React from 'react';
import { Leaf, FlaskRound as Flask, Award, Shield, Check } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function Supplement() {
  const ingredients = [
    { name: 'TRIBULUS TERRESTRIS', dosage: '600 mg', benefit: 'Естествено стимулира тестостерон' },
    { name: 'ASHWAGANDHA', dosage: '400 mg', benefit: 'Намалява кортизол с до 28%' },
    { name: 'ВИТАМИН D3', dosage: '2400 IU', benefit: 'Критичен за тестостерон' },
    { name: 'ЦИНК CITRATE', dosage: '50 mg', benefit: 'Най-важният минерал' },
    { name: 'МАГНЕЗИЙ', dosage: '400 mg', benefit: 'Повишава свободен тестостерон' },
    { name: 'ВИТАМИН K2', dosage: '100 mcg', benefit: 'Работи синергично с D3' },
    { name: 'ВИТАМИН B6', dosage: '10 mg', benefit: 'Намалява пролактин' },
    { name: 'ВИТАМИН B12', dosage: '600 mcg', benefit: 'Експлозивна енергия' },
    { name: 'ФОЛАТ (5-MTHF)', dosage: '400 mcg', benefit: 'Подобрява производство на сперма' },
    { name: 'ВИТАМИН E', dosage: '270 mg', benefit: 'Мощен антиоксидант' },
    { name: 'ВИТАМИН C', dosage: '200 mg', benefit: 'Намалява кортизол' },
    { name: 'СЕЛЕН', dosage: '200 mcg', benefit: 'Критичен за тестостерон' }
  ];

  const certifications = [
    'ЕС ПРОИЗВОДСТВО (България)',
    'БАБХ РЕГИСТРАЦИЯ',
    'GMP СЕРТИФИЦИРАН',
    '100% НАТУРАЛНО',
    'БЕЗ ИЗКУСТВЕНИ ДОБАВКИ',
    'НЕ Е СТЕРОИД'
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <Container>
        <SectionHeader
          headline="TESTOUP ДОБАВКА"
          description="60 капсули (30 дози) • 2 капсули дневно"
          icon={Flask}
        />

        {/* Product Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600">60</div>
            <div className="text-sm text-neutral-600">Капсули</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">30</div>
            <div className="text-sm text-neutral-600">Дози</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600">12</div>
            <div className="text-sm text-neutral-600">Активни съставки</div>
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-neutral-900 mb-2">{ingredient.name}</h4>
              <p className="text-sm font-semibold text-primary-600 mb-2">{ingredient.dosage}</p>
              <p className="text-sm text-neutral-700">{ingredient.benefit}</p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {certifications.map((cert, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200 shadow-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-neutral-900">{cert}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Value Statement */}
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-neutral-700">
            СТОЙНОСТ: <span className="text-2xl text-primary-700">67 лв</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
