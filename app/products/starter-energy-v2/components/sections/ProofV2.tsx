import React from 'react';
import { Users, TrendingUp, Dumbbell, Battery, Moon, CheckCircle } from 'lucide-react';
import AnimatedBackground from '../shared/AnimatedBackground';
import GradientText from '../shared/GradientText';
import GlassCard from '../shared/GlassCard';

export default function ProofV2() {
  const stats = [
    {
      icon: Users,
      value: '127',
      label: 'Потребители',
      description: 'следват системата',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckCircle,
      value: '94%',
      label: 'Успех Rate',
      description: 'казват "работи"',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Dumbbell,
      value: '+18%',
      label: 'Повече сила',
      description: 'след 90 дни',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Battery,
      value: '+32%',
      label: 'Повече енергия',
      description: 'през деня',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const timeline = [
    {
      day: '14 дни',
      emoji: '⚡',
      title: 'Първи Резултати',
      improvements: [
        'Енергия +15-20%',
        'По-качествен сън',
        'Либидо се подобрява',
        'Усещаш разликата'
      ]
    },
    {
      day: '30 дни',
      emoji: '💪',
      title: 'Видими Промени',
      improvements: [
        'Сила в залата расте',
        'Работоспособност цял ден',
        'Настроение се подобрява',
        'Мускули се възстановяват по-бързо'
      ]
    },
    {
      day: '90 дни',
      emoji: '🏆',
      title: 'Пълна Трансформация',
      improvements: [
        '+2.4 до 3.8 кг чиста мускулна маса',
        '+18% сила на основните упражнения',
        '+41% по-добър сън',
        'Хормоналният профил оптимизиран'
      ]
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 text-white">
      <AnimatedBackground
        variant="mixed"
        opacity={0.15}
        colors={{
          primary: 'rgb(34, 197, 94)',
          secondary: 'rgb(59, 130, 246)',
          tertiary: 'rgb(168, 85, 247)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-4 py-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Реални Данни</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <GradientText>
                РАБОТИ ЛИ?
              </GradientText>
            </h2>

            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Доказателства от реални потребители
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                  <div className="relative bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6 text-center group-hover:scale-105 transition-transform">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-white" />
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-white mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {stat.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 text-center">
            <p className="text-2xl md:text-3xl font-bold text-white mb-2">
              След 90 дни:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">+18%</div>
                <div className="text-neutral-300">сила</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">+2.4-3.8 кг</div>
                <div className="text-neutral-300">мускулна маса</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-1">+32%</div>
                <div className="text-neutral-300">енергия</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">+41%</div>
                <div className="text-neutral-300">по-добър сън</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              <GradientText>
                Какво да очакваш
              </GradientText>
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {timeline.map((phase, index) => (
                <div key={index} className="relative group">
                  {/* Connecting Line (desktop only) */}
                  {index < timeline.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-white/20 to-white/10 -z-10" />
                  )}

                  <div className="relative bg-neutral-800/90 backdrop-blur-sm border-2 border-neutral-700 group-hover:border-primary/50 rounded-2xl p-8 h-full transition-all group-hover:scale-105">
                    {/* Day Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
                      {phase.day}
                    </div>

                    {/* Emoji */}
                    <div className="text-6xl text-center mb-6 mt-4">
                      {phase.emoji}
                    </div>

                    {/* Title */}
                    <h4 className="text-xl font-bold text-white text-center mb-6">
                      {phase.title}
                    </h4>

                    {/* Improvements */}
                    <div className="space-y-3">
                      {phase.improvements.map((improvement, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-neutral-300">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Data Visualization Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-neutral-800/50 backdrop-blur-sm border-2 border-neutral-700 rounded-3xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <TrendingUp className="w-16 h-16 mx-auto text-neutral-600" />
                <p className="text-neutral-400 font-medium">App Screenshots: Реални данни от потребители</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
