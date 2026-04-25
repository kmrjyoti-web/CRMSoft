'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { LanguageSelector } from '@/components/onboarding/LanguageSelector';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';
import type { OnboardingLocale } from '../user-onboarding.service';

export function StageLanguage() {
  const t = useTranslations('onboarding.language');
  const tc = useTranslations('common');
  const { status, setLocale } = useUserOnboardingStore();
  const [selected, setSelected] = useState<OnboardingLocale>(status?.locale ?? 'en');
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      await setLocale(selected);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t('title')}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 24 }}>
        {t('subtitle')}
      </p>

      <LanguageSelector value={selected} onChange={setSelected} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <Button onClick={handleContinue} loading={submitting} variant="primary">
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}
