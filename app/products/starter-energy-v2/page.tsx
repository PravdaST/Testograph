import React from 'react';
import HeroV2 from './components/sections/HeroV2';
import ProblemV2 from './components/sections/ProblemV2';
import FormulaV2 from './components/sections/FormulaV2';
import SystemFeaturesV2 from './components/sections/SystemFeaturesV2';
import SupplementV2 from './components/sections/SupplementV2';
import ValueBreakdownV2 from './components/sections/ValueBreakdownV2';
import ProofV2 from './components/sections/ProofV2';
import TestimonialsV2 from './components/sections/TestimonialsV2';
import PricingV2 from './components/sections/PricingV2';
import GuaranteeV2 from './components/sections/GuaranteeV2';
import WhyCheapV2 from './components/sections/WhyCheapV2';
import FAQV2 from './components/sections/FAQV2';
import FinalCTAV2 from './components/sections/FinalCTAV2';

export default function StarterEnergyV2Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero - Personal Transformation Story */}
      <HeroV2 />

      {/* 2. Problem - Pain Points */}
      <ProblemV2 />

      {/* 3. Formula - 100% System Breakdown */}
      <FormulaV2 />

      {/* 4. System Features - 4 Protocols + Tracking */}
      <SystemFeaturesV2 />

      {/* 5. Supplement - 12 Active Ingredients */}
      <SupplementV2 />

      {/* 6. Value Breakdown - Price Anchor */}
      <ValueBreakdownV2 />

      {/* 7. Proof - Stats & Results Timeline */}
      <ProofV2 />

      {/* 8. Testimonials - 7 Detailed Reviews */}
      <TestimonialsV2 />

      {/* 9. Pricing - 3 Packages */}
      <PricingV2 />

      {/* 10. Guarantee - 30-Day Money Back */}
      <GuaranteeV2 />

      {/* 11. Why Cheap - Transparent Pricing */}
      <WhyCheapV2 />

      {/* 12. FAQ - 10 Questions */}
      <FAQV2 />

      {/* 13. Final CTA - Two Choices Framework */}
      <FinalCTAV2 />
    </main>
  );
}
