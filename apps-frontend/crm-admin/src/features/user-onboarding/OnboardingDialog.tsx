'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { useUserOnboardingStore } from './stores/user-onboarding.store';
import { StageLanguage } from './stages/StageLanguage';
import { StageEmailOtp } from './stages/StageEmailOtp';
import { StageMobileOtp } from './stages/StageMobileOtp';
import { StageUserType } from './stages/StageUserType';
import { StageVerticalProfile } from './stages/StageVerticalProfile';
import { useAuthStore } from '@/stores/auth.store';
import type { OnboardingStage } from './user-onboarding.service';

const STAGE_ORDER: OnboardingStage[] = [
  'language',
  'email_otp',
  'mobile_otp',
  'user_type',
  'vertical_profile',
];

export function OnboardingDialog() {
  const t = useTranslations('onboarding');
  const { status, loading, fetchStatus } = useUserOnboardingStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) fetchStatus();
  }, [token, fetchStatus]);

  // Not authenticated yet
  if (!token) return null;
  // Still loading first fetch
  if (!status && loading) return null;
  // No status or already complete
  if (!status || status.complete) return null;

  const steps = [
    { key: 'language' as const, label: t('stages.language') },
    { key: 'email_otp' as const, label: t('stages.emailOtp') },
    { key: 'mobile_otp' as const, label: t('stages.mobileOtp') },
    { key: 'user_type' as const, label: t('stages.userType') },
    { key: 'vertical_profile' as const, label: t('stages.verticalProfile') },
  ];

  const currentIdx = STAGE_ORDER.indexOf(status.stage as OnboardingStage);
  const completedStages = STAGE_ORDER.slice(0, Math.max(0, currentIdx));

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
            currentStage={status.stage}
            completedStages={completedStages}
          />
        </div>
      }
    >
      <div style={{ minHeight: 280, padding: '4px 0' }}>
        {status.stage === 'language' && <StageLanguage />}
        {status.stage === 'email_otp' && <StageEmailOtp />}
        {status.stage === 'mobile_otp' && <StageMobileOtp />}
        {status.stage === 'user_type' && <StageUserType />}
        {status.stage === 'vertical_profile' && <StageVerticalProfile />}
      </div>
    </Modal>
  );
}
