"use client";

import { Step4PremiumOffer } from "@/components/funnel/Step4PremiumOffer";
import { Step4TheOffer } from "@/components/funnel/Step4TheOffer";
import { Step4DigitalOffer } from "@/components/funnel/Step4DigitalOffer";
import { FinalThankYou } from "@/components/funnel/FinalThankYou";
import { useState } from "react";
import type { ScoringResult } from "@/lib/test/scoring";

interface SmartOfferProps {
  result: ScoringResult;
  userData: {
    firstName: string;
    age: string;
    weight: string;
    height: string;
    libido: string;
    morningEnergy: string;
    mood: string;
  };
}

export const SmartOffer = ({ result, userData }: SmartOfferProps) => {
  const [currentOffer, setCurrentOffer] = useState<'premium' | 'regular' | 'digital' | 'free'>(result.recommendedTier);

  const handleDecline = () => {
    // Downgrade tier when user declines
    switch (currentOffer) {
      case 'premium':
        setCurrentOffer('regular');
        break;
      case 'regular':
        setCurrentOffer('digital');
        break;
      case 'digital':
        setCurrentOffer('free');
        break;
      default:
        break;
    }
  };

  const handleSkipToFree = () => {
    setCurrentOffer('free');
  };

  // Show free thank you page
  if (currentOffer === 'free') {
    return <FinalThankYou userData={userData} />;
  }

  // Show premium offer
  if (currentOffer === 'premium') {
    return (
      <Step4PremiumOffer
        onDecline={handleDecline}
        userData={userData}
      />
    );
  }

  // Show regular offer (single bottle + plan)
  if (currentOffer === 'regular') {
    return (
      <Step4TheOffer
        onDecline={handleDecline}
        onSkipToFree={handleSkipToFree}
        userData={userData}
      />
    );
  }

  // Show digital offer (plan only)
  if (currentOffer === 'digital') {
    return (
      <Step4DigitalOffer
        onDecline={handleDecline}
        onSkipToFree={handleSkipToFree}
        userData={userData}
      />
    );
  }

  return null;
};
