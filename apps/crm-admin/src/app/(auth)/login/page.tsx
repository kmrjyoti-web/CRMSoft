'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/registry';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useBrandConfigContext } from '@/contexts/BrandConfigContext';
import { useAuthStore } from '@/stores/auth.store';
import { setAuthCookie } from '@/features/auth/utils/auth-cookies';
import DomainBrandLogin from '@/components/auth/DomainBrandLogin';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── SSO Handler ─────────────────────────────────────────────────

function SsoHandler({ ssoToken, redirect }: { ssoToken: string; redirect: string }) {
  const router = useRouter();
  const { setAuth, setActiveCompany } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/auth/sso/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssoToken }),
    })
      .then((r) => r.json())
      .then((body) => {
        const res = body?.data ?? body;
        if (!res?.accessToken) throw new Error('Invalid SSO response');

        // Store JWT in auth store and cookie
        setAuth({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
        setAuthCookie(res.accessToken);

        // Set active company from SSO response
        if (res.company?.id) {
          setActiveCompany({
            id: res.company.id,
            name: res.company.name ?? '',
            brandCode: res.company.brandCode ?? null,
            verticalCode: res.company.verticalCode ?? null,
            role: res.company.role ?? 'MEMBER',
            isDefault: res.company.isDefault ?? false,
          });
        }

        // Remove ?sso from URL before redirecting
        const cleanSearch = window.location.search
          .replace(/[?&]sso=[^&]+/, '')
          .replace(/^&/, '?');
        window.history.replaceState({}, '', window.location.pathname + cleanSearch);

        router.replace(redirect);
      })
      .catch(() => {
        setError('Sign-in link expired. Please try again.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssoToken]);

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', gap: 16, padding: 24,
      }}>
        <p style={{ color: '#fca5a5', fontSize: 15, margin: 0 }}>{error}</p>
        <a href="/login" style={{ color: '#c9a25f', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #c9a25f', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Login Content ──────────────────────────────────────────

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const brandCode = searchParams.get('brand');
  const ssoToken = searchParams.get('sso');

  // 0. SSO token from central portal — auto-login
  if (ssoToken) {
    return <SsoHandler ssoToken={ssoToken} redirect={redirect} />;
  }

  // 1. Static registry brand (?brand=travvellis) takes precedence
  const staticBrand = getBrandConfig(brandCode);
  if (staticBrand) {
    const BrandLogin = staticBrand.loginComponent;
    return <BrandLogin onSuccess={() => router.push(redirect)} />;
  }

  // 2. Domain-based brand (auto-detected from hostname via BrandConfigProvider)
  return <DomainLoginFallback redirect={redirect} />;
}

function DomainLoginFallback({ redirect }: { redirect: string }) {
  const router = useRouter();
  const { config: domainBrand, loading } = useBrandConfigContext();

  if (loading) {
    return <div style={{ minHeight: '100dvh', background: '#0f172a' }} />;
  }

  if (domainBrand.found) {
    return (
      <DomainBrandLogin
        brand={domainBrand}
        onSuccess={() => router.push(redirect)}
      />
    );
  }

  // Generic CRMSoft login with central portal link
  return (
    <>
      <LoginForm />
      <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 12 }}>
        Have multiple workspaces?{' '}
        <a href="/central/login" style={{ color: '#c9a25f', fontWeight: 600, textDecoration: 'none' }}>
          Sign in via Central Portal
        </a>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <LoginContent />
    </Suspense>
  );
}
