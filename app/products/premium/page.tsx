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

export default function PremiumProductPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Countdown */}
      <HeroSection />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation */}
      <ProblemAgitation />

      {/* Solution Timeline - 90 days */}
      <SolutionTimeline />

      {/* Community Chat Proof - Authentic Conversations */}
      <CommunityChatsCarousel />

      {/* Value Stack - Hormozi Style */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ValueStackVisual
            items={[
              {
                name: "3x TestoUP бутилки (180 капсули)",
                value: 201,
                description: "3 месеца запас - достатъчно за сериозни резултати.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 90-дневен протокол",
                value: 197,
                description: "Пълен 3-месечен план. Всеки ден подробно описан.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Винаги на линия. Отговори на всички въпроси.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Свържи се с хиляди мъже на същия път.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: Напреднал Тренировъчен План",
                value: 97,
                description: "12-седмичен силов план за максимална мускулна маса.",
                icon: "🏋️",
                isBonus: true
              }
            ]}
            totalValue={562.9}
            discountedPrice={197}
            savings={365.9}
            spotsLeft={15}
            tier="premium"
          />
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Реални Резултати от Реални Мъже
            </h2>
            <p className="text-lg text-muted-foreground">
              Най-популярният избор - 67% избират ПРЕМИУМ пакета
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
              Отговори на всички твои въпроси за ПРЕМИУМ пакета
            </p>
          </div>
          <FAQSection tier="premium" />
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
