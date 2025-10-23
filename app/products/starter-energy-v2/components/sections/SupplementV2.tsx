import React from 'react';
import { Pill, CheckCircle, Award, Shield } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function SupplementV2() {
  const ingredients = [
    {
      emoji: '🌿',
      name: 'TRIBULUS TERRESTRIS EXTRACT',
      dosage: '600 mg',
      benefits: [
        'Естествено стимулира производството на тестостерон',
        'Подобрява либидо и сексуална функция',
        'Увеличава сила и мускулна издръжливост',
        'Най-висока дозировка на българския пазар'
      ]
    },
    {
      emoji: '🍃',
      name: 'ASHWAGANDHA EXTRACT',
      dosage: '400 mg',
      subtitle: '(Withania somnifera)',
      benefits: [
        'Намалява кортизол (стрес хормон) с до 28%',
        'Повишава тестостерон при стресирани мъже',
        'Подобрява качество на сперма и фертилитет',
        'Увеличава мускулна маса и сила'
      ]
    },
    {
      emoji: '☀️',
      name: 'ВИТАМИН D3',
      dosage: '2400 IU / 35 mcg',
      rdp: '700% РДП*',
      benefits: [
        'Действа като хормон в тялото',
        'Критичен за производство на тестостерон',
        'Подобрява настроение и имунитет',
        '90% българи имат дефицит'
      ]
    },
    {
      emoji: '⚡',
      name: 'ЦИНК CITRATE',
      dosage: '50 mg / 15 mg елементарен',
      rdp: '150% РДП',
      benefits: [
        'Най-важният минерал за тестостерон',
        'Блокира ензима ароматаза (естроген)',
        'Подобрява качество на сперма',
        'Ускорява възстановяване след тренировка'
      ]
    },
    {
      emoji: '💪',
      name: 'МАГНЕЗИЙ BISGLYCINATE',
      dosage: '400 mg / 44 mg елементарен',
      benefits: [
        'Най-добре усвоимата форма на магнезий',
        'Повишава свободен тестостерон',
        'Подобрява качество на съня',
        'Намалява мускулни крампи и умора'
      ]
    },
    {
      emoji: '🦴',
      name: 'ВИТАМИН K2 (MK7)',
      dosage: '100 mcg',
      benefits: [
        'Работи синергично с витамин D3',
        'Насочва калция към костите (не в артериите)',
        'Подобрява здравето на костите',
        'Подкрепя кардиоваскуларното здраве'
      ]
    },
    {
      emoji: '⚡',
      name: 'ВИТАМИН B6',
      dosage: '10 mg',
      rdp: '714% РДП',
      benefits: [
        'Намалява пролактин (блокира тестостерон)',
        'Подобрява настроение и енергия',
        'Подпомага протеинов метаболизъм',
        'Критичен за невротрансмитери'
      ]
    },
    {
      emoji: '🔋',
      name: 'ВИТАМИН B12',
      dosage: '600 mcg',
      rdp: '24000% РДП',
      benefits: [
        'Експлозивна енергия през целия ден',
        'Подобрява концентрация и фокус',
        'Критичен за производство на червени кръвни клетки',
        'Мега доза за максимален ефект'
      ]
    },
    {
      emoji: '🧬',
      name: 'ВИТАМИН B9 / FOLATE (5-MTHF)',
      dosage: '400 mcg',
      rdp: '200% РДП',
      benefits: [
        'Най-активната форма (не фолиева киселина)',
        'Подобрява производство на сперма',
        'Подкрепя ДНК синтез и клетъчно делене',
        'Важен за кардиоваскуларно здраве'
      ]
    },
    {
      emoji: '💥',
      name: 'ВИТАМИН E',
      dosage: '270 mg',
      rdp: '2250% РДП',
      benefits: [
        'Мощен антиоксидант',
        'Защитава клетъчните мембрани',
        'Подобрява фертилитет и либидо',
        'Подкрепя имунната система'
      ]
    },
    {
      emoji: '🛡️',
      name: 'ВИТАМИН C',
      dosage: '200 mg',
      rdp: '250% РДП',
      benefits: [
        'Намалява кортизол след тренировка',
        'Подобрява усвояването на желязо',
        'Мощна антиоксидантна защита',
        'Подкрепа за имунната система'
      ]
    },
    {
      emoji: '🔬',
      name: 'СЕЛЕН (L-Selenomethionine)',
      dosage: '200 mcg',
      rdp: '364% РДП',
      benefits: [
        'Критичен за производство на тестостерон',
        'Подобрява подвижност на сперматозоиди',
        'Мощен антиоксидант',
        'Подкрепа за щитовидната жлеза'
      ]
    }
  ];

  const certifications = [
    { icon: Shield, label: 'ЕС ПРОИЗВОДСТВО', subtitle: 'България' },
    { icon: Award, label: 'БАБХ РЕГИСТРАЦИЯ', subtitle: 'Официално' },
    { icon: CheckCircle, label: 'GMP СЕРТИФИЦИРАН', subtitle: 'Обект' },
    { icon: Pill, label: '100% НАТУРАЛНО', subtitle: 'Без изкуствени добавки' }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background to-amber-500/5">
      <AnimatedBackground variant="circles" opacity={0.08} colors={{ primary: 'rgb(245, 158, 11)', secondary: 'rgb(249, 115, 22)', tertiary: 'rgb(234, 88, 12)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-full px-4 py-2 mb-4">
              <Pill className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Стойност 67 лв</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-amber-500" via="via-orange-500" to="to-red-500">
                💊 TESTOUP
              </GradientText>
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg text-muted-foreground">
              <div>60 капсули (30 дози)</div>
              <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
              <div>Дозировка: 2 капсули дневно</div>
            </div>
          </div>

          {/* Ingredients Title */}
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              <GradientText>12 АКТИВНИ СЪСТАВКИ</GradientText>
            </h3>
            <p className="text-muted-foreground">Научно доказани дозировки за максимална ефективност</p>
          </div>

          {/* Ingredients Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ingredient, index) => (
              <GlassCard key={index} className="group p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {ingredient.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground leading-tight mb-1">
                      {ingredient.name}
                    </h4>
                    {ingredient.subtitle && (
                      <p className="text-xs text-muted-foreground mb-1">{ingredient.subtitle}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {ingredient.dosage}
                      </span>
                      {ingredient.rdp && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          {ingredient.rdp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  {ingredient.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Certifications */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-500/20 rounded-3xl p-8 md:p-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-bold text-foreground mb-1">{cert.label}</p>
                    <p className="text-sm text-muted-foreground">{cert.subtitle}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-border/50 text-center space-y-2">
              <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-foreground">
                <span>✓ БЕЗ ИЗКУСТВЕНИ ДОБАВКИ</span>
                <span>✓ НЕ Е СТЕРОИД</span>
                <span>✓ 100% НАТУРАЛНО</span>
              </div>
              <p className="text-xs text-muted-foreground">*РДП = Препоръчителна дневна порция</p>
            </div>
          </div>

          {/* Product Visual Placeholder */}
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-3xl flex items-center justify-center border-2 border-amber-500/20 shadow-2xl">
              <div className="text-center space-y-2">
                <Pill className="w-16 h-16 mx-auto text-amber-600 dark:text-amber-400" />
                <p className="text-muted-foreground font-medium">Продуктова снимка: testoup-bottle.webp</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
