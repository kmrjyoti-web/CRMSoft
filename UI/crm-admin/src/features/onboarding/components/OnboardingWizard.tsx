"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Typography, Icon } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";

import { useOnboarding } from "../hooks/useOnboarding";
import { onboardingService } from "../services/onboarding.service";
import type { OnboardingStep } from "../types/onboarding.types";

import { CompanyProfileStep } from "./CompanyProfileStep";
import { InviteTeamStep } from "./InviteTeamStep";
import { ImportDataStep } from "./ImportDataStep";
import { CompletionStep } from "./CompletionStep";

// ── Step Config ──────────────────────────────────────────

const WIZARD_STEPS = [
  { key: "PROFILE_COMPLETED" as const, label: "Company Profile", icon: "building" as const },
  { key: "USERS_INVITED" as const, label: "Invite Team", icon: "users" as const },
  { key: "DATA_IMPORTED" as const, label: "Import Data", icon: "upload" as const },
  { key: "COMPLETED" as const, label: "Ready!", icon: "check-circle" as const },
];

// ── Wizard ───────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const [initialStep, setInitialStep] = useState<OnboardingStep>("CREATED");
  const [loading, setLoading] = useState(true);

  // Fetch current onboarding step from backend
  useEffect(() => {
    onboardingService
      .getSubscription()
      .then((sub) => {
        const tenant = sub?.tenant ?? sub;
        const step = tenant?.onboardingStep ?? "CREATED";
        if (step === "COMPLETED") {
          router.push("/dashboard");
          return;
        }
        setInitialStep(step);
      })
      .catch(() => {
        // If we can't fetch, start from beginning
        setInitialStep("CREATED");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  return <WizardContent initialStep={initialStep} />;
}

function WizardContent({ initialStep }: { initialStep: OnboardingStep }) {
  const { wizardStep, completeStep, isComplete } = useOnboarding(initialStep);
  const [activeStep, setActiveStep] = useState(() => {
    // Map initial step to wizard index
    const map: Record<OnboardingStep, number> = {
      CREATED: 0,
      PROFILE_COMPLETED: 1,
      USERS_INVITED: 2,
      DATA_IMPORTED: 3,
      COMPLETED: 3,
    };
    return map[initialStep] ?? 0;
  });

  const handleStepComplete = async (nextStep: OnboardingStep) => {
    const success = await completeStep(nextStep);
    if (success) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    const nextStepKey = WIZARD_STEPS[activeStep]?.key;
    if (nextStepKey) {
      await handleStepComplete(nextStepKey);
    }
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="heading" level={2} className="mb-1">
          Welcome to CRM Admin!
        </Typography>
        <Typography variant="text" color="muted">
          Let&apos;s set up your workspace in a few easy steps
        </Typography>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {WIZARD_STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full, 9999px)",
                background:
                  index <= activeStep
                    ? "var(--color-primary)"
                    : "var(--surface-bg, #f1f5f9)",
                color: index <= activeStep ? "#fff" : "var(--text-muted, #94a3b8)",
                fontSize: "13px",
                fontWeight: index === activeStep ? 600 : 400,
                transition: "all 0.3s ease",
              }}
            >
              <Icon name={step.icon} size={14} />
              <span className="hidden md:inline">{step.label}</span>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                style={{
                  width: "32px",
                  height: "2px",
                  background:
                    index < activeStep
                      ? "var(--color-primary)"
                      : "var(--border-color, #e2e8f0)",
                  margin: "0 6px",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        style={{
          border: "1px solid var(--border-color, #e2e8f0)",
          borderRadius: "var(--radius-lg, 12px)",
          padding: "32px 28px",
          background: "var(--surface-bg, #fff)",
        }}
      >
        {activeStep === 0 && (
          <CompanyProfileStep
            onComplete={() => handleStepComplete("PROFILE_COMPLETED")}
            onSkip={handleSkip}
          />
        )}
        {activeStep === 1 && (
          <InviteTeamStep
            onComplete={() => handleStepComplete("USERS_INVITED")}
            onSkip={handleSkip}
          />
        )}
        {activeStep === 2 && (
          <ImportDataStep
            onComplete={() => handleStepComplete("DATA_IMPORTED")}
            onSkip={handleSkip}
          />
        )}
        {activeStep === 3 && (
          <CompletionStep
            onComplete={() => handleStepComplete("COMPLETED")}
          />
        )}
      </div>

      {/* Step count */}
      <Typography
        variant="text"
        color="muted"
        size="13px"
        className="text-center mt-4"
      >
        Step {activeStep + 1} of {WIZARD_STEPS.length}
      </Typography>
    </div>
  );
}
