'use client';

import React, { useState } from 'react';
import { FileText, Utensils, Moon, Pill, LineChart, Users, CheckCircle } from 'lucide-react';
import Container from '../shared/Container';
import SectionHeader from '../shared/SectionHeader';

export default function SystemFeatures() {
  const [activeTab, setActiveTab] = useState(0);

  const protocols = [
    {
      icon: FileText,
      title: 'ТРЕНИРОВЪЧЕН ПРОТОКОЛ',
      color: 'blue',
      features: [
        'Точна програма за 4 седмици',
        'Кои упражнения, колко сетове/повторения',
        'Как да прогресираш всяка седмица',
        'Оптимизирана за тестостерон и растеж'
      ]
    },
    {
      icon: Utensils,
      title: 'ХРАНИТЕЛЕН ПРОТОКОЛ',
      color: 'green',
      features: [
        'Какво да ядеш за оптимални хормони',
        'Списъци с най-добрите храни',
        'Примерни менюта за цял ден',
        'Макрос калкулатор според теглото ти'
      ]
    },
    {
      icon: Moon,
      title: 'ПРОТОКОЛ ЗА СЪН И СТРЕС',
      color: 'purple',
      features: [
        'Как да спиш дълбоко и качествено',
        'Техники за управление на стрес',
        'Ритуали преди лягане',
        'Оптимизация на кортизол'
      ]
    },
    {
      icon: Pill,
      title: 'ПРОТОКОЛ ЗА ДОБАВКИ',
      color: 'orange',
      features: [
        'Точно КОГА да вземаш добавката',
        'С какво да я комбинираш',
        'Какво да избягваш',
        'Максимална ефективност'
      ]
    }
  ];

  const interactiveFeatures = [
    {
      title: 'Ежедневен Чек-ин',
      description: '5 въпроса (1-10 скала): Общо усещане, Енергия, Следване на плана, Сутрешна ерекция, Качество на съня',
      time: '2 минути'
    },
    {
      title: 'Проследяване на Напредък',
      description: 'Виждаш в реално време: на кой ден си, колко % завършен, графики на промените, най-добри/лоши дни',
      time: 'Реално време'
    },
    {
      title: 'Telegram Общност',
      description: 'Достъп до private Telegram група с други мъже, споделяне на напредък, accountability partners',
      time: '127 активни'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        <SectionHeader
          headline="TESTOGRAPH СИСТЕМА"
          description="Стойност 147 лв - БЕЗПЛАТНО с покупката"
        />

        {/* 4 Protocols Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {protocols.map((protocol, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-200"
            >
              <div className={`w-12 h-12 bg-${protocol.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                <protocol.icon className={`w-6 h-6 text-${protocol.color}-600`} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-4">{protocol.title}</h3>
              <div className="space-y-2">
                {protocol.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Features */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Интерактивни функции</h3>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {interactiveFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === index
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-neutral-50 to-primary-50 rounded-2xl p-8 border border-neutral-200">
            <div className="flex items-start gap-4 mb-4">
              {activeTab === 0 && <LineChart className="w-8 h-8 text-primary-600 flex-shrink-0" />}
              {activeTab === 1 && <LineChart className="w-8 h-8 text-primary-600 flex-shrink-0" />}
              {activeTab === 2 && <Users className="w-8 h-8 text-primary-600 flex-shrink-0" />}
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2">
                  {interactiveFeatures[activeTab].title}
                </h4>
                <p className="text-neutral-700">{interactiveFeatures[activeTab].description}</p>
                <p className="text-sm text-primary-700 font-semibold mt-2">
                  {interactiveFeatures[activeTab].time}
                </p>
              </div>
            </div>

            {/* App Screenshot Placeholder */}
            <div className="mt-6 bg-neutral-200 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <p className="font-medium">APP SCREENSHOT</p>
                <p className="text-sm">{interactiveFeatures[activeTab].title} Interface</p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Statement */}
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-neutral-700">
            СТОЙНОСТ НА СИСТЕМАТА: <span className="text-2xl text-primary-700">147 лв</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
