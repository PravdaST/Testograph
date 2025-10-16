"use client";

import { HeroSection } from "./components/HeroSection";
import { SocialProofBanner } from "./components/SocialProofBanner";
import { ProblemAgitation } from "./components/ProblemAgitation";
import { SolutionTimeline } from "./components/SolutionTimeline";
import { ValueStackVisual } from "@/components/funnel/ValueStackVisual";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { HowItWorks } from "./components/HowItWorks";
import { IngredientTable } from "./components/IngredientTable";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "./components/GuaranteeSection";
import { FinalCTA } from "./components/FinalCTA";
import { ExitIntentPopup } from "./components/ExitIntentPopup";
import { CommunityChatsCarousel } from "@/components/funnel/CommunityChatsCarousel";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { DetailedTestimonialCards } from "@/components/funnel/DetailedTestimonialCards";
import { IngredientsScience } from "@/components/funnel/IngredientsScience";

export default function MaximumProductPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Countdown */}
      <HeroSection />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation */}
      <ProblemAgitation />

      {/* Solution Timeline - 120 days */}
      <SolutionTimeline />

      {/* Community Chat Proof - Authentic Conversations */}
      <CommunityChatsCarousel />

      {/* Value Stack - Hormozi Style */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ValueStackVisual
            items={[
              {
                name: "4x TestoUP бутилки (240 капсули)",
                value: 268,
                description: "4 месеца запас - пълна трансформация. Най-мощната естествена добавка.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 120-дневен протокол",
                value: 197,
                description: "Пълен 4-месечен план. Всеки ден. Всяка седмица. Точни указания.",
                icon: "📋",
                highlight: true
              },
              {
                name: "VIP 24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Директна линия към експерт. Винаги до теб. По всяко време.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Ексклузивна общност с над 3000 мъже на същия път.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: Напреднал Тренировъчен План",
                value: 97,
                description: "12-седмичен силов план за максимална мускулна маса.",
                icon: "🏋️",
                isBonus: true
              },
              {
                name: "БОНУС: Хранителни Рецепти за Тестостерон",
                value: 39,
                description: "50+ рецепти оптимизирани за хормонално здраве.",
                icon: "🍳",
                isBonus: true
              }
            ]}
            totalValue={629.9}
            discountedPrice={267}
            savings={362.9}
            spotsLeft={8}
            tier="maximum"
          />
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Реални Резултати от Сериозни Мъже
            </h2>
            <p className="text-lg text-muted-foreground">
              Мъже, които избраха 4-месечната трансформация
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>

      {/* Video Testimonials - UGC Content */}
      <VideoTestimonialGrid />

      {/* How It Works */}
      <HowItWorks />

      {/* Science Behind TestoUP & Ingredient Transparency */}
      <IngredientsScience />

      {/* Ingredient Transparency */}
      <IngredientTable />

      {/* Detailed Success Stories - Gary Halbert Formula */}
      <DetailedTestimonialCards />

      {/* FAQ - Objection Handling */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Често Задавани Въпроси
            </h2>
            <p className="text-lg text-muted-foreground">
              Отговори на всички твои въпроси за МАКС пакета
            </p>
          </div>
          <FAQSection tier="maximum" />
        </div>
      </section>

      {/* 30-Day Guarantee */}
      <GuaranteeSection />

      {/* Final CTA with Urgency */}
      <FinalCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
