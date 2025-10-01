import { useState, useEffect } from "react";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { LoadingHeader } from "./LoadingHeader";
import { Step1DataAnalysis } from "./Step1DataAnalysis";
import { Step2ThreeKillers } from "./Step2ThreeKillers";
import { Step3StefanStory } from "./Step3StefanStory";
import { Step4TheOffer } from "./Step4TheOffer";
import { ExitPopupDialog } from "./ExitPopupDialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);

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

  // Auto-advance timers (OPTIMIZED: 105s → 67s)
  useEffect(() => {
    let advanceTimer: NodeJS.Timeout;

    if (currentStep === 1) {
      // Step 1: 12 seconds (was 20s), progress 0% → 25%
      advanceTimer = setTimeout(() => {
        setCurrentStep(2);
      }, 12000);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 25) return prev + 2.08; // 25/12
          return 25;
        });
      }, 1000);

      return () => {
        clearTimeout(advanceTimer);
        clearInterval(progressInterval);
      };
    } else if (currentStep === 2) {
      // Step 2: 25 seconds (was 37s), progress 25% → 55%
      advanceTimer = setTimeout(() => {
        setCurrentStep(3);
      }, 25000);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 55) return prev + 1.2; // 30/25
          return 55;
        });
      }, 1000);

      return () => {
        clearTimeout(advanceTimer);
        clearInterval(progressInterval);
      };
    } else if (currentStep === 3) {
      // Step 3: 30 seconds (was 48s), progress 55% → 85%
      advanceTimer = setTimeout(() => {
        setCurrentStep(4);
      }, 30000);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 85) return prev + 1.0; // 30/30
          return 85;
        });
      }, 1000);

      return () => {
        clearTimeout(advanceTimer);
        clearInterval(progressInterval);
      };
    } else if (currentStep === 4) {
      // Step 4: Progress 85% → 98% over 15 seconds, then freeze
      let elapsed = 0;
      const progressInterval = setInterval(() => {
        elapsed += 1;
        if (elapsed <= 15) {
          setProgress(85 + (elapsed * 0.87)); // 85 + 13 = 98
        } else {
          setProgress(98);
        }
      }, 1000);

      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [currentStep]);

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDecline = () => {
    setShowExitPopup(true);
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Step 1: No loading bar */}
      {currentStep === 1 && null}
      
      {/* Steps 2-3: Loading header with dynamic progress */}
      {(currentStep === 2 || currentStep === 3) && (
        <LoadingHeader progress={progress} />
      )}
      
      {/* Step 4: Loading header with flicker animation at 98% */}
      {currentStep === 4 && (
        <LoadingHeader progress={98} flicker />
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

      {/* Step Content */}
      <div className="pt-8">
        {currentStep === 1 && <Step1DataAnalysis userData={userData} />}
        {currentStep === 2 && <Step2ThreeKillers userData={userData} />}
        {currentStep === 3 && <Step3StefanStory userData={userData} />}
        {currentStep === 4 && <Step4TheOffer onDecline={handleDecline} userData={userData} />}
      </div>

      {/* Exit Popup */}
      <ExitPopupDialog open={showExitPopup} onOpenChange={setShowExitPopup} />
    </div>
  );
};
