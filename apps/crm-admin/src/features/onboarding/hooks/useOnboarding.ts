import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import { onboardingService } from "../services/onboarding.service";
import type { OnboardingStep } from "../types/onboarding.types";

const STEP_ORDER: OnboardingStep[] = [
  "CREATED",
  "PROFILE_COMPLETED",
  "USERS_INVITED",
  "DATA_IMPORTED",
  "COMPLETED",
];

export function useOnboarding(initialStep: OnboardingStep = "CREATED") {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const wizardStep = Math.max(0, stepIndex - 1); // CREATED = -1, so wizard starts at 0

  const completeStep = useCallback(
    async (step: OnboardingStep) => {
      setLoading(true);
      try {
        await onboardingService.completeStep(step);
        setCurrentStep(step);
        return true;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to complete step";
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const goToNextStep = useCallback(async () => {
    const nextIndex = STEP_ORDER.indexOf(currentStep) + 1;
    if (nextIndex < STEP_ORDER.length) {
      return completeStep(STEP_ORDER[nextIndex]);
    }
    return false;
  }, [currentStep, completeStep]);

  const skipStep = useCallback(async () => {
    return goToNextStep();
  }, [goToNextStep]);

  return {
    currentStep,
    wizardStep,
    loading,
    completeStep,
    goToNextStep,
    skipStep,
    isComplete: currentStep === "COMPLETED",
    totalSteps: 4, // Profile, Invite, Import, Complete
  };
}
