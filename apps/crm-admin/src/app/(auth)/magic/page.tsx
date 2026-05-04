'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { setAuthCookie } from '@/features/auth/utils/auth-cookies';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

type VerifyState = 'loading' | 'success' | 'multi' | 'error';

function MagicLandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { setAuth, setActiveCompany } = useAuthStore();

  const [state, setState] = useState<VerifyState>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No sign-in token found. Please request a new magic link.');
      setState('error');
      return;
    }

    const verify = async () => {
      try {
        // Step 1: Verify magic link token
        const res = await fetch(`${API_BASE}/api/v1/auth/magic-link/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const body = await res.json();
        const data = body?.data ?? body;

        if (!res.ok || data?.type === 'INVALID') {
          setError(data?.reason ?? data?.message ?? 'Sign-in link expired. Please request a new one.');
          setState('error');
          return;
        }

        if (data?.type === 'NO_COMPANY') {
          setError('No active workspace found for this account. Please contact support.');
          setState('error');
          return;
        }

        if (data?.type === 'MULTI') {
          // Redirect to central tenant picker with session token
          router.replace(`/central/select-tenant?session=${encodeURIComponent(data.sessionToken)}`);
          setState('multi');
          return;
        }

        if (data?.type === 'SINGLE' && data?.ssoToken) {
          // Step 2: Exchange SSO token for JWT
          const ssoRes = await fetch(`${API_BASE}/api/v1/auth/sso/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssoToken: data.ssoToken }),
          });

          const ssoBody = await ssoRes.json();
          const ssoData = ssoBody?.data ?? ssoBody;

          if (!ssoRes.ok || !ssoData?.accessToken) {
            setError('Sign-in session expired. Please request a new link.');
            setState('error');
            return;
          }

          setAuth({
            accessToken: ssoData.accessToken,
            refreshToken: ssoData.refreshToken,
            user: ssoData.user,
          });
          setAuthCookie(ssoData.accessToken);

          if (ssoData.company?.id) {
            setActiveCompany({
              id: ssoData.company.id,
              name: ssoData.company.name ?? '',
              brandCode: ssoData.company.brandCode ?? null,
              verticalCode: ssoData.company.verticalCode ?? null,
              role: ssoData.company.role ?? 'MEMBER',
              isDefault: ssoData.company.isDefault ?? false,
            });
          }

          setState('success');
          router.replace('/dashboard');
          return;
        }

        setError('Unexpected response. Please try again.');
        setState('error');
      } catch {
        setError('Network error. Please check your connection and try again.');
        setState('error');
      }
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    gap: 16,
    padding: 24,
  };

  if (state === 'loading' || state === 'multi' || state === 'success') {
    return (
      <div style={containerStyle}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #c9a25f', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          {state === 'success' ? 'Signed in! Redirecting…' : 'Signing you in…'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 12,
        padding: '20px 28px',
        textAlign: 'center',
        maxWidth: 380,
      }}>
        <p style={{ color: '#fca5a5', fontSize: 15, margin: '0 0 8px', fontWeight: 600 }}>
          Sign-in Failed
        </p>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{error}</p>
      </div>
      <a
        href="/login"
        style={{
          color: '#c9a25f', fontSize: 14, textDecoration: 'none',
          fontWeight: 600, marginTop: 4,
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
      >
        ← Back to login
      </a>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', background: '#0f172a' }} />
    }>
      <MagicLandingContent />
    </Suspense>
  );
}
