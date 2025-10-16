"use client";

import { HeroSection } from "./components/HeroSection";
import { SocialProofBanner } from "./components/SocialProofBanner";
import { WhyTestoUp } from "./components/WhyTestoUp";
import { IngredientTable } from "./components/IngredientTable";
import { BulkPricing } from "./components/BulkPricing";
import { SuccessStoriesWall } from "@/components/ui/SuccessStoriesWall";
import { HowToUse } from "./components/HowToUse";
import { ComparisonTable } from "./components/ComparisonTable";
import { FAQSection } from "@/components/funnel/FAQSection";
import { GuaranteeSection } from "./components/GuaranteeSection";
import { FinalCTA } from "./components/FinalCTA";

export default function TestoUpProductPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof Banner */}
      <SocialProofBanner />

      {/* Why TestoUP */}
      <WhyTestoUp />

      {/* Ingredient Table */}
      <IngredientTable />

      {/* Bulk Pricing Options */}
      <BulkPricing />

      {/* Success Stories */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Реални Резултати
            </h2>
            <p className="text-lg text-muted-foreground">
              Над 5,000 мъже вече използват TestoUP ежедневно
            </p>
          </div>
          <SuccessStoriesWall />
        </div>
      </section>

      {/* How To Use */}
      <HowToUse />

      {/* Comparison with packages */}
      <ComparisonTable />

      {/* FAQ */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Често Задавани Въпроси
            </h2>
            <p className="text-lg text-muted-foreground">
              Отговори на всички твои въпроси за TestoUP
            </p>
          </div>
          <FAQSection tier="testoup" />
        </div>
      </section>

      {/* Guarantee */}
      <GuaranteeSection />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
