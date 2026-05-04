'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { VisualBrandConfig } from '@/hooks/useBrandConfig';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  brand: VisualBrandConfig;
  onSuccess: () => void;
}

/**
 * Login form for white-label tenants accessed via their custom domain.
 * Uses brand colors and logo from domain-detected config.
 * Identical UX to TravvellisLogin / LoginForm but driven by API data not static registry.
 */
export default function DomainBrandLogin({ brand, onSuccess }: Props) {
  const { setActiveCompany, setAvailableCompanies } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const primary = brand.primaryColor;
  const secondary = brand.secondaryColor;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      const companies = (result as any).companies ?? [];
      setAvailableCompanies(companies);
      const activeId = (result as any).activeCompanyId;
      const active = companies.find((c: any) => c.id === activeId) ?? companies[0] ?? null;
      if (active) setActiveCompany(active);
      toast.success('Welcome back!');
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${secondary}22 0%, #0a0d1a 100%)`,
      padding: '40px 20px',
    }}>
      <div style={{
        background: 'rgba(15, 20, 32, 0.92)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420,
        backdropFilter: 'blur(20px)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Logo / Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.displayName ?? ''} style={{ height: 40, objectFit: 'contain', marginBottom: 16 }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: primary,
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                {(brand.displayName ?? brand.brandName ?? 'B')[0].toUpperCase()}
              </span>
            </div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
            {brand.welcomeTitle ?? `Welcome to ${brand.displayName}`}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', margin: 0 }}>
            {brand.welcomeSubtitle ?? 'Sign in to your account to continue'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#fca5a5',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
              background: loading ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 4px 20px ${primary}40`,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '20px 0 16px' }} />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(148,163,184,0.7)', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ color: primary, fontWeight: 600, textDecoration: 'none' }}>Register</a>
        </p>
      </div>
    </div>
  );
}
