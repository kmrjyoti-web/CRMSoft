'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserOnboardingStore } from '@/features/user-onboarding/stores/user-onboarding.store';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { status, completeProfile, fetchStatus } = useUserOnboardingStore();
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status?.complete) {
      router.replace('/dashboard');
    }
  }, [status?.complete, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const profileFields: Record<string, unknown> = {};
      if (companyName.trim()) profileFields.companyName = companyName.trim();
      await completeProfile(profileFields);
      router.replace('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg, #0f0f0f)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'var(--card-bg, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: 16,
        padding: '40px 36px',
      }}>
        <p style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--color-primary, #b8894a)',
          fontWeight: 600,
          marginBottom: 8,
        }}>
          Almost done
        </p>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
          Complete your profile
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 36 }}>
          Add your details to get the most out of your workspace.
        </p>

        {status?.subcategoryCode && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'var(--color-primary-soft, rgba(184,137,74,0.08))',
            border: '1px solid var(--color-primary, #b8894a)',
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--color-primary)',
          }}>
            Registered as: <strong>{status.subcategoryCode}</strong>
            {status.verticalCode && <> · {status.verticalCode}</>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Company / Business name <span style={{ color: 'var(--color-text-secondary)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Travels Pvt Ltd"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: 'var(--input-bg, rgba(255,255,255,0.06))',
                color: 'var(--color-text)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 8,
              background: submitting ? 'rgba(184,137,74,0.5)' : 'var(--color-primary, #b8894a)',
              border: 'none',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 200ms',
            }}
          >
            {submitting ? 'Saving…' : 'Go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
