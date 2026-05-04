'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';
import { userOnboardingService } from '../user-onboarding.service';
import type { SubTypeOption } from '../user-onboarding.service';

const cardStyle = (selected: boolean): React.CSSProperties => ({
  padding: '14px 16px',
  borderRadius: 10,
  border: `2px solid ${selected ? 'var(--color-primary, #b8894a)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
  background: selected ? 'var(--color-primary-soft, rgba(184,137,74,0.1))' : 'rgba(255,255,255,0.03)',
  cursor: 'pointer',
  textAlign: 'left' as const,
  transition: 'all 200ms ease',
  width: '100%',
});

export function StageSubUserType() {
  const t = useTranslations('onboarding.subUserType');
  const tc = useTranslations('common');
  const { status, setSubType } = useUserOnboardingStore();
  const [subTypes, setSubTypes] = useState<SubTypeOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const verticalCode = status?.verticalCode || 'TRAVEL';
  const categoryCode = status?.categoryCode || '';

  useEffect(() => {
    if (!categoryCode) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    userOnboardingService
      .getSubTypes(verticalCode, categoryCode)
      .then((list) => setSubTypes(list))
      .catch(() => setFetchError('Could not load sub-types'))
      .finally(() => setLoadingList(false));
  }, [verticalCode, categoryCode]);

  const handleContinue = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await setSubType(selected);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingList) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading…
      </div>
    );
  }

  if (fetchError || subTypes.length === 0) {
    return (
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t('title')}</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          {fetchError ?? 'No sub-types available for your account type.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setSubType('GENERAL')} variant="primary">
            {tc('continue')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t('title')}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 24 }}>
        {t('subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {subTypes.map((sub) => (
          <button
            key={sub.code}
            type="button"
            onClick={() => setSelected(sub.code)}
            style={cardStyle(selected === sub.code)}
          >
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: selected === sub.code ? 'var(--color-primary)' : 'var(--color-text)',
              marginBottom: 4,
            }}>
              {sub.name}
            </div>
            {sub.description && (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
                {sub.description}
              </div>
            )}
            {sub.requiresApproval && (
              <div style={{ fontSize: 11, color: 'var(--color-warning, #f59e0b)', marginTop: 4 }}>
                Requires approval
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleContinue} loading={submitting} disabled={!selected} variant="primary">
          {tc('continue')}
        </Button>
      </div>
    </div>
  );
}
