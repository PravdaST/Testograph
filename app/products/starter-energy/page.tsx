"use client";

import { EnergyHero } from "./components/EnergyHero";
import { EnergyProblemAgitationCards } from "./components/EnergyProblemAgitationCards";
import { FloatingCTA } from "../starter/components/shared/FloatingCTA";
import { ValueStackGrid } from "../starter/components/shared/ValueStackGrid";
import { DividerTransition } from "../starter/components/shared/SectionTransition";
import { SolutionTimeline } from "../starter/components/SolutionTimeline";
import { HowItWorks } from "../starter/components/HowItWorks";
import { IngredientsScience } from "@/components/funnel/IngredientsScience";
import { BenefitsSection } from "@/components/funnel/BenefitsSection";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "../starter/components/GuaranteeSection";
import { FinalCTA } from "../starter/components/FinalCTA";
import { ExitIntentPopup } from "../starter/components/ExitIntentPopup";
import { SocialProofBanner } from "../starter/components/SocialProofBanner";
import { CommunityChatsCarousel } from "@/components/funnel/CommunityChatsCarousel";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { Package, FileText, MessageCircle, Users, Zap } from "lucide-react";

export default function StarterEnergyPage() {
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
      <EnergyHero />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* New Problem Agitation Cards */}
      <EnergyProblemAgitationCards />

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* Community Chat Proof */}
      <CommunityChatsCarousel />

      {/* Ingredients Science - Moved before offer for better conversion */}
      <IngredientsScience />

      {/* Benefits Section - 6 Key Benefits */}
      <BenefitsSection />

      {/* How It Works - 3 Simple Steps */}
      <HowItWorks />

      {/* New Value Stack Grid */}
      <ValueStackGrid
        items={[
          {
            name: "TestoUP бутилка (60 капсули)",
            value: 67,
            description: "24000% РДА B12 + 700% РДА D3 = Експлозивна енергия.",
            icon: <Package className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "TestographPRO 30-дневен протокол",
            value: 197,
            description: "Сън. Храна. Добавки. Всичко за максимална енергия.",
            icon: <FileText className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "24/7 Хормонален Експерт поддръжка",
            value: "Включена",
            description: "Питай за умора. Питай за сън. Винаги на линия.",
            icon: <MessageCircle className="w-8 h-8" />,
            highlight: true
          },
          {
            name: "VIP Telegram общност",
            value: 29,
            description: "Мъже които се събудиха. Споделят как.",
            icon: <Users className="w-8 h-8" />,
            isBonus: true
          },
          {
            name: "БОНУС: 7-дневен план за бърз старт",
            value: 49,
            description: "Почувствай разликата в първата седмица.",
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

      {/* Video Testimonials */}
      <VideoTestimonialGrid />

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
