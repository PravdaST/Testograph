'use client';

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Flame, Gift, Shield, Clock, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function PricingV2() {
  // Countdown Timer State (24 hours from first visit)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Scarcity Counters (simulated limited inventory)
  const [inventory, setInventory] = useState({
    starter: 52,
    performance: 23,
    complete: 14
  });

  // Check if first-time visitor
  const [isFirstTimeVisitor, setIsFirstTimeVisitor] = useState(false);

  useEffect(() => {
    // Check if first visit
    const hasVisited = localStorage.getItem('testograph_visited');
    if (!hasVisited) {
      setIsFirstTimeVisitor(true);
      localStorage.setItem('testograph_visited', 'true');
    }

    // Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    // Simulate inventory decrease (every 3-7 minutes a unit sells)
    const inventoryTimer = setInterval(() => {
      setInventory(prev => ({
        starter: Math.max(35, prev.starter - Math.floor(Math.random() * 2)),
        performance: Math.max(15, prev.performance - Math.floor(Math.random() * 2)),
        complete: Math.max(8, prev.complete - Math.floor(Math.random() * 2))
      }));
    }, 180000); // 3 minutes

    return () => {
      clearInterval(timer);
      clearInterval(inventoryTimer);
    };
  }, []);

  const packages = [
    {
      id: 'starter',
      name: 'STARTER',
      subtitle: 'Започни правилно',
      price: 67,
      originalValue: 214,
      perDay: 2.23,
      duration: '30 дни',
      quantity: '1x TESTOUP (30 дози)',
      badge: null,
      features: [
        '1x TESTOUP добавка (30 дози)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      bonuses: null,
      forWho: [
        'Искаш да тестваш дали системата работи',
        'Имаш вече опит с тренировки',
        'Искаш минимална инвестиция'
      ]
    },
    {
      id: 'performance',
      name: 'PERFORMANCE',
      subtitle: 'Ускори резултатите',
      price: 127,
      originalValue: 526,
      savings: 399,
      savingsPercent: 76,
      perDay: 2.12,
      duration: '60 дни',
      quantity: '2x TESTOUP (60 дози)',
      badge: { icon: Star, text: 'ПОПУЛЯРЕН', color: 'from-amber-500 to-orange-500' },
      features: [
        '2x TESTOUP добавка (60 дози = 2 месеца)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      bonuses: [
        {
          title: 'NUTRITION TRACKER APP',
          items: [
            'Автоматично броене на калории',
            'Макрос tracking (протеин/въглехидрати/мазнини)',
            'Barcode scanner за храни',
            'База данни с 500+ български храни'
          ]
        },
        {
          title: 'TRAINING TRACKER APP',
          items: [
            'Логване на тренировки (сетове/повторения/тежест)',
            'Прогресивен overload калкулатор',
            'История на всички тренировки',
            'Персонални рекорди (PRs)'
          ]
        }
      ],
      forWho: [
        'Сериозен си за резултатите',
        'Искаш да проследяваш всичко точно',
        '2 месеца = достатъчно време за видими резултати'
      ]
    },
    {
      id: 'complete',
      name: 'COMPLETE SYSTEM',
      subtitle: 'Пълна трансформация',
      price: 179,
      originalValue: 887,
      savings: 708,
      savingsPercent: 80,
      perDay: 1.99,
      duration: '90 дни',
      quantity: '3x TESTOUP (90 дози)',
      badge: { icon: Flame, text: 'MAX VALUE', color: 'from-red-500 to-orange-500' },
      features: [
        '3x TESTOUP добавка (90 дози = 3 месеца)',
        'Достъп до TESTOGRAPH система',
        '4 готови протокола',
        'Ежедневен чек-ин',
        'Проследяване на напредък',
        'Telegram общност'
      ],
      bonuses: [
        {
          title: 'NUTRITION TRACKER APP',
          items: ['Калории + макрос tracking', 'Barcode scanner, 500+ храни']
        },
        {
          title: 'TRAINING TRACKER APP',
          items: ['Логване на тренировки', 'Progressive overload tracking']
        },
        {
          title: 'SLEEP OPTIMIZER APP',
          items: ['Sleep tracking и анализ', 'Сутрешен readiness score', 'Препоръки за подобрение']
        },
        {
          title: 'BODY METRICS APP',
          items: ['Тегло, мускулна маса, мазнини', 'Progress photos с overlay comparison', 'Обиколки (гърди, ръце, крака, талия)']
        },
        {
          title: 'SUPPLEMENT SCHEDULER APP',
          items: ['Напомняния кога да вземеш какво', 'Оптимален timing за всяка добавка', 'Tracker за съчетаване с храна']
        }
      ],
      extras: [
        'БЕЗПЛАТНА доставка',
        'Приоритетна поддръжка'
      ],
      forWho: [
        'Искаш ПЪЛНА трансформация',
        'Сериозен си за дългосрочни резултати',
        'Искаш ВСИЧКИ инструменти',
        '3 месеца = постоянна промяна'
      ]
    }
  ];

  const getInventoryByPackageId = (id: string) => {
    if (id === 'starter') return inventory.starter;
    if (id === 'performance') return inventory.performance;
    if (id === 'complete') return inventory.complete;
    return 0;
  };

  const getInventoryColor = (stock: number) => {
    if (stock <= 10) return 'text-red-600 dark:text-red-400';
    if (stock <= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getInventoryBarColor = (stock: number) => {
    if (stock <= 10) return 'bg-red-500';
    if (stock <= 20) return 'bg-orange-500';
    return 'bg-amber-500';
  };

  return (
    <section id="pricing" className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      <AnimatedBackground variant="mixed" opacity={0.1} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Countdown Timer - URGENT */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-white/20">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                  <p className="text-sm md:text-base font-bold uppercase tracking-wide">
                    {isFirstTimeVisitor ? '🎁 ПЪРВА ПОРЪЧКА БОНУС' : '⚡ ОГРАНИЧЕНА ОФЕРТА'}
                  </p>
                </div>

                <h3 className="text-2xl md:text-4xl font-bold">
                  {isFirstTimeVisitor
                    ? 'Специална цена за първа поръчка изтича след:'
                    : 'Текущите цени валидни още:'}
                </h3>

                {/* Timer Display */}
                <div className="flex items-center justify-center gap-3 md:gap-6">
                  {[
                    { value: timeLeft.hours, label: 'ЧАСА' },
                    { value: timeLeft.minutes, label: 'МИНУТИ' },
                    { value: timeLeft.seconds, label: 'СЕКУНДИ' }
                  ].map((unit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 md:px-6 py-3 md:py-4 border-2 border-white/30">
                        <div className="text-4xl md:text-6xl font-bold tabular-nums">
                          {String(unit.value).padStart(2, '0')}
                        </div>
                        <div className="text-xs md:text-sm font-semibold opacity-90 mt-1">
                          {unit.label}
                        </div>
                      </div>
                      {idx < 2 && <div className="text-3xl md:text-5xl font-bold">:</div>}
                    </div>
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
                  <p className="text-sm md:text-base font-semibold">
                    {isFirstTimeVisitor
                      ? '🎯 След изтичане на таймера цените се връщат на нормалните.'
                      : '⚠️ Следващ batch производство е след 3 седмици. Текущите цени важат само за този batch.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border-2 border-red-600/40 rounded-full px-6 py-3 mb-4 animate-pulse">
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">ОГРАНИЧЕНА НАЛИЧНОСТ</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText from="from-red-600" via="via-orange-600" to="to-amber-600">
                ПОСЛЕДНИТЕ ПАКЕТИ ОТ ТОЗИ BATCH
              </GradientText>
            </h2>

            <p className="text-xl text-foreground font-semibold max-w-2xl mx-auto">
              Произвеждаме на партиди. Следващо производство: 3 седмици.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-600 dark:text-green-400">30 дни гаранция</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-600 dark:text-blue-400">94% виждат резултати</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const isPopular = pkg.badge?.text === 'ПОПУЛЯРЕН';
              const isBestValue = pkg.badge?.text === 'MAX VALUE';
              const stock = getInventoryByPackageId(pkg.id);
              const stockPercent = (stock / 60) * 100; // Assuming max was 60

              return (
                <div key={pkg.id} className={`relative ${isPopular || isBestValue ? 'lg:-mt-4 lg:mb-4' : ''}`}>
                  {/* Badge */}
                  {pkg.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r ${pkg.badge.color} text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 whitespace-nowrap`}>
                      <pkg.badge.icon className="w-4 h-4" />
                      {pkg.badge.text}
                    </div>
                  )}

                  <GlassCard
                    className={`p-8 h-full flex flex-col ${isPopular || isBestValue ? 'border-primary/50 shadow-2xl shadow-primary/20' : ''} ${stock <= 10 ? 'border-red-500/50' : ''}`}
                  >
                    {/* Inventory Warning - TOP */}
                    <div className="mb-4 -mt-2">
                      <div className={`bg-gradient-to-r ${stock <= 10 ? 'from-red-600/20 to-orange-600/20 border-red-600/40' : stock <= 20 ? 'from-orange-600/20 to-amber-600/20 border-orange-600/40' : 'from-amber-600/20 to-yellow-600/20 border-amber-600/40'} backdrop-blur-sm border-2 rounded-xl p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`w-4 h-4 ${getInventoryColor(stock)} ${stock <= 10 ? 'animate-pulse' : ''}`} />
                            <span className={`text-sm font-bold ${getInventoryColor(stock)}`}>
                              {stock <= 10 ? '🔥 ПОЧТИ ИЗЧЕРПАН' : stock <= 20 ? '⚠️ МАЛКО НА СКЛАД' : '📦 ОГРАНИЧЕН'}
                            </span>
                          </div>
                          <span className={`text-sm font-bold ${getInventoryColor(stock)}`}>
                            Само {stock} бр
                          </span>
                        </div>
                        {/* Stock Bar */}
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getInventoryBarColor(stock)} transition-all duration-1000`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                      <p className="text-muted-foreground">{pkg.subtitle}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-border/50">
                      <div className="text-5xl font-bold mb-2">
                        <GradientText>{pkg.price} лв</GradientText>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{pkg.perDay} лв/ден</p>
                      <p className="text-sm text-muted-foreground">за {pkg.duration}</p>

                      {pkg.savings && (
                        <div className="mt-3 inline-block bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            Спестяваш {pkg.savings} лв ({pkg.savingsPercent}%)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-4 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}

                      {/* Bonuses */}
                      {pkg.bonuses && (
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                            <Gift className="w-5 h-5" />
                            <span>БОНУС APPS:</span>
                          </div>
                          {pkg.bonuses.map((bonus, idx) => (
                            <div key={idx} className="mb-4 bg-primary/5 rounded-lg p-3">
                              <p className="font-semibold text-sm text-foreground mb-2">{bonus.title}</p>
                              <div className="space-y-1">
                                {bonus.items.map((item, i) => (
                                  <p key={i} className="text-xs text-muted-foreground">→ {item}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Extras */}
                      {pkg.extras && (
                        <div className="mt-4 space-y-2">
                          {pkg.extras.map((extra, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2">
                              <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{extra}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Urgency Message Before CTA */}
                    {stock <= 15 && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 animate-pulse" />
                          {stock <= 10
                            ? 'Последните единици! Поръчай СЕГА.'
                            : 'Изчерпва се бързо. Не губи момента.'}
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                        isPopular || isBestValue
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-card border-2 border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                      } ${stock <= 10 ? 'animate-pulse' : ''}`}
                    >
                      <span>
                        {stock <= 10 ? '🔥 ХВАНИ ПОСЛЕДЕН' : 'Избирам ' + pkg.name}
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Urgency Reinforcement */}
                    {isFirstTimeVisitor && (
                      <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ✓ Първа поръчка бонус активен за още {timeLeft.hours}ч {timeLeft.minutes}м
                        </p>
                      </div>
                    )}

                    {/* Value Statement */}
                    <div className="mt-4 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Стойност: <span className="line-through">{pkg.originalValue} лв</span>
                      </p>
                      {stock <= 20 && (
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">
                          ⚠️ След изчерпване: 3 седмици изчакване
                        </p>
                      )}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          {/* Package Guidance */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              <GradientText>КОЙ ПАКЕТ Е ЗА ТЕБ?</GradientText>
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <GlassCard key={pkg.id} className="p-6">
                  <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    {pkg.name} ({pkg.price} лв)
                    {pkg.badge && <pkg.badge.icon className="w-5 h-5 text-primary" />}
                  </h4>
                  <div className="space-y-2">
                    {pkg.forWho.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-border/50">
            {[
              { icon: Shield, label: '30-дневна гаранция' },
              { icon: Gift, label: 'Безплатна доставка' },
              { icon: Check, label: 'Сигурно плащане' }
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{badge.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
