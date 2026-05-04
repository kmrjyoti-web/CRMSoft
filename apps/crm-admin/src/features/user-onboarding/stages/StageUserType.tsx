'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';
import type { OnboardingUserType } from '../user-onboarding.service';

const cardStyle = (selected: boolean): React.CSSProperties => ({
  padding: '16px 18px',
  borderRadius: 10,
  border: `2px solid ${selected ? 'var(--color-primary, #b8894a)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
  background: selected ? 'var(--color-primary-soft, rgba(184,137,74,0.1))' : 'rgba(255,255,255,0.03)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 200ms ease',
  width: '100%',
});

export function StageUserType() {
  const t = useTranslations('onboarding.userType');
  const tc = useTranslations('common');
  const { setUserType } = useUserOnboardingStore();
  const [selected, setSelected] = useState<OnboardingUserType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const types: { key: OnboardingUserType; label: string; desc: string }[] = [
    { key: 'B2B', label: t('b2b'), desc: t('b2bDesc') },
    { key: 'B2C', label: t('b2c'), desc: t('b2cDesc') },
    { key: 'IND_SP', label: t('indSp'), desc: t('indSpDesc') },
    { key: 'IND_EE', label: t('indEe'), desc: t('indEeDesc') },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await setUserType(selected);
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {types.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => setSelected(type.key)}
            style={cardStyle(selected === type.key)}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: selected === type.key ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 4 }}>
              {type.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
              {type.desc}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <Button onClick={handleContinue} loading={submitting} disabled={!selected} variant="primary">
          {tc('continue')}
        </Button>
      </div>
    </div>
  );
}
