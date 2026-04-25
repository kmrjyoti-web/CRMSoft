'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, OTPInput } from '@/components/ui';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';
import { userOnboardingService } from '../user-onboarding.service';

export function StageMobileOtp() {
  const t = useTranslations('onboarding.mobileOtp');
  const te = useTranslations('onboarding.errors');
  const { skipMobile, verifyOtp } = useUserOnboardingStore();
  const [code, setCode] = useState('');
  const [skipping, setSkipping] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkip = async () => {
    setSkipping(true);
    try { await skipMobile(); } finally { setSkipping(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      await verifyOtp('mobile', code);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '';
      if (msg.toLowerCase().includes('expired')) setError(te('otpExpired'));
      else setError(te('otpInvalid'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t('title')}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 24 }}>
        {t('subtitle')}
      </p>

      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          Enter the 6-digit code sent to your mobile number, or skip to continue.
        </p>
        <OTPInput length={6} value={code} onChange={setCode} onComplete={handleVerify} />
        {error && (
          <p style={{ fontSize: 13, color: 'var(--color-danger, #ef4444)', marginTop: 10 }}>{error}</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outline" onClick={handleSkip} loading={skipping}>
          {t('skipForNow')}
        </Button>
        <Button variant="primary" onClick={handleVerify} loading={verifying} disabled={code.length !== 6}>
          {t('verify')}
        </Button>
      </div>
    </div>
  );
}
