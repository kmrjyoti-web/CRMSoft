'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, OTPInput } from '@/components/ui';
import { useUserOnboardingStore } from '../stores/user-onboarding.store';
import { userOnboardingService } from '../user-onboarding.service';

export function StageEmailOtp() {
  const t = useTranslations('onboarding.emailOtp');
  const te = useTranslations('onboarding.errors');
  const { verifyOtp } = useUserOnboardingStore();
  const [code, setCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    userOnboardingService.sendOtp('email')
      .then(({ sentTo }) => { setMaskedEmail(sentTo); startCooldown(); })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to send OTP'));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleResend = async () => {
    setError(null);
    try {
      const { sentTo } = await userOnboardingService.sendOtp('email');
      setMaskedEmail(sentTo);
      startCooldown();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to resend');
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      await verifyOtp('email', code);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '';
      if (msg.toLowerCase().includes('expired')) setError(te('otpExpired'));
      else if (msg.toLowerCase().includes('attempt')) setError(te('rateLimited'));
      else setError(te('otpInvalid'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t('title')}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 28 }}>
        {t('subtitle', { email: maskedEmail || '…' })}
      </p>

      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        {t('codeLabel')}
      </p>
      <OTPInput length={6} value={code} onChange={setCode} onComplete={handleVerify} />

      {error && (
        <p style={{ fontSize: 13, color: 'var(--color-danger, #ef4444)', marginTop: 12 }}>{error}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{
            fontSize: 13,
            color: cooldown > 0 ? 'var(--color-text-secondary)' : 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: cooldown > 0 ? 'default' : 'pointer',
            padding: 0,
          }}
        >
          {cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resend')}
        </button>

        <Button onClick={handleVerify} loading={verifying} disabled={code.length !== 6} variant="primary">
          {t('verify')}
        </Button>
      </div>
    </div>
  );
}
