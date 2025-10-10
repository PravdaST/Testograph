import { useState, useEffect, useRef } from "react";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { LoadingHeader } from "./LoadingHeader";
import { Step1DataAnalysis } from "./Step1DataAnalysis";
import { Step2aDream } from "./Step2aDream";
import { Step2bVillain } from "./Step2bVillain";
import { Step2cChoice } from "./Step2cChoice";
import { Step3aProof } from "./Step3aProof";
import { Step3bSpeed } from "./Step3bSpeed";
import { Step3cEase } from "./Step3cEase";
import { Step4PremiumOffer } from "./Step4PremiumOffer";
import { Step4TheOffer } from "./Step4TheOffer";
import { Step4DigitalOffer } from "./Step4DigitalOffer";
import { FinalThankYou } from "./FinalThankYou";
import { ExitPopupDialog } from "./ExitPopupDialog";
import { SocialProofNotification } from "./SocialProofNotification";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  initFunnelSession,
  trackStepEntered,
  trackStepExited,
  trackSkipUsed,
  trackButtonClick,
  trackExitIntent,
  updateOfferTier,
  trackFunnelExit,
} from "@/lib/analytics/funnel-tracker";
import { trackViewContent, trackAddToCart, trackLead, fbqTrackCustom } from "@/lib/facebook-pixel";

type OfferTier = 'premium' | 'single' | 'digital' | 'rejected' | null;

interface UserData {
  firstName?: string;
  age?: string;
  weight?: string;
  height?: string;
  libido?: string;
  morningEnergy?: string;
  mood?: string;
}

interface WaitingRoomFunnelProps {
  userData?: UserData;
}

export const WaitingRoomFunnel = ({ userData }: WaitingRoomFunnelProps) => {
  // localStorage keys
  const PROGRESS_KEY = 'testograph_funnel_progress';
  const PROGRESS_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);

      // Check if expired (24h)
      if (Date.now() - data.timestamp > PROGRESS_EXPIRY) {
        localStorage.removeItem(PROGRESS_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading saved progress:', error);
      return null;
    }
  };

  const savedProgress = loadSavedProgress();

  const [currentStep, setCurrentStep] = useState(savedProgress?.currentStep || 1);
  const [progress, setProgress] = useState(savedProgress?.progress || 0);
  const [canSkip, setCanSkip] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [currentOfferTier, setCurrentOfferTier] = useState<OfferTier>(savedProgress?.currentOfferTier || 'premium');
  const [userChoice, setUserChoice] = useState<number | null>(savedProgress?.userChoice || null);

  // Total micro-steps: 1(loading) + 2a,2b,2c + 3a,3b,3c + 4(offer) = 8 steps
  const totalSteps = 8;

  // Tracking: Store entry time for each step to calculate time spent
  const stepEntryTimeRef = useRef<number>(Date.now());

  // Save progress to localStorage
  const saveProgress = () => {
    if (typeof window === 'undefined') return;

    try {
      const progressData = {
        currentStep,
        progress,
        currentOfferTier,
        userChoice,
        userData,
        timestamp: Date.now(),
      };

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Clear saved progress
  const clearProgress = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PROGRESS_KEY);
  };

  // Initialize funnel session on mount
  useEffect(() => {
    initFunnelSession(userData);

    // Show notification if progress was restored
    if (savedProgress) {
      console.log('✅ Funnel progress restored from localStorage');
    }
  }, []);

  // Hide header when funnel is active
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    return () => {
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  // Track step changes and save progress
  useEffect(() => {
    // Track step entered
    trackStepEntered(currentStep);
    stepEntryTimeRef.current = Date.now();

    // Facebook Pixel: Track ViewContent for each funnel step
    const stepNames: Record<number, string> = {
      1: 'Funnel Step 1 - Data Analysis',
      2: 'Funnel Step 2 - Dream State',
      3: 'Funnel Step 3 - Villain/Problem',
      4: 'Funnel Step 4 - Interactive Choice',
      5: 'Funnel Step 5 - Social Proof',
      6: 'Funnel Step 6 - Speed/Timeline',
      7: 'Funnel Step 7 - Ease of Implementation',
      8: 'Funnel Step 8 - Product Offer'
    };

    if (stepNames[currentStep]) {
      trackViewContent(stepNames[currentStep], 'funnel_step');
    }

    // Save progress on step change
    saveProgress();

    // Track step exited on cleanup
    return () => {
      const timeSpentSeconds = Math.floor((Date.now() - stepEntryTimeRef.current) / 1000);
      trackStepExited(currentStep, timeSpentSeconds);
    };
  }, [currentStep, currentOfferTier, userChoice]);

  // Track offer tier changes (only when user first reaches step 8)
  useEffect(() => {
    if (currentStep === 8) {
      // Track offer viewed in internal analytics
      if (currentOfferTier === 'premium') {
        updateOfferTier('premium');
      }

      // Facebook Pixel: Track AddToCart when viewing offers
      const offerData: Record<string, { name: string; value: number }> = {
        'premium': { name: 'Testograph PRO Premium Bundle', value: 69 },
        'single': { name: 'Testograph PRO Single Bottle', value: 29 },
        'digital': { name: 'Testograph Digital Guides', value: 19 }
      };

      if (currentOfferTier && currentOfferTier !== 'rejected' && offerData[currentOfferTier]) {
        const offer = offerData[currentOfferTier];
        trackAddToCart(offer.name, offer.value, 'BGN');
      }
    }
  }, [currentStep, currentOfferTier]);

  // Track user choice from Step 2c
  useEffect(() => {
    if (userChoice !== null) {
      import('@/lib/analytics/funnel-tracker').then(({ trackChoiceMade }) => {
        trackChoiceMade(4, userChoice);
      });

      // Facebook Pixel: Track custom choice event
      fbqTrackCustom('FunnelChoiceMade', {
        step: 4,
        choice: userChoice,
        choice_name: `Choice ${userChoice}`
      });
    }
  }, [userChoice]);

  // Skip button logic - show after 6 seconds (optimized from 10s)
  useEffect(() => {
    if (currentStep < 4) {
      setCanSkip(false);
      const timer = setTimeout(() => {
        setCanSkip(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Exit intent detection - only on offer pages (step 8)
  useEffect(() => {
    if (currentStep !== 8) return;

    let hasShownPopup = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport (not scrolling)
      if (e.clientY < 10 && !hasShownPopup) {
        hasShownPopup = true;
        setShowExitPopup(true);
        trackExitIntent(currentStep, { offerTier: currentOfferTier });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentStep, currentOfferTier]);

  // Auto-advance timers (NEW: Engagement-driven with slow progress)
  useEffect(() => {
    let advanceTimer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (currentStep === 1) {
      // Step 1: 16s slow progress to 11%, then rapid complete to 12%
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 11) return prev + 0.7;
          return 11;
        });
      }, 1000);

      // After 16 seconds, rapidly complete to 12% and advance
      advanceTimer = setTimeout(() => {
        clearInterval(progressInterval);

        const rapidComplete = setInterval(() => {
          setProgress((prev) => {
            if (prev < 12) {
              return Math.min(prev + 2.5, 12);
            }
            clearInterval(rapidComplete);
            return 12;
          });
        }, 40);

        setTimeout(() => {
          clearInterval(rapidComplete);
          setProgress(12);
          setCurrentStep(2);
        }, 200);
      }, 16000);

      return () => {
        clearTimeout(advanceTimer);
        clearInterval(progressInterval);
      };
    }

    // Steps 2-7: SLOW continuous progress (engagement)
    // Leave 3% buffer before target so it completes on proceed
    const progressMap: Record<number, number> = {
      2: 25,
      3: 37,
      4: 50,
      5: 62,
      6: 75,
      7: 87,
      8: 98
    };

    if (currentStep >= 2 && currentStep <= 7) {
      const targetProgress = progressMap[currentStep];
      const maxProgress = targetProgress - 3; // Leave 3% buffer

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < maxProgress) return prev + 0.4; // Slow increment (0.4% every 1s)
          return maxProgress;
        });
      }, 1000);

      return () => clearInterval(progressInterval);
    }

    if (currentStep === 8) {
      // Step 8 (Offer): Slow progress to 98%
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 98) return prev + 0.4;
          return 98;
        });
      }, 1000);

      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [currentStep]);

  const handleSkip = () => {
    if (currentStep < 8) {
      // Track skip usage
      trackSkipUsed(currentStep);

      // Rapidly complete progress to target % before advancing
      const progressMap: Record<number, number> = {
        1: 12,
        2: 25,
        3: 37,
        4: 50,
        5: 62,
        6: 75,
        7: 87
      };

      const targetProgress = progressMap[currentStep];

      // Fast interval to complete remaining progress
      const rapidComplete = setInterval(() => {
        setProgress((prev) => {
          if (prev < targetProgress) {
            return Math.min(prev + 2.5, targetProgress); // +2.5% every 40ms
          }
          clearInterval(rapidComplete);
          return targetProgress;
        });
      }, 40);

      // Advance step after rapid completion
      setTimeout(() => {
        clearInterval(rapidComplete);
        setProgress(targetProgress); // Ensure at target
        setCurrentStep(currentStep + 1);
      }, 200);
    }
  };

  const handleDecline = () => {
    // Track decline button click
    trackButtonClick(currentStep, 'Decline', {
      previousTier: currentOfferTier,
      action: 'decline_offer'
    });

    // Scroll to top for better UX when switching offers
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tier downsell logic
    if (currentOfferTier === 'premium') {
      // Declined premium → show single bottle offer
      setCurrentOfferTier('single');
      updateOfferTier('single');
    } else if (currentOfferTier === 'single') {
      // Declined single → show digital-only offer
      setCurrentOfferTier('digital');
      updateOfferTier('digital');
    } else {
      // Declined digital → show final thank you message
      setCurrentOfferTier('rejected');
      trackFunnelExit(currentStep, false);
    }
  };

  const handleSkipToFree = () => {
    // Track skip to free plan
    trackButtonClick(currentStep, 'Skip to Free', {
      previousTier: currentOfferTier,
      action: 'skip_to_free'
    });
    trackFunnelExit(currentStep, false);

    // Facebook Pixel: Track Lead for free PDF (no purchase)
    trackLead('Free PDF - Skipped Paid Offer', 0);

    // Skip directly to free plan (final thank you)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentOfferTier('rejected');

    // Clear progress when funnel completes
    clearProgress();
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Step 1: No loading bar */}
      {currentStep === 1 && null}

      {/* Steps 2-7: Loading header with dynamic progress */}
      {currentStep >= 2 && currentStep <= 7 && (
        <LoadingHeader progress={progress} userName={userData?.firstName} />
      )}

      {/* Step 8 (Offer): Loading header with flicker animation at 98% */}
      {currentStep === 8 && currentOfferTier !== 'rejected' && (
        <LoadingHeader progress={98} flicker userName={userData?.firstName} />
      )}

      {/* Skip Button */}
      {canSkip && currentStep < 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="fixed top-6 right-4 z-40 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
        >
          Прескочи <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {/* DEV MODE: Navigation Controls - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/80 backdrop-blur-sm rounded-full p-2 border border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="text-white hover:bg-white/20"
          >
            ← Step {currentStep - 1}
          </Button>

          <div className="flex items-center gap-2 px-3">
            <span className="text-white text-sm font-semibold">
              Step {currentStep}/{totalSteps}
            </span>
            {currentStep === totalSteps && (
              <span className="text-xs text-white/60">
                ({currentOfferTier})
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="text-white hover:bg-white/20"
          >
            Step {currentStep + 1} →
          </Button>

          {currentStep === totalSteps && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const tiers: OfferTier[] = ['premium', 'single', 'digital'];
                const currentIndex = tiers.indexOf(currentOfferTier!);
                const nextIndex = (currentIndex + 1) % tiers.length;
                setCurrentOfferTier(tiers[nextIndex]);
              }}
              className="text-orange-400 hover:bg-orange-500/20 border-l border-white/20 ml-2"
            >
              Switch Tier
            </Button>
          )}
        </div>
      )}

      {/* Step Content - Mobile-first micro-steps */}
      <div className="pt-10">
        {/* Step 1: Loading */}
        {currentStep === 1 && <Step1DataAnalysis userData={userData} onProceed={handleSkip} />}

        {/* Step 2: The Dream (emotion first) */}
        {currentStep === 2 && <Step2aDream onProceed={handleSkip} userData={userData} />}

        {/* Step 3: The Villain (personalized enemy) */}
        {currentStep === 3 && <Step2bVillain onProceed={handleSkip} userData={userData} />}

        {/* Step 4: Interactive Choice */}
        {currentStep === 4 && (
          <Step2cChoice
            onProceed={(choice) => {
              setUserChoice(choice);
              handleSkip();
            }}
            userData={userData}
          />
        )}

        {/* Step 5: Proof (emotion → logic) */}
        {currentStep === 5 && <Step3aProof onProceed={handleSkip} userData={userData} />}

        {/* Step 6: Speed/Timeline */}
        {currentStep === 6 && <Step3bSpeed onProceed={handleSkip} userData={userData} />}

        {/* Step 7: Ease/Effort */}
        {currentStep === 7 && <Step3cEase onProceed={handleSkip} userData={userData} />}

        {/* Step 8: The Offer (tiered) */}
        {currentStep === 8 && currentOfferTier === 'premium' && (
          <Step4PremiumOffer onDecline={handleDecline} userData={userData} />
        )}
        {currentStep === 8 && currentOfferTier === 'single' && (
          <Step4TheOffer onDecline={handleDecline} onSkipToFree={handleSkipToFree} userData={userData} />
        )}
        {currentStep === 8 && currentOfferTier === 'digital' && (
          <Step4DigitalOffer onDecline={handleDecline} onSkipToFree={handleSkipToFree} userData={userData} />
        )}
        {currentStep === 8 && currentOfferTier === 'rejected' && (
          <FinalThankYou userData={userData} />
        )}
      </div>

      {/* Social Proof Notifications */}
      {currentStep >= 3 && <SocialProofNotification />}

      {/* Exit Popup */}
      <ExitPopupDialog open={showExitPopup} onOpenChange={setShowExitPopup} userData={userData} />
    </div>
  );
};
