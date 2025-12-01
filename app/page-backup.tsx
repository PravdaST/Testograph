'use client'

import { useState } from "react";
import Link from "next/link";
import { Shield, Check, Star, TrendingUp, Zap, Moon, Activity, ChevronRight, Award, Users, Clock, ShoppingCart, Smartphone, Package, Truck, Lock } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";

// Wave Separator Component
function WaveSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-16 overflow-hidden ${className}`}>
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
          fill="#499167"
          fillOpacity="0.1"
        />
        <path
          d="M0,70 C360,40 720,90 1080,60 C1260,45 1380,70 1440,80 L1440,100 L0,100 Z"
          fill="#499167"
          fillOpacity="0.05"
        />
      </svg>
    </div>
  );
}

// Wave Animation Component
function WaveBackground({ color = "#499167", opacity = 0.1 }: { color?: string; opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: opacity }} />
            <stop offset="50%" style={{ stopColor: color, stopOpacity: opacity * 1.5 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: opacity }} />
          </linearGradient>
        </defs>
        {/* Wave 1 */}
        <path
          fill="url(#wave-gradient)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave1 15s ease-in-out infinite',
            transformOrigin: 'center'
          }}
        />
        {/* Wave 2 */}
        <path
          fill={color}
          fillOpacity={opacity * 0.7}
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave2 20s ease-in-out infinite',
            animationDelay: '-5s',
            transformOrigin: 'center'
          }}
        />
        {/* Wave 3 */}
        <path
          fill={color}
          fillOpacity={opacity * 0.5}
          d="M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,181.3C672,171,768,149,864,144C960,139,1056,149,1152,160C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            animation: 'wave3 25s ease-in-out infinite',
            animationDelay: '-10s',
            transformOrigin: 'center'
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(10px); }
        }
        @keyframes wave3 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(5px); }
        }
      `}</style>
    </div>
  );
}

// Floating Particles Component
function FloatingParticles({ color = "#499167" }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            backgroundColor: color,
            opacity: Math.random() * 0.3 + 0.1,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Trust Badges Bar */}
      <TrustBadgesBar />

      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* App Showcase Section */}
      <AppShowcaseSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Clinical Proof Section */}
      <ClinicalProofSection />

      {/* Product Packages Section */}
      <ProductPackagesSection />

      {/* Member Testimonials Section */}
      <MemberTestimonialsSection />

      {/* Guarantee Section */}
      <GuaranteeSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}

// ============================================
// SECTION 1: TRUST BADGES BAR (Mobile Optimized)
// ============================================
function TrustBadgesBar() {
  return (
    <div className="bg-[#e6e6e6] border-b border-gray-200 py-2 sm:py-3">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Сертифицирано от БАБХ</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">GMP стандарт на производство</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">Произведено в Европейския съюз</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#499167] flex-shrink-0" />
            <span className="font-semibold text-gray-800">HACCP система за качество</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 2: HERO SECTION (Mobile Optimized)
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/testograph-background.webp"
          alt="Натурален тестостеронов бустер и цялостна програма за мъжко здраве TestoUP"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Subtle Wave Animation - Hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 z-5">
        <WaveBackground color="#499167" opacity={0.08} />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        {/* Trust Line */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[#5fb57e] font-semibold text-sm sm:text-base md:text-lg">
            Над 2,438 мъже вече подобриха хормоналния си баланс с Testograph
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
            Само 47 опаковки остават на тази цена
          </p>
        </div>

        {/* Headline - Mobile First Typography */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-5 md:mb-6 leading-tight">
            TestoUP: Натурален Тестостеронов Бустер и Цялостна Програма за Мъжко Здраве
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 font-bold mb-3 sm:mb-4">
            Персонални планове. Хранителни режими. Проследяване на възстановяването. Клинично тествана формула.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Всичко, от което се нуждаеш за естествено повишаване на тестостерона, събрано в едно: персонализиран дигитален треньор и клинично доказана хранителна добавка.
          </p>
        </div>

        {/* Value Props - Mobile First Grid */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <ValueProp text="Формула с 12 клинично доказани съставки" />
          <ValueProp text="Оптимални дози за реален ефект" />
          <ValueProp text="Поръчай добавката и отключи достъп до приложението" />
          <ValueProp text="Следвай програмата за гарантирани резултати" />
        </div>

        {/* Buttons - Mobile First with proper touch targets */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl touch-manipulation"
          >
            Започни своята трансформация
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
          <a href="/learn" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-full border-2 border-white/30 transition-all duration-300 touch-manipulation">
            Научни статии
          </a>
          <a href="#clinical-proof" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-full border-2 border-white/30 transition-all duration-300 touch-manipulation">
            Научи повече
          </a>
        </div>
      </div>
    </section>
  );
}

function ValueProp({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20">
      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#5fb57e] flex-shrink-0" />
      <span className="text-white text-xs sm:text-sm font-medium">{text}</span>
    </div>
  );
}

// ============================================
// SECTION 3: REVIEWS SECTION (Mobile Optimized)
// ============================================
function ReviewsSection() {
  const reviews = [
    {
      name: "Иван, 32г.",
      subtitle: "Фитнес ентусиаст",
      review: `Пробвал съм три различни добавки преди Testograph, но без никакъв резултат.

С вашата формула усетих разлика още на петия-шестия ден.
Сутрешните ерекции се върнаха, либидото ми се повиши - честно казано, не очаквах толкова бърз ефект.

След това започнах да следвам и плановете в приложението - за тренировки, хранене и сън.

Един месец по-късно съм буквално различен човек - в залата, в леглото, дори на работа.
Имам повече енергия, по-добра концентрация и се чувствам отново на 25.

Добавката действа бързо, но цялата програма наистина те преобразява.`
    },
    {
      name: "Георги, 38г.",
      subtitle: "Вечно уморен",
      review: `Още на четвъртия ден се събудих с ерекция, което не ми се беше случвало от месеци.
Веднага си помислих: "Добре, това работи".

След това разгледах плановете в приложението - какво да ям, как да тренирам и кога да спя.
Реших да ги пробвам.

След шест седмици съм напълно различен човек. Промяната не е само в либидото, а цялостна.
Енергията ми е стабилна през целия ден, а настроението ми е значително по-добро.
Жена ми казва, че съм по-присъстващ и жизнен. Пробвал съм три различни добавки преди Testograph, но без никакъв резултат.

С вашата формула усетих разлика още на петия-шестия ден.
Сутрешните ерекции се върнаха, либидото ми се повиши - честно казано, не очаквах толкова бърз ефект.

След това започнах да следвам и плановете в приложението - за тренировки, хранене и сън.

Един месец по-късно съм буквално различен човек - в залата, в леглото, дори на работа.
Имам повече енергия, по-добра концентрация и се чувствам отново на 25.

Добавката действа бързо, но цялата програма наистина те преобразява.`
    },
    {
      name: "Петър, 41г.",
      subtitle: "В търсене на искрата",
      review: `Още през първата седмица либидото ми скочи. Буквално я желаех отново.
Не осъзнавах колко ми е липсвало това чувство, докато не се върна.

Съпругата ми го забеляза веднага. Връзката ни се промени само за няколко дни.

След това започнах да следвам и останалите насоки - плановете за тренировки, хранене и режим.

Два месеца по-късно не мога да се позная. По-уверен съм, в по-добра форма и с много по-стабилна енергия.
Отново се чувствам мъж.

Ефектът от добавката е бърз, но ако следваш цялата програма, животът ти наистина се променя.`
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-8 sm:mb-12 md:mb-16">
          Реални Резултати от Мъже Използващи TestoUP Тестостеронов Бустер
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-[#e6e6e6] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line mb-4 sm:mb-6 leading-relaxed">
                {review.review}
              </p>
              <div className="border-t pt-3 sm:pt-4">
                <p className="font-bold text-sm sm:text-base text-gray-900">{review.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{review.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 4: APP SHOWCASE SECTION (Mobile Optimized)
// ============================================
function AppShowcaseSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#f0f9f4] to-[#e8f5ed]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
            TestoUP: Не Просто Добавка - Цялостна Програма за Повишаване на Тестостерона
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            С всяка поръчка получаваш незабавен достъп до нашето приложение. Попълни кратък въпросник и само след 10 минути ще имаш свой персонализиран план за действие.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Left: Features */}
          <div className="space-y-4 sm:space-y-6">
            <FeatureBox
              icon={<Activity className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#499167]" />}
              title="Твоят персонален план"
              items={[
                "Създаден за твоята цел (либидо, фитнес, енергия)",
                "Готов само за 10 минути",
                "Базиран на твоите отговори"
              ]}
            />
            <FeatureBox
              icon={<Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#499167]" />}
              title="Тренировки, хранене и сън"
              items={[
                "Персонални тренировъчни планове",
                "Насоки какво и кога да ядеш",
                "Стратегии за оптимизиране на съня"
              ]}
            />
            <FeatureBox
              icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#499167]" />}
              title="Проследяване и напомняния"
              items={[
                "Визуализирай своя прогрес",
                "Получавай напомняния какво и кога да правиш",
                "Следи резултатите си в реално време"
              ]}
            />
          </div>

          {/* Right: Phone Mockup with Auto-Scrolling Screenshot */}
          <div className="flex justify-center">
            <div className="relative w-[280px] h-[560px] sm:w-[320px] sm:h-[640px]">
              {/* Phone Frame Shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl"></div>

              {/* App Screenshot - Auto Scrolling */}
              <div className="relative w-full h-full p-2.5 sm:p-3">
                <div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white shadow-inner">
                  <div className="w-full h-full overflow-hidden relative">
                    <img
                      src="/Application-fullpage-scroll.png"
                      alt="Testograph мобилно приложение за персонализиран план за повишаване на тестостерона"
                      className="w-full h-auto"
                      loading="lazy"
                      style={{
                        animation: 'scrollApp 20s ease-in-out infinite',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 sm:w-32 sm:h-7 bg-black rounded-b-3xl z-10"></div>
            </div>
          </div>

          {/* Inline CSS for scroll animation */}
          <style jsx>{`
            @keyframes scrollApp {
              0% {
                transform: translateY(0);
              }
              45% {
                transform: translateY(calc(-100% + 614px));
              }
              55% {
                transform: translateY(calc(-100% + 614px));
              }
              100% {
                transform: translateY(0);
              }
            }
          `}</style>
        </div>

        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl touch-manipulation"
          >
            Започни своята трансформация
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureBox({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:border-[#499167] transition-colors">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        {icon}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-1.5 sm:space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#499167] flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// SECTION 5: HOW IT WORKS (Mobile Optimized)
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      icon: <ShoppingCart className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "1. Поръчай добавката",
      description: "С поръчката си получаваш незабавен достъп до приложението Testograph."
    },
    {
      icon: <Smartphone className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "2. Следвай твоя план",
      description: "Вътре те очаква персонализиран план за тренировки, хранене, сън и прием на добавката."
    },
    {
      icon: <TrendingUp className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#499167]" />,
      title: "3. Постигни резултати",
      description: "Седмица 1: Повишено либидо и по-добри ерекции.\nМесец 1: Повече енергия и по-бързо възстановяване.\nМесец 2: Цялостна трансформация."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-10 sm:mb-12 md:mb-16">
          Как Работи TestoUP Програмата за Оптимизиране на Тестостерона?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#e6e6e6] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg text-center relative flex flex-col items-center border border-gray-100">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ChevronRight className="w-8 h-8 text-[#499167]" />
                </div>
              )}
              <div className="mb-3 sm:mb-4">{step.icon}</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">{step.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <a
            href="#clinical-proof"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-white hover:bg-[#e6e6e6] text-gray-900 font-bold text-base sm:text-lg rounded-full border-2 border-gray-300 transition-all duration-300 hover:scale-105 touch-manipulation"
          >
            Виж съставките
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6: CLINICAL PROOF
// ============================================
function ClinicalProofSection() {
  return (
    <section id="clinical-proof" className="py-20 bg-[#e6e6e6]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Клинично Доказана Формула за Естествено Повишаване на Тестостерона
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Нашата формула съдържа 12 активни съставки, подкрепени от над 50 публикувани клинични проучвания.
          </p>
        </div>

        {/* Show 4 featured researchers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          <ResearcherCard
            ingredient="Vitamin D3 (2400 IU)"
            researcher="Д-р Майкъл Холик"
            institution="Бостънски университет"
            quote="Дефицитът на витамин D е пряко свързан с ниските нива на тестостерон. Суплементирането с витамин D доказано ги повишава."
          />
          <ResearcherCard
            ingredient="Zinc (50mg)"
            researcher="Д-р Ананда Прасад"
            institution="Щатски университет 'Уейн'"
            quote="Дефицитът на цинк директно намалява производството на тестостерон. Приемът му като добавка нормализира нивата в рамките на 3 до 6 месеца."
          />
          <ResearcherCard
            ingredient="Ashwagandha (400mg)"
            researcher="Д-р Биджасвит Оди"
            institution="Институт за клинични изследвания, Индия"
            quote="Доказано повишава тестостерона с до 15% и намалява кортизола (хормона на стреса) с до 40% при възрастни, подложени на стрес."
          />
          <ResearcherCard
            ingredient="Magnesium (400mg)"
            researcher="Д-р Джовани Чеда"
            institution="Университет на Парма"
            quote="Магнезият повишава както свободния, така и общия тестостерон, особено когато се комбинира с редовна физическа активност."
          />
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">+ още 8 клинично тествани съставки</p>
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Виж пълния състав
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ResearcherCard({ ingredient, researcher, institution, quote }: { ingredient: string; researcher: string; institution: string; quote: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
      <div className="mb-4">
        <h4 className="font-bold text-gray-900 text-lg mb-1">{ingredient}</h4>
        <p className="text-sm font-semibold text-[#3a7450]">{researcher}</p>
        <p className="text-xs text-gray-600">{institution}</p>
      </div>
      <blockquote className="text-sm text-gray-700 italic leading-relaxed">
        "{quote}"
      </blockquote>
    </div>
  );
}

// ============================================
// SECTION 7: PRODUCT PACKAGES
// ============================================
function ProductPackagesSection() {
  const packages = [
    {
      bottles: 1,
      duration: "1-месечен план",
      price: "67.00",
      priceEur: "34.26",
      totalPrice: "67.00",
      savings: null,
      popular: false,
      image: "/product/testoup-bottle.webp"
    },
    {
      bottles: 2,
      duration: "2-месечен план",
      price: "57.00",
      priceEur: "29.13",
      totalPrice: "114.00",
      savings: "20 лв.",
      popular: true,
      image: "/product/testoup-bottle_v1.webp"
    },
    {
      bottles: 3,
      duration: "3-месечен план",
      price: "50.00",
      priceEur: "25.55",
      totalPrice: "150.00",
      savings: "51 лв.",
      popular: false,
      bestValue: true,
      image: "/product/testoup-bottle_v2.webp"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Избери TestoUP План за Повишаване на Тестостерона
          </h2>
          <p className="text-xl text-gray-600 mb-3">
            Всеки план включва пълен достъп до приложението Testograph.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#499167] text-white px-6 py-3 rounded-full font-semibold">
            <span>⚡</span>
            <span>Специална цена - валидна до изчерпване на stock-а</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {packages.map((pkg, idx) => (
            <PackageCard key={idx} {...pkg} />
          ))}
        </div>

        <div className="text-center space-y-2 text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-[#499167]" /> Безплатна доставка над 50 лв.</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-[#499167]" /> Сигурно плащане</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-[#499167]" /> Дискретна опаковка</p>
          <p className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-[#499167]" /> 30-дневна гаранция за връщане на парите</p>
        </div>
      </div>
    </section>
  );
}

interface PackageCardProps {
  bottles: number;
  duration: string;
  price: string;
  priceEur: string;
  totalPrice: string;
  savings: string | null;
  popular?: boolean;
  bestValue?: boolean;
  image: string;
}

function PackageCard({ bottles, duration, price, priceEur, totalPrice, savings, popular, bestValue, image }: PackageCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${popular || bestValue ? 'border-4 border-[#499167] transform scale-105' : 'border-2 border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#499167] text-white px-6 py-1 rounded-full text-sm font-bold">
          НАЙ-ПОПУЛЯРЕН
        </div>
      )}
      {bestValue && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-bold">
          НАЙ-ИЗГОДЕН
        </div>
      )}

      <div className="text-center mb-6">
        <img src={image} alt={`TestoUP тестостеронов бустер - ${bottles} опаковки за ${duration.toLowerCase()}`} className="w-32 h-32 mx-auto object-contain mb-4" />
        <h3 className="text-2xl font-black text-gray-900 mb-2">{duration}</h3>
        <div className="mb-4">
          <p className="text-4xl font-black text-[#499167]">{price} лв./месец</p>
          <p className="text-sm text-gray-500">({priceEur} €)</p>
          {totalPrice !== price && (
            <p className="text-lg text-gray-700 mt-2">(общо {totalPrice} лв.)</p>
          )}
        </div>
        {savings && (
          <p className="text-[#499167] font-bold text-sm mb-2">
            Спестяваш {savings}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        <li className="flex items-center gap-2 text-gray-700">
          <Check className="w-5 h-5 text-[#499167] flex-shrink-0" />
          <span>{bottles} {bottles === 1 ? 'опаковка' : 'опаковки'} ({bottles * 30} дни)</span>
        </li>
        <li className="flex items-center gap-2 text-gray-700">
          <Check className="w-5 h-5 text-[#499167] flex-shrink-0" />
          <span>Безплатен достъп до приложението</span>
        </li>
        <li className="flex items-center gap-2 text-gray-700">
          <Check className="w-5 h-5 text-[#499167] flex-shrink-0" />
          <span>30-дневна гаранция за връщане на парите</span>
        </li>
      </ul>

      <a
        href="https://shop.testograph.eu/products/testoup"
        className={`block w-full text-center py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 ${
          popular || bestValue
            ? 'bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white shadow-xl'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300'
        }`}
      >
        Избери план →
      </a>
    </div>
  );
}

// ============================================
// SECTION 8: MEMBER TESTIMONIALS
// ============================================
function MemberTestimonialsSection() {
  const testimonials = [
    { text: "Първите две седмици бях скептичен. След това обаче забелязах, че приключвам работния ден без да съм напълно изтощен. Това е огромна промяна за мен.", author: "Стоян, 34г., София" },
    { text: "На четвъртия ден се появи сутрешна ерекция, което не ми се беше случвало от месеци. Жена ми забеляза, че нещо се променя, още преди да ѝ кажа.", author: "Димитър, 40г., Пловдив" },
    { text: "Без приложението нямаше да знам какво да правя. Особено частта за съня - промених часа си на лягане и температурата в стаята. Разликата беше огромна.", author: "Николай, 37г., Варна" },
    { text: "Пета седмица: момчетата в залата ме питат 'какво взимаш?'. Вдигам повече и се възстановявам по-бързо.", author: "Иван, 29г., Бургас" },
    { text: "Пробвал съм Tribulus и Maca преди, но без резултат. Тук е различно, защото следваш цялостна програма, а не просто пиеш хапчета.", author: "Петър, 42г., Русе" },
    { text: "Преди спях по 5-6 часа и се чувствах разбит. Сега спя по 7-8 часа и се събуждам сам, преди алармата. Енергията ми през деня е стабилна.", author: "Георги, 45г., Стара Загора" },
    { text: "Не стана за седмица, отне ми около месец и половина. Но програмата наистина работи, стига да си постоянен.", author: "Христо, 38г., Плевен" },
    { text: "Харчил съм толкова пари за безполезни неща. Това е първото, което реално промени начина, по който се чувствам всеки ден.", author: "Александър, 35г., Велико Търново" },
    { text: "Преди два месеца бях постоянно уморен, с нулево либидо и в лошо настроение. Сега отново се чувствам нормално. Просто нормално. Това е всичко, което исках.", author: "Мартин, 41г., Благоевград" }
  ];

  return (
    <section className="py-20 bg-[#e6e6e6]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Успешни Истории от Мъже Използващи TestoUP за Мъжко Здраве
          </h2>
          <p className="text-xl text-gray-600">
            Хиляди мъже вече следват програмата. Виж техните резултати.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#499167] transition-colors">
              <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <p className="text-sm font-semibold text-gray-900">— {testimonial.author}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://shop.testograph.eu/products/testoup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#499167] to-[#3a7450] hover:from-[#3a7450] hover:to-[#2d5a3e] text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Присъедини се към тях
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// GUARANTEE SECTION
// ============================================
function GuaranteeSection() {
  const guarantees = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "30 Дневна Гаранция",
      description: "Пълно възстановяване на сумата, ако не си доволен"
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Безплатна Доставка",
      description: "За поръчки над 99 лв. до цяла България"
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: "Сигурно Плащане",
      description: "SSL криптиране и защитени транзакции"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Сертифицирано Качество",
      description: "Произведено в GMP сертифициран обект"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#f0f9f4] to-[#e8f5ed]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
          Нашата Гаранция за Качество
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Купуваш с пълна увереност. Ако не си доволен, връщаме парите - без въпроси.
        </p>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {guarantees.map((guarantee, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex justify-center mb-4 text-[#499167]">{guarantee.icon}</div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{guarantee.title}</h3>
              <p className="text-gray-600">{guarantee.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-[#499167] text-white px-8 py-4 rounded-xl font-bold text-lg">
            <Users className="w-6 h-6" />
            <span>Над 2,438 доволни клиенти в България</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 9: FAQ
// ============================================
function FAQSection() {
  const faqs = [
    {
      q: "Колко време отнема, за да видя резултати?",
      a: "Повечето мъже забелязват първите ефекти (повишено либидо, повече енергия) в рамките на 3 до 7 дни. За цялостна трансформация са необходими между 60 и 90 дни стриктно следване на програмата."
    },
    {
      q: "Как получавам достъп до приложението?",
      a: "Веднага след като завършиш поръчката си, ще получиш имейл с линк за регистрация. Процесът отнема около 10 минути, в които трябва да попълниш кратък въпросник, след което ще получиш своя персонализиран план."
    },
    {
      q: "Безопасна ли е добавката?",
      a: "Абсолютно. Всички съставки в нашата формула са натурални и клинично тествани. Продуктът се произвежда в Европейския съюз и е сертифициран по GMP, HACCP и от БАБХ."
    },
    {
      q: "Трябва ли да посещавам фитнес зала?",
      a: "Не е задължително. Приложението предлага тренировъчни планове за всякакви нива - от напълно начинаещи до напреднали. Можеш да изпълняваш тренировките си както във фитнеса, така и у дома."
    },
    {
      q: "Каква е гаранцията, ако не съм доволен?",
      a: "Предлагаме 30-дневна гаранция за връщане на парите. Ако не си доволен от резултатите, просто се свържи с нас и ние ще ти върнем парите, без да задаваме въпроси."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
          Често Задавани Въпроси за TestoUP и Повишаване на Тестостерона
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-[#e6e6e6] rounded-xl border-2 border-gray-200 hover:border-[#499167] transition-colors">
              <summary className="p-6 cursor-pointer flex items-center justify-between font-bold text-lg text-gray-900">
                {faq.q}
                <ChevronRight className="w-6 h-6 text-[#499167] transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">TESTOGRAPH</h3>
            <p className="text-sm">Цялостна програма за естествено повишаване на тестостерона.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Продукти</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://shop.testograph.eu/products/testoup" className="hover:text-[#5fb57e] transition-colors">TestoUP</a></li>
              <li><a href="https://shop.testograph.eu" className="hover:text-[#5fb57e] transition-colors">Магазин</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/learn" className="hover:text-[#5fb57e] transition-colors">Научни статии</Link></li>
              <li><Link href="/terms" className="hover:text-[#5fb57e] transition-colors">Общи условия</Link></li>
              <li><Link href="/privacy" className="hover:text-[#5fb57e] transition-colors">Политика за поверителност</Link></li>
              <li><Link href="/cookies" className="hover:text-[#5fb57e] transition-colors">Политика за бисквитки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Контакти</h4>
            <ul className="space-y-2 text-sm">
              <li>Имейл: support@testograph.eu</li>
              <li>Работно време: Понеделник - Петък, 9:00 - 18:00 ч.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© 2025 Testograph. Всички права запазени.</p>
          <p className="mt-2 text-gray-500">Този продукт не е лекарствено средство и не е предназначен за диагностика, лечение или превенция на заболявания. Консултирайте се с лекар преди употреба.</p>
        </div>
      </div>
    </footer>
  );
}
