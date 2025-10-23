import Hero from './components/sections/Hero';
import Problem from './components/sections/Problem';
import Formula from './components/sections/Formula';
import SystemFeatures from './components/sections/SystemFeatures';
import Supplement from './components/sections/Supplement';
import ValueBreakdown from './components/sections/ValueBreakdown';
import Proof from './components/sections/Proof';
import Testimonials from './components/sections/Testimonials';
import Pricing from './components/sections/Pricing';
import Guarantee from './components/sections/Guarantee';
import WhyCheap from './components/sections/WhyCheap';
import FAQ from './components/sections/FAQ';
import FinalCTA from './components/sections/FinalCTA';

export default function StarterEnergyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero - Personal Transformation Story */}
      <Hero />

      {/* 2. Problem - Pain Points */}
      <Problem />

      {/* 3. Formula - 100% System Breakdown */}
      <Formula />

      {/* 4. System Features - 4 Protocols + Tracking */}
      <SystemFeatures />

      {/* 5. Supplement - 12 Active Ingredients */}
      <Supplement />

      {/* 6. Value Breakdown - Price Anchor */}
      <ValueBreakdown />

      {/* 7. Proof - Stats & Results Timeline */}
      <Proof />

      {/* 8. Testimonials - 7 Detailed Reviews */}
      <Testimonials />

      {/* 9. Pricing - 3 Packages */}
      <Pricing />

      {/* 10. Guarantee - 30-Day Money Back */}
      <Guarantee />

      {/* 11. Why Cheap - Transparent Pricing */}
      <WhyCheap />

      {/* 12. FAQ - 10 Questions */}
      <FAQ />

      {/* 13. Final CTA - Two Choices Framework */}
      <FinalCTA />
    </main>
  );
}
