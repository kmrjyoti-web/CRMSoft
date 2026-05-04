'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';

const VERTICALS: { code: string; i18nKey: 'software' | 'restaurant' | 'travel' | 'retail' | 'healthcare' | 'education' }[] = [
  { code: 'SOFTWARE', i18nKey: 'software' },
  { code: 'RESTAURANT', i18nKey: 'restaurant' },
  { code: 'TRAVEL', i18nKey: 'travel' },
  { code: 'RETAIL', i18nKey: 'retail' },
  { code: 'HEALTHCARE', i18nKey: 'healthcare' },
  { code: 'EDUCATION', i18nKey: 'education' },
];

export function StageVerticalProfile() {
  const t = useTranslations('onboarding.vertical');
  const { status, completeProfile } = useUserOnboardingStore();
  const [verticalCode, setVerticalCode] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isB2BorC = status?.stage === 'vertical_profile' &&
    // userType not in status but saved as categoryCode — allow submit for all types
    true;

  const canSubmit = !!verticalCode;

  const handleComplete = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const profileFields: Record<string, unknown> = {};
      if (companyName.trim()) profileFields.companyName = companyName.trim();
      await completeProfile(verticalCode!, profileFields);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{t('title')}</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {VERTICALS.map((v) => {
          const sel = verticalCode === v.code;
          return (
            <button
              key={v.code}
              type="button"
              onClick={() => setVerticalCode(v.code)}
              style={{
                padding: '12px 8px',
                borderRadius: 8,
                border: `2px solid ${sel ? 'var(--color-primary, #b8894a)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
                background: sel ? 'var(--color-primary-soft, rgba(184,137,74,0.1))' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: sel ? 600 : 400,
                color: sel ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'all 200ms ease',
                textAlign: 'center',
              }}
            >
              {t(v.i18nKey)}
            </button>
          );
        })}
      </div>

      {verticalCode && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            Company / Business name (optional)
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Travels Pvt Ltd"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              background: 'var(--input-bg, rgba(255,255,255,0.06))',
              color: 'var(--color-text)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Button onClick={handleComplete} loading={submitting} disabled={!canSubmit} variant="primary">
          Complete setup
        </Button>
      </div>
    </div>
  );
}
