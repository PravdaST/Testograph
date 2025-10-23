'use client'

import { useState, useEffect } from "react";
import { Activity, Target, Shield, Sparkles, ChevronDown, Instagram, Facebook, Youtube, TrendingUp, Zap, Clock, FileText, CheckCircle2, Mail, ChevronLeft, ChevronRight, Users, Award, Timer, Star, ArrowRight, Play, Gift } from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { ScarcityBanner } from "@/components/ui/scarcity-banner";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { StatComparison } from "@/components/ui/stat-comparison";
import { ValueStack } from "@/components/ui/value-stack";
import { LiveActivityNotifications } from "@/components/ui/LiveActivityNotifications";
import { SpotCounter } from "@/components/ui/SpotCounter";
import { ViberProofGrid } from "@/components/ui/ViberProof";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { trackViewContent, trackLead, trackAddToCart } from "@/lib/facebook-pixel";

// Testimonials Carousel Component
const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const testimonials = [
    {
      name: "Стефан",
      age: 42,
      city: "София, Мениджър",
      avatarUrl: "/funnel/stefan-avatar.jpg",
      quote: "Бях на 8.7 тестостерон. След 3 месеца система + продукт - 22.1! Жена ми казва че съм се променил напълно. Енергия, сила, всичко се върна.",
      beforeStat: "8.7",
      afterStat: "22.1",
      statLabel: "Тестостерон (nmol/L)"
    },
    {
      name: "Алекс",
      age: 35,
      city: "Пловдив, Фитнес треньор",
      avatarUrl: "/funnel/alex-avatar.jpg",
      quote: "Клиентите ми питаха как поддържам форма на 35. Истината - системата + TestoUP. +4кг мускули, -6% мазнини за 2 месеца. Това е разликата.",
      beforeStat: "15.2",
      afterStat: "24.8",
      statLabel: "Тестостерон (nmol/L)"
    },
    {
      name: "Марио",
      age: 48,
      city: "Варна, Предприемач",
      avatarUrl: "/funnel/mario-avatar.jpg",
      quote: "Бизнесът ми страдаше от липса на фокус. Системата ми върна остротата. 3 месеца по-късно - +180% тестостерон и бизнесът лети.",
      beforeStat: "7.1",
      afterStat: "19.9",
      statLabel: "Тестостерон (nmol/L)"
    },
    {
      name: "Георги",
      age: 38,
      city: "Бургас, Инженер",
      avatarUrl: "/funnel/georgi-avatar.jpg",
      quote: "Мислех че е възрастта. Оказа се нисък тестостерон. Системата + продукта - от 9.3 на 21.7 за 90 дни. Чувствам се като на 25!",
      beforeStat: "9.3",
      afterStat: "21.7",
      statLabel: "Тестостерон (nmol/L)"
    }
  ];

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
              <TestimonialCard
                name={testimonial.name}
                age={testimonial.age}
                city={testimonial.city}
                avatarUrl={testimonial.avatarUrl}
                quote={testimonial.quote}
                beforeStat={testimonial.beforeStat}
                afterStat={testimonial.afterStat}
                statLabel={testimonial.statLabel}
                verified={true}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 12
  });

  useEffect(() => {
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
        } else {
          // Reset when reaches 0
          hours = 23;
          minutes = 47;
          seconds = 12;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2">
      <Timer className="w-4 h-4 text-destructive" />
      <span className="text-sm font-bold text-destructive">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// Email Capture Form Component
const EmailCaptureForm = ({ onSuccess }: { onSuccess: (email: string, name: string) => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsLoading(true);

    // Track lead in Facebook Pixel
    trackLead('Cold Traffic Landing - Email Capture', 0);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      onSuccess(email, name);
    }, 1500);
  };

  if (step === 1) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl rounded-2xl border border-primary/20 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mb-4">
            <Gift className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success uppercase tracking-wide">
              Безплатен Бонус
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Получи БЕЗПЛАТЕН Анализ + 7-Дневен План</h3>
          <p className="text-muted-foreground">
            Въведи данните си и ще получиш персонализиран PDF анализ на твоите хормонални нива + 7-дневен план за начало
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Име</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Твоето име"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Имейл адрес</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="твоят@имейл.com"
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !email || !name}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Изпращане...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Получи Безплатния Анализ
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          ✓ 100% Безплатно • ✓ Само 2 минути • ✓ Дискретно
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-success/5 to-green-500/5 backdrop-blur-xl rounded-2xl border border-success/20 p-8 shadow-2xl text-center">
      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-success" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-success">Готово! Провери имейла си</h3>
      <p className="text-muted-foreground mb-6">
        Изпратихме ти персонализирания анализ + 7-дневен план на <strong>{email}</strong>
      </p>
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
        <p className="text-primary font-bold text-lg mb-2">🔥 СПЕЦИАЛНА ОФЕРТА</p>
        <p className="text-foreground mb-4">
          СЕГА можеш да получиш ПЪЛНАТА 30-дневна система + продукта за 97лв вместо 639лв
        </p>
        <Button
          onClick={() => {
            trackAddToCart('Testograph Complete System + Product', 97, 'BGN');
          }}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30"
        >
          <span>Вземи Системата + Продукта за 97лв</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          ⏰ Офертата изтича след 24 часа • 💯 60-дневна гаранция
        </p>
      </div>
    </div>
  );
};

const ColdTrafficLanding = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showScarcityBanner, setShowScarcityBanner] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();

  // Track page view
  useEffect(() => {
    trackViewContent('Cold Traffic Landing Page', 'landing_page');
  }, []);

  // Show scarcity banner after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScarcityBanner(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEmailSuccess = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/40 to-purple-800/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/30 to-indigo-700/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-2"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-700/35 to-violet-600/35 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-4"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/testograph-logo.png" alt="Testograph Logo" className="h-12 w-auto" />
              <div>
                <p className="text-xl font-bold text-white">Testograph</p>
                <p className="text-xs text-gray-300">Пълната система за тестостерон</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">3,247+ мъже</span>
              </div>
              <CountdownTimer />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section - Cold Traffic Optimized */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Social Proof Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full mb-6">
                <Users className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">
                  3,247+ мъже вече го направиха
                </span>
              </div>

              {/* Main Problem - Relatable */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Сутрин ставаш от леглото и си
                <br />
                <span className="text-destructive">уморен като да си спал 2 часа</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                През деня едвам се влачиш. Кафето не помага.
                <br />
                Вечерта си прекалено изморен за секс.
                <br />
                <strong>Звучи ли познато?</strong>
              </p>

              {/* What is Testosterone - Simple Explanation */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">Какво е тестостерон?</span>
                </div>
                <p className="text-lg text-white mb-2">
                  Тестостеронът е <strong>ГОРИВОТО на мъжа</strong>
                </p>
                <p className="text-base text-gray-300">
                  Когато е нисък: нямаш енергия, либидото изчезва, мускулите не растат.
                  <br />
                  Когато е нормален: си пълен с енергия, силен и уверен.
                </p>
              </div>

              {/* Visual Before/After */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="text-center mb-3">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">😴</span>
                    </div>
                    <p className="text-red-400 font-bold">ПРЕДИ</p>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✗ Сутрин си уморен</li>
                    <li>✗ Либидото е нула</li>
                    <li>✗ Мускулите не растат</li>
                    <li>✗ Лошо настроение</li>
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="text-center mb-3">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">💪</span>
                    </div>
                    <p className="text-green-400 font-bold">СЛЕД 90 дни</p>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✅ Пълен с енергия</li>
                    <li>✅ Либидото се връща</li>
                    <li>✅ Мускулите растат</li>
                    <li>✅ Отлично настроение</li>
                  </ul>
                </div>
              </div>

              {/* Simple Results */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-xl rounded-2xl border border-primary/30 p-6 mb-8">
                <p className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Средно +130% тестостерон за 90 дни
                </p>
                <p className="text-lg text-gray-300">
                  341 българи вече постигнаха тези резултати. Ето какво казват те:
                </p>
              </div>

              {/* Main CTA - No Brainer */}
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setShowEmailForm(true);
                    trackViewContent('Email Form Opened', 'form');
                  }}
                  className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-full transition-all duration-300 hover:scale-105 shadow-2xl shadow-green-500/40"
                >
                  <Gift className="w-6 h-6 mr-3" />
                  Получи БЕЗПЛАТЕН Анализ + План
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-gray-300">100% Безплатно</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-gray-300">2 минути</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-gray-300">3,247+ мъже</span>
                  </div>
                </div>

                {/* Urgency */}
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <Timer className="w-4 h-4" />
                    <span className="font-semibold">Офертата изтича след:</span>
                    <CountdownTimer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-16 bg-black/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Виж какво точно получаваш
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Не е поредната добавка. Това е професионална система с реални резултати.
              </p>
            </div>

            {/* Main Product Display */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="relative bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl rounded-3xl border border-primary/30 p-8 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl"></div>
                    <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                      {/* TestoUP Product Mockup */}
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">T</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">TestoUP</h3>
                        <p className="text-sm text-gray-600 mb-4">60 капсули • 30-дневна доза</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded">Натурални съставки</div>
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Клинично тествани</div>
                          <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded">EU стандарт</div>
                          <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Без рецепта</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full mb-4">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">Професионална формула</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">TestoUP - Тестостерон оптимизатор</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-300">Тонгкат Али 400mg (екстракт 100:1)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-gray-300">Ашваганда KSM-66 300mg</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-gray-300">Цинк 30mg + Витамин D3 2000IU</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Бор + Магнезий комплекс</span>
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                      <p className="text-primary font-bold text-lg mb-1">💊 Как се приема:</p>
                      <p className="text-gray-300 text-sm">2 капсули дневно с вода. 30-дневна програма за максимални резултати.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Components */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ПЪЛНАТА СИСТЕМА включва:
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Не само продукта. Получаваш цялата система за гарантирани резултати.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* System Protocol */}
              <div className="group relative bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl rounded-2xl border border-primary/30 p-8 hover:border-primary/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">30-Дневен Протокол</h3>
                    <p className="text-primary font-semibold">197лв стойност</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Дневни хранителни планове</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Тренировъчни програми</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Добавки протоколи</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Проследяване на прогрес</span>
                  </li>
                </ul>
              </div>

              {/* TestoUP Product */}
              <div className="group relative bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-xl rounded-2xl border border-accent/30 p-8 hover:border-accent/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Activity className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">TestoUP Добавка</h3>
                    <p className="text-accent font-semibold">67лв стойност</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Натурални съставки</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Клинично тествани дози</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>60-дневна доставка</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Произведено в ЕС</span>
                  </li>
                </ul>
              </div>

              {/* AI Expert */}
              <div className="group relative bg-gradient-to-br from-card/90 to-success/5 backdrop-blur-xl rounded-2xl border border-success/30 p-8 hover:border-success/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Експерт 24/7</h3>
                    <p className="text-success font-semibold">99лв стойност</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Независим чат асистент</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Персонализирани съвети</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>PDF анализ на резултати</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Доживотен достъп</span>
                  </li>
                </ul>
              </div>

              {/* Bonuses */}
              <div className="group relative bg-gradient-to-br from-card/90 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                    <Gift className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Бонуси</h3>
                    <p className="text-purple-400 font-semibold">276лв стойност</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Meal Planner App</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>VIP Telegram Group</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>60-дневна гаранция</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Lifetime updates</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Stack Summary */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-xl rounded-2xl border border-primary/30 p-8 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-4xl font-bold text-destructive line-through">639лв</p>
                    <p className="text-sm text-gray-300">Пълна стойност</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-success">97лв</p>
                      <p className="text-lg text-gray-300">Твоята цена</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-success">85%</p>
                    <p className="text-sm text-gray-300">Отстъпка</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setShowEmailForm(true);
                    trackAddToCart('Testograph Complete System + Product', 97, 'BGN');
                  }}
                  className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold text-xl rounded-full transition-all duration-300 hover:scale-105 shadow-2xl shadow-primary/40"
                >
                  <span>Вземи Системата за 97лв</span>
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>

                <p className="text-sm text-gray-300 mt-4">
                  ⏰ Офертата изтича след 24 часа • 💯 60-дневна гаранция • 🚚 Безплатна доставка
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Testimonials Section */}
        <section className="py-16 bg-black/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Реални хора. <span className="text-primary">Реални резултати.</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Виж как се промениха тези мъже. Това не са актьори - това са НАШИ клиенти.
              </p>
            </div>

            {/* Before/After Visual Testimonials */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {/* Stefan's Story */}
              <div className="group relative bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl rounded-2xl border border-primary/30 p-6 hover:border-primary/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-4 border-primary/30">
                      СД
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Стефан Димитров</h3>
                  <p className="text-sm text-gray-400">42г, София • Мениджър</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-400 font-semibold">ПРЕДИ</span>
                    <span className="text-xs text-green-400 font-semibold">СЛЕД</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-red-400">8.7</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">22.1</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "Бях на 8.7 тестостерон. След 3 месеца система + продукт - 22.1! Жена ми казва че съм се променил напълно."
                </p>

                <div className="mt-4 flex gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Alex's Story */}
              <div className="group relative bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-xl rounded-2xl border border-accent/30 p-6 hover:border-accent/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-4 border-accent/30">
                      АП
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Алекс Петров</h3>
                  <p className="text-sm text-gray-400">35г, Пловдив • Фитнес треньор</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-400 font-semibold">ПРЕДИ</span>
                    <span className="text-xs text-green-400 font-semibold">СЛЕД</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-red-400">15.2</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">24.8</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "Клиентите ми питаха как поддържам форма на 35. Истината - системата + TestoUP. +4кг мускули, -6% мазнини."
                </p>

                <div className="mt-4 flex gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Mario's Story */}
              <div className="group relative bg-gradient-to-br from-card/90 to-success/5 backdrop-blur-xl rounded-2xl border border-success/30 p-6 hover:border-success/50 transition-all duration-300 hover:scale-105 shadow-xl">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-br from-success to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-4 border-success/30">
                      МВ
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Марио Василев</h3>
                  <p className="text-sm text-gray-400">48г, Варна • Предприемач</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-400 font-semibold">ПРЕДИ</span>
                    <span className="text-xs text-green-400 font-semibold">СЛЕД</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-red-400">7.1</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">19.9</p>
                      <p className="text-xs text-gray-400">nmol/L</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "Бизнесът ми страдаше от липса на фокус. Системата ми върна остротата. 3 месеца по-късно - +180% тестостерон."
                </p>

                <div className="mt-4 flex gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Results Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-xl rounded-2xl border border-primary/30 p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Средни резултати на 341 клиенти:
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/20 rounded-xl p-4 mb-3">
                    <p className="text-3xl font-bold text-primary">+130%</p>
                    <p className="text-sm text-primary/80">Тестостерон</p>
                  </div>
                  <p className="text-xs text-gray-400">Средно повишение за 90 дни</p>
                </div>
                <div className="text-center">
                  <div className="bg-success/20 rounded-xl p-4 mb-3">
                    <p className="text-3xl font-bold text-success">3кг</p>
                    <p className="text-sm text-success/80">Мускули</p>
                  </div>
                  <p className="text-xs text-gray-400">Средно покачване</p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/20 rounded-xl p-4 mb-3">
                    <p className="text-3xl font-bold text-accent">-5%</p>
                    <p className="text-sm text-accent/80">Мазнини</p>
                  </div>
                  <p className="text-xs text-gray-400">Средно намаление</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full">
                  <Users className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">
                    341 българи вече постигнаха тези резултати
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Email Capture Section */}
        <section className="py-16 bg-black/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {!showEmailForm ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full mb-6">
                    <Gift className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-success uppercase tracking-wide">
                      Започни БЕЗПЛАТНО
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Получи своя <span className="text-primary">персонален анализ</span>
                  </h2>

                  <p className="text-lg text-gray-300 mb-8">
                    Отговори на 4 въпроса и ще получиш PDF с твоите хормонални нива + 7-дневен план за начало
                  </p>

                  <Button
                    onClick={() => {
                      setShowEmailForm(true);
                      trackViewContent('Email Form Opened', 'form');
                    }}
                    className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-full transition-all duration-300 hover:scale-105 shadow-2xl shadow-green-500/40"
                  >
                    <Gift className="w-6 h-6 mr-3" />
                    Започни Безплатния Анализ
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>2 минути</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>100% Безплатно</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Дискретно</span>
                    </div>
                  </div>
                </div>
              ) : (
                <EmailCaptureForm onSuccess={handleEmailSuccess} />
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Въпроси?
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                  <span className="text-lg font-medium text-foreground">
                    Какво е различното при Testograph?
                  </span>
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  Не сме просто добавка. Ние сме ПЪЛНАТА СИСТЕМА - протокол + продукт + AI експерт + community. 341 българи вече постигнаха +130% тестостерон. Това е разликата.
                </div>
              </details>

              <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                  <span className="text-lg font-medium text-foreground">
                    Колко време отнема да видя резултати?
                  </span>
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  Първите промени (енергия, настроение) се усещат за 7-14 дни. За значителни хормонални промени - 30-90 дни. Затова даваме 60-дневна гаранция.
                </div>
              </details>

              <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                  <span className="text-lg font-medium text-foreground">
                    Безопасно ли е?
                  </span>
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  100% натурални съставки, клинично тествани дози. Произведено в ЕС. Но винаги се консултирай с лекар преди нови добавки.
                </div>
              </details>

              <details className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
                <summary className="p-6 cursor-pointer flex items-center justify-between list-none">
                  <span className="text-lg font-medium text-foreground">
                    Какво ако не работи за мен?
                  </span>
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  60-дневна гаранция. Ако не видиш резултати, връщаме 100% от парите + 50лв бонус за загубеното време. Риск нула.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Поверителност
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Условия
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Бисквитки
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Testograph © 2025. Пълната система за тестостерон.
            </p>
          </div>
        </footer>
      </main>

      {/* Scarcity Banner */}
      {showScarcityBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-destructive to-red-600 text-white p-4 text-center">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="font-bold">Офертата изтича след 24 часа!</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-bold">Само 47 места тази седмица</span>
              </div>
              <Button
                onClick={() => {
                  setShowEmailForm(true);
                  trackAddToCart('Scarcity Banner CTA', 97, 'BGN');
                }}
                className="bg-white text-destructive hover:bg-gray-100 font-bold px-6 py-2 rounded-full"
              >
                Вземи Системата СЕГА
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdTrafficLanding;
