"use client";

import { HeroSection } from "../starter/components/HeroSection";
import { ProblemAgitation } from "../starter/components/ProblemAgitation";
import { SolutionTimeline } from "../starter/components/SolutionTimeline";
import { ValueStackVisual } from "@/components/funnel/ValueStackVisual";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { HowItWorks } from "../starter/components/HowItWorks";
import { IngredientTable } from "../starter/components/IngredientTable";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "../starter/components/GuaranteeSection";
import { FinalCTA } from "../starter/components/FinalCTA";
import { ExitIntentPopup } from "../starter/components/ExitIntentPopup";
import { SocialProofBanner } from "../starter/components/SocialProofBanner";
import { CommunityChatsGrid } from "@/components/funnel/CommunityChatsGrid";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { DetailedTestimonialCards } from "@/components/funnel/DetailedTestimonialCards";
import { ScienceSection } from "@/components/funnel/ScienceSection";
import { SupplementFacts } from "@/components/funnel/SupplementFacts";

export default function StarterFertilityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://testograph.eu/products/starter" />

      {/* Hero Section - ФЕРТИЛНОСТ ANGLE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            3 години опити за бебе?<br />
            <span className="text-primary">Може да е спермограмата.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Тя е здрава. Ти си "нормален". Но бебето не идва. Докторът каза "продължавайте да се опитвате".
            <strong className="text-foreground"> Но какво ако проблемът е измерим?</strong>
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Ниска подвижност. Лоша морфология. Малко на брой. TestoUP подобри спермограма на 800+ мъже за 90 дни.
          </p>
        </div>
      </section>

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation - FERTILITY FOCUS */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Чувстваш ли се като провален мъж?
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Всеки месец - надежда. Всеки месец - разочарование. Тя плаче в банята. Ти се правиш на силен.
              Но вътре знаеш - <strong>може би си ти</strong>.
            </p>
            <p>
              Спермограма. Подвижност: 30%. Брой: нисък. Морфология: под нормата. Докторът каза
              "може да се опитате с IVF". 15,000 лева. Без гаранция.
            </p>
            <p className="text-xl font-bold text-foreground">
              Какво ако можеш да подобриш спермограмата си... естествено?
            </p>
            <p>
              Цинк. Селен. Витамин D. Ашваганда. Клинични изследвания показват: тези съставки
              <strong> УДВОЯВАТ подвижност на сперматозоидите</strong> за 90 дни.
            </p>
            <p>
              Атанас от Бургас: Подвижност от 30% на 65%. Брой удвоен. Жена му е бременна.
              <strong> След 3 години опити.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* Community Chat Proof */}
      <CommunityChatsGrid />

      {/* Value Stack */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ValueStackVisual
            items={[
              {
                name: "TestoUP бутилка (60 капсули)",
                value: 67,
                description: "Селен + Цинк + Витамин D - тройката за подобрена спермограма.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 30-дневен протокол",
                value: 197,
                description: "Храна за фертилност. Добавки. Изследвания. Точен план.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Питай за спермограма резултати. Питай за следващи стъпки. Винаги на линия.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Мъже на същия път. Споделяте спермограми. Споделяте надежди.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: 7-дневен план за бърз старт",
                value: 49,
                description: "Започни СЕГА. Всеки ден има значение.",
                icon: "🚀",
                isBonus: true
              }
            ]}
            totalValue={342}
            discountedPrice={97}
            savings={245}
            spotsLeft={12}
            tier="regular"
          />
        </div>
      </section>

      {/* Success Stories - FERTILITY FOCUS */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Мъже Които Станаха Бащи
            </h2>
            <p className="text-lg text-muted-foreground">
              След години опити. След "невъзможно". Станаха бащи.
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>

      {/* Video Testimonials */}
      <VideoTestimonialGrid />

      {/* How It Works */}
      <HowItWorks />

      {/* Science Section */}
      <ScienceSection />

      {/* Ingredient Transparency */}
      <IngredientTable />

      {/* Detailed Testimonials */}
      <DetailedTestimonialCards />

      {/* Supplement Facts */}
      <SupplementFacts />

      {/* FAQ */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Често Задавани Въпроси
            </h2>
            <p className="text-lg text-muted-foreground">
              Отговори на всички твои въпроси
            </p>
          </div>
          <FAQSection tier="regular" />
        </div>
      </section>

      {/* Guarantee */}
      <GuaranteeSection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Exit Intent */}
      <ExitIntentPopup />
    </div>
  );
}
