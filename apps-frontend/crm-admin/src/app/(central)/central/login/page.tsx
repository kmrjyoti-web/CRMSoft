'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  border: '1.5px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.3)',
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function CentralLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/central-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body?.message ?? 'Invalid email or password');
        return;
      }

      const payload = body?.data ?? body;

      if (payload.type === 'SINGLE') {
        // Auto-redirect to brand portal with SSO token
        window.location.href = payload.redirectUrl;
        return;
      }

      if (payload.type === 'MULTI') {
        // Save session state and navigate to tenant picker
        sessionStorage.setItem('central-session-token', payload.sessionToken);
        sessionStorage.setItem('central-tenants', JSON.stringify(payload.tenants));
        router.push('/central/select-tenant');
        return;
      }

      if (payload.type === 'NO_COMPANY') {
        setError(payload.message ?? 'No active workspace found. Please contact support.');
        return;
      }

      setError('Unexpected response. Please try again.');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0d1a 0%, #131826 50%, #0d1118 100%)',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #c9a25f 0%, #8b6334 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>C</span>
            </div>
            <span style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
              CRM<span style={{ color: '#c9a25f' }}>Soft</span>
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
            Sign in to CRMSoft
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Access all your workspaces from one place
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15, 20, 32, 0.92)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)' }}>
                  Password
                </label>
                <a href="/forgot-password" style={{ fontSize: 11, color: '#c9a25f', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #c9a25f 0%, #8b6334 100%)',
                color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(201,162,95,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '24px 0 20px' }} />

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(148,163,184,0.6)', margin: 0 }}>
            New to CRMSoft?{' '}
            <a href="/central/register" style={{ color: '#c9a25f', fontWeight: 600, textDecoration: 'none' }}>
              Register with a partner
            </a>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#374151', marginTop: 24 }}>
          © {new Date().getFullYear()} CRMSoft. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function CentralLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0a0d1a' }} />}>
      <CentralLoginForm />
    </Suspense>
  );
}
