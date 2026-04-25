'use client';

export type OnboardingStageKey =
  | 'language'
  | 'email_otp'
  | 'mobile_otp'
  | 'user_type'
  | 'vertical_profile';

interface StepDef {
  key: OnboardingStageKey;
  label: string;
}

interface OnboardingStepperProps {
  steps: StepDef[];
  currentStage: OnboardingStageKey | string;
  completedStages: (OnboardingStageKey | string)[];
}

export function OnboardingStepper({ steps, currentStage, completedStages }: OnboardingStepperProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        width: '100%',
        marginBottom: 32,
      }}
    >
      {steps.map((step, idx) => {
        const isCompleted = completedStages.includes(step.key);
        const isActive = currentStage === step.key;

        return (
          <div
            key={step.key}
            style={{ display: 'flex', alignItems: 'center', flex: 1 }}
          >
            {/* Step circle */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
                transition: 'all 300ms ease',
                background: isCompleted
                  ? 'var(--brand-success, #10b981)'
                  : isActive
                  ? 'var(--brand-primary, #b8894a)'
                  : 'rgba(255,255,255,0.08)',
                color: isCompleted || isActive ? '#fff' : 'var(--brand-muted, #94a3b8)',
                border: isActive
                  ? '2px solid var(--brand-primary, #b8894a)'
                  : isCompleted
                  ? '2px solid var(--brand-success, #10b981)'
                  : '2px solid rgba(255,255,255,0.12)',
              }}
            >
              {isCompleted ? '✓' : idx + 1}
            </div>

            {/* Connector bar — not after last step */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: '0 4px',
                  borderRadius: 1,
                  background: isCompleted
                    ? 'var(--brand-success, #10b981)'
                    : 'rgba(255,255,255,0.08)',
                  transition: 'background 400ms ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
