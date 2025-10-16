"use client";

import { EnergyHero } from "./components/EnergyHero";
import { EnergyProblemAgitationCards } from "./components/EnergyProblemAgitationCards";
import { FloatingCTA } from "../starter/components/shared/FloatingCTA";
import { ValueStackGrid } from "../starter/components/shared/ValueStackGrid";
import { WaveTransition, DividerTransition } from "../starter/components/shared/SectionTransition";
import { SolutionTimeline } from "../starter/components/SolutionTimeline";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { HowItWorks } from "../starter/components/HowItWorks";
import { IngredientsScience } from "@/components/funnel/IngredientsScience";
import { TestographProSection } from "@/components/funnel/TestographProSection";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "../starter/components/GuaranteeSection";
import { FinalCTA } from "../starter/components/FinalCTA";
import { ExitIntentPopup } from "../starter/components/ExitIntentPopup";
import { SocialProofBanner } from "../starter/components/SocialProofBanner";
import { CommunityChatsCarousel } from "@/components/funnel/CommunityChatsCarousel";
import { VideoTestimonialGrid } from "@/components/funnel/VideoTestimonialGrid";
import { DetailedTestimonialCards } from "@/components/funnel/DetailedTestimonialCards";
import { Package, FileText, Headphones, Users, Zap } from "lucide-react";

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

      {/* Wave Transition */}
      <WaveTransition color="muted" />

      {/* Social Proof Banner */}
      <SocialProofBanner />


      {/* New Problem Agitation Cards */}
      <EnergyProblemAgitationCards />

      {/* Solution Timeline */}
      <SolutionTimeline />

      {/* Wave Transition */}
      <WaveTransition color="primary" flip />

      {/* Detailed Testimonials - ENERGY SPECIFIC */}
      <DetailedTestimonialCards angle="energy" limit={2} />

      {/* Divider Transition */}
      <DividerTransition />

      {/* Community Chat Proof */}
      <CommunityChatsCarousel />

      {/* Wave Transition */}
      <WaveTransition color="accent" />

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
            icon: <Headphones className="w-8 h-8" />,
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

      {/* Wave Transition */}
      <WaveTransition color="accent" />

      {/* Success Stories - ENERGY FOCUS */}
      <section id="testimonials" className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Мъже Които Се Събудиха
            </h2>
            <p className="text-lg text-muted-foreground">
              От 3 кафета дневно до тичане сутрин. От зомби до жив.
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>


      {/* Video Testimonials */}
      <VideoTestimonialGrid />

      {/* Wave Transition */}
      <WaveTransition color="primary" />

      {/* How It Works */}
      <HowItWorks />


      {/* Ingredients Science - Consolidated Section */}
      <IngredientsScience />

      {/* TestographPRO Protocol Section */}
      <TestographProSection />

      {/* Wave Transition */}
      <WaveTransition color="muted" flip />

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

      {/* Wave Transition */}
      <WaveTransition color="primary" />

      {/* Guarantee */}
      <GuaranteeSection />


      {/* Final CTA */}
      <FinalCTA />

      {/* Floating CTA Button (appears on scroll) */}
      <FloatingCTA />

      {/* Exit Intent */}
      <ExitIntentPopup />
    </div>
  );
}
