"use client";

import { SkepticHero } from "./components/SkepticHero";
import { ProblemValidationCards } from "./components/ProblemValidationCards";
import { System80_20Breakdown } from "./components/System80_20Breakdown";
import { FloatingCTA } from "../starter/components/shared/FloatingCTA";
import { ValueStackGrid } from "../starter/components/shared/ValueStackGrid";
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
import { libidoTestimonials } from "@/components/funnel/testimonials-data";
import { Package, FileText, MessageCircle, Users, Zap, Database } from "lucide-react";

export default function StarterSkepticPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://testograph.eu/products/starter-skeptic" />

      {/* Skip Links for Accessibility */}
      <a href="#value-stack" className="skip-link">
        Към офертата
      </a>
      <a href="#proof" className="skip-link">
        Към доказателствата
      </a>

      {/* Skeptic Hero - "99% са загуба на пари" */}
      <SkepticHero />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Problem Validation Cards - "Прав си да си скептичен" */}
      <ProblemValidationCards />

      {/* 80/20 System Breakdown - Core differentiation */}
      <System80_20Breakdown />

      {/* Value Stack Grid - FIRST PURCHASE MOMENT */}
      <ValueStackGrid
        items={[
          {
            name: "4 Complete Protocols (80% от системата)",
            value: 147,
            description: "Sleep, Nutrition, Training, Recovery - пълни, стъпка-по-стъпка протоколи. Не общи съвети, а точни инструкции. Средно +420 ng/dL boost само от протоколите.",
            icon: <FileText className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "Bulgarian Foods Database",
            value: "Включено",
            description: "500+ български продукти с макроси, микроси и хормонален профил. Compliance rate: 91% защото е адаптирано към България.",
            icon: <Database className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "TESTOUP Supplement (20% от системата)",
            value: 67,
            description: "Clinical doses. Zero proprietary blends. Виждаш точно какво взимаш. D-Aspartic Acid 3000mg, Vitamin D3 5000 IU, ZMA formula. +30-50 ng/dL boost като катализатор.",
            icon: <Package className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "Daily Check-In System",
            value: "Включено",
            description: "2-минутен дневен tracking. Consistency = резултати. 94% success rate при daily check-in users vs 34% без система.",
            icon: <Zap className="w-8 h-8" />,
            highlight: false
          },
          {
            name: "VIP Telegram Community",
            value: "Включено",
            description: "987 мъже които следват системата. 24/7 peer support, troubleshooting, mutual accountability. Community compliance rate: 87% vs 34% solo.",
            icon: <Users className="w-8 h-8" />,
            isBonus: true
          },
          {
            name: "30-Day Money-Back Guarantee",
            value: "Zero риск",
            description: "Следвай 100% за 30 дни. Ако не видиш results → full refund. Ние поемаме риска, не ти. Refund rate: <6%.",
            icon: <MessageCircle className="w-8 h-8" />,
            isBonus: true
          }
        ]}
        totalValue={214}
        discountedPrice={67}
        savings={147}
        spotsLeft={23}
        tier="regular"
      />

      {/* Ingredients Science - Full Transparency */}
      <section id="ingredients" className="py-16 md:py-24">
        <IngredientsScience />
      </section>

      {/* Benefits Section - 6 Key Benefits */}
      <BenefitsSection />

      {/* Solution Timeline - What to expect */}
      <SolutionTimeline />

      {/* Community Chat Proof - Social proof reinforcement */}
      <section id="proof">
        <CommunityChatsCarousel />
      </section>

      {/* Video Testimonials - From fellow skeptics */}
      <VideoTestimonialGrid testimonials={libidoTestimonials} />

      {/* Guarantee - Strong risk reversal */}
      <section className="py-16 md:py-24">
        <GuaranteeSection />
      </section>

      {/* FAQ - Skeptic Edition */}
      <section className="py-8 px-4 bg-muted/30">
        <FAQSection tier="regular" />
      </section>

      {/* Final CTA */}
      <FinalCTA />

      {/* Floating CTA Button (appears on scroll) */}
      <FloatingCTA />

      {/* Exit Intent */}
      <ExitIntentPopup />
    </div>
  );
}
