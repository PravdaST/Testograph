"use client";

import { HeroSection } from "./components/HeroSection";
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
import { SocialProofBanner } from "./components/SocialProofBanner";
import { CommunityChatsGrid } from "@/components/funnel/CommunityChatsGrid";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { DetailedTestimonialCards } from "@/components/funnel/DetailedTestimonialCards";
import { ScienceSection } from "@/components/funnel/ScienceSection";
import { SupplementFacts } from "@/components/funnel/SupplementFacts";

export default function StarterProductPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Countdown */}
      <HeroSection />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Agitation */}
      <ProblemAgitation />

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* Community Chat Proof - Authentic Conversations */}
      <CommunityChatsGrid />

      {/* Value Stack - Hormozi Style */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ValueStackVisual
            items={[
              {
                name: "TestoUP бутилка (60 капсули)",
                value: 67,
                description: "Най-силната естествена добавка на пазара. 30-дневен запас за видими резултати.",
                icon: "💊",
                highlight: true
              },
              {
                name: "TestographPRO 30-дневен протокол",
                value: 197,
                description: "Точно какво да правиш всеки ден. Храна. Тренировки. Сън. Всичко.",
                icon: "📋",
                highlight: true
              },
              {
                name: "24/7 Хормонален Експерт поддръжка",
                value: "Включена",
                description: "Винаги до теб. Питай каквото искаш. Никога не си сам.",
                icon: "🤝",
                highlight: true
              },
              {
                name: "VIP Telegram общност",
                value: 29,
                description: "Свържи се с хиляди мъже на същия път. Споделяй. Учи. Расти.",
                icon: "👥",
                isBonus: true
              },
              {
                name: "БОНУС: 7-дневен план за бърз старт",
                value: 49,
                description: "Започни веднага с готов 7-дневен план. Никакво чакане.",
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

      {/* Success Stories / Testimonials */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Реални Резултати от Реални Мъже
            </h2>
            <p className="text-lg text-muted-foreground">
              3,247+ мъже вече променихаживота си с СТАРТ пакета
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>

      {/* Video Testimonials - UGC Content */}
      <VideoTestimonialGrid />

      {/* How It Works */}
      <HowItWorks />

      {/* Science Behind TestoUP */}
      <ScienceSection />

      {/* Ingredient Transparency */}
      <IngredientTable />

      {/* Detailed Success Stories - Gary Halbert Formula */}
      <DetailedTestimonialCards />

      {/* Supplement Facts Label */}
      <SupplementFacts />

      {/* FAQ - Objection Handling */}
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

      {/* 30-Day Guarantee */}
      <GuaranteeSection />

      {/* Final CTA with Urgency */}
      <FinalCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
