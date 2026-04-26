'use client';

/**
 * DynamicOnboardingDialog — M5 config-driven replacement for hardcoded ladder.
 *
 * Reads stages from /api/v1/onboarding/status-v2 (pc_onboarding_stage table).
 * Renders the componentName from DB instead of hardcoded conditionals.
 * Supports per-brand stage overrides and custom stages (e.g. StageTravelSpecialization).
 *
 * Existing stage components (StageLanguage, etc.) are unchanged — they use the
 * v1 store internally. DynamicOnboardingDialog watches v1 status changes to
 * detect standard stage completions, and receives onComplete callbacks from
 * new custom stage components.
 *
 * Old OnboardingDialog kept as @deprecated for rollback safety.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Modal } from '@/components/ui';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { useUserOnboardingStore } from './stores/user-onboarding.store';
import { useAuthStore } from '@/stores/auth.store';
import { userOnboardingService } from './user-onboarding.service';
import type { OnboardingStatusV2 } from './user-onboarding.service';

// Existing stage components — no changes to these files
import { StageLanguage } from './stages/StageLanguage';
import { StageEmailOtp } from './stages/StageEmailOtp';
import { StageMobileOtp } from './stages/StageMobileOtp';
import { StageUserType } from './stages/StageUserType';
import { StageSubUserType } from './stages/StageSubUserType';
import { StageProfileRedirect } from './stages/StageProfileRedirect';

// New custom stage components — accept onComplete/onSkip props
import { StageTravelSpecialization } from './stages/StageTravelSpecialization';

// ── Component dictionary ───────────────────────────────────────────────────────
// Single source of truth: componentName from DB → React component
// Add new entries here as new stages are built — never hardcode stage names in JSX
const STAGE_COMPONENTS: Record<string, React.FC<any>> = {
  StageLanguage,
  StageEmailOtp,
  StageMobileOtp,
  StageUserType,
  StageSubUserType,
  StageProfileRedirect,
  StageTravelSpecialization,
};

export function DynamicOnboardingDialog() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const pathname = usePathname();
  const { status: v1Status, loading: v1Loading, fetchStatus } = useUserOnboardingStore();
  const token = useAuthStore((s) => s.token);

  const [v2, setV2] = useState<OnboardingStatusV2 | null>(null);
  const [v2Loading, setV2Loading] = useState(true);
  const prevStageRef = useRef<string | null>(null);

  const fetchV2 = useCallback(async () => {
    try {
      const data = await userOnboardingService.getStatusV2();
      setV2(data);
    } catch {
      // silent — if v2 fails, dialog stays hidden
    } finally {
      setV2Loading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!token) return;
    fetchStatus();
    fetchV2();
  }, [token, fetchStatus, fetchV2]);

  // Watch v1 stage changes — triggered when existing stage components complete via store
  useEffect(() => {
    const stage = v1Status?.stage ?? null;
    if (stage && stage !== prevStageRef.current) {
      prevStageRef.current = stage;
      fetchV2();
    }
  }, [v1Status?.stage, fetchV2]);

  // profile_redirect: close dialog and navigate (same as original OnboardingDialog)
  useEffect(() => {
    if (v2?.currentStage === 'profile_redirect' && !v2.complete) {
      if (!pathname.startsWith('/profile/setup')) {
        router.push('/profile/setup');
      }
    }
  }, [v2?.currentStage, v2?.complete, pathname, router]);

  // ── Guard conditions ──────────────────────────────────────────────────────────

  if (!token) return null;
  if (v2Loading || (!v2 && v1Loading)) return null;
  if (!v2) return null;
  if (v2.complete) return null;
  if (v2.totalStages === 0) return null;
  if (!v2.currentStage) return null;
  if (v2.currentStage === 'profile_redirect') return null; // handled by useEffect above

  // ── Resolve component ─────────────────────────────────────────────────────────

  const currentStageDef = v2.stages.find((s) => s.stageKey === v2.currentStage);
  if (!currentStageDef) return null;

  const StageComponent = STAGE_COMPONENTS[currentStageDef.componentName];
  if (!StageComponent) {
    console.warn(`[DynamicOnboardingDialog] Component not registered: ${currentStageDef.componentName}`);
    return null;
  }

  // ── Build stepper ─────────────────────────────────────────────────────────────

  const steps = v2.stages.map((s) => ({
    key: s.stageKey as any,
    label: s.stageLabel,
  }));

  const completedStages = v2.stages
    .filter((s) => s.completed)
    .map((s) => s.stageKey as any);

  // ── Props for custom stage components (existing ignore extra props) ────────────

  const stageProps: Record<string, any> = {
    onComplete: () => {
      fetchStatus(); // keep v1 store in sync
      fetchV2();    // advance v2 to next stage
    },
    onSkip: !currentStageDef.required
      ? async () => {
          // For custom stages: complete with empty data to advance
          try {
            await userOnboardingService.completeCustomStage(currentStageDef.stageKey);
          } catch { /* best-effort */ }
          fetchStatus();
          fetchV2();
        }
      : undefined,
  };

  return (
    <Modal
      open={true}
      closeOnOverlay={false}
      closeOnEscape={false}
      size="lg"
      header={
        <div style={{ padding: '24px 28px 0' }}>
          <p style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-primary, #b8894a)',
            fontWeight: 600,
            marginBottom: 4,
          }}>
            {t('welcome')}
          </p>
          <h2 style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: '0 0 16px',
            lineHeight: 1.3,
          }}>
            {t('subtitle')}
          </h2>
          <OnboardingStepper
            steps={steps}
            currentStage={v2.currentStage}
            completedStages={completedStages}
          />
        </div>
      }
    >
      <div style={{ minHeight: 280, padding: '4px 0' }}>
        <StageComponent {...stageProps} />
      </div>
    </Modal>
  );
}
