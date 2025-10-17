"use client";

import { FertilityHero } from "./components/FertilityHero";
import { FertilityProblemAgitationCards } from "./components/FertilityProblemAgitationCards";
import { FloatingCTA } from "../starter/components/shared/FloatingCTA";
import { ValueStackGrid } from "../starter/components/shared/ValueStackGrid";
import { DividerTransition } from "../starter/components/shared/SectionTransition";
import { SolutionTimeline } from "../starter/components/SolutionTimeline";
import { IngredientsScience } from "@/components/funnel/IngredientsScience";
import { BenefitsSection } from "@/components/funnel/BenefitsSection";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "../starter/components/GuaranteeSection";
import { FinalCTA } from "../starter/components/FinalCTA";
import { ExitIntentPopup } from "../starter/components/ExitIntentPopup";
import { SocialProofBanner } from "../starter/components/SocialProofBanner";
import { CommunityChatsCarousel } from "@/components/funnel/CommunityChatsCarousel";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { fertilityTestimonials } from "@/components/funnel/testimonials-data";
import { Package, FileText, MessageCircle, Users, Zap } from "lucide-react";

export default function StarterFertilityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://testograph.eu/products/starter" />

      {/* Skip Links for Accessibility */}
      <a href="#value-stack" className="skip-link">
        Към офертата
      </a>
      <a href="#testimonials" className="skip-link">
        Към отзивите
      </a>

      {/* New Modern Hero */}
      <FertilityHero />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* New Problem Agitation Cards */}
      <FertilityProblemAgitationCards />

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* New Value Stack Grid - FIRST PURCHASE MOMENT */}
      <ValueStackGrid
        items={[
          {
            name: "TestoUP бутилка (60 капсули)",
            value: 67,
            description: "Селен + Цинк + Витамин D - тройката за подобрена спермограма.",
            icon: <Package className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "TestographPRO 30-дневен протокол",
            value: 197,
            description: "Храна за фертилност. Добавки. Изследвания. Точен план.",
            icon: <FileText className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "24/7 Хормонален Експерт поддръжка",
            value: "Включена",
            description: "Питай за спермограма резултати. Питай за следващи стъпки. Винаги на линия.",
            icon: <MessageCircle className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "VIP Telegram общност",
            value: 29,
            description: "Мъже на същия път. Споделяте спермограми. Споделяте надежди.",
            icon: <Users className="w-8 h-8" />,
            isBonus: true
          },
          {
            name: "БОНУС: 7-дневен план за бърз старт",
            value: 49,
            description: "Започни СЕГА. Всеки ден има значение.",
            icon: <Zap className="w-8 h-8" />,
            isBonus: true
          }
        ]}
        totalValue={342}
        discountedPrice={97}
        savings={245}
        spotsLeft={12}
        tier="regular"
      />

      {/* Ingredients Science - After the offer */}
      <IngredientsScience />

      {/* Benefits Section - 6 Key Benefits */}
      <BenefitsSection />

      {/* Community Chat Proof - Social proof reinforcement */}
      <CommunityChatsCarousel />

      {/* Video Testimonials */}
      <VideoTestimonialGrid testimonials={fertilityTestimonials} />

      {/* Final CTA */}
      <FinalCTA />

      {/* Guarantee - Above FAQ */}
      <GuaranteeSection />

      {/* FAQ - At Bottom */}
      <section className="py-8 px-4 bg-muted/30">
        <FAQSection tier="regular" />
      </section>

      {/* Floating CTA Button (appears on scroll) */}
      <FloatingCTA />

      {/* Exit Intent */}
      <ExitIntentPopup />
    </div>
  );
}
