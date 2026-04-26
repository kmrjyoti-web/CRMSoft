'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, skip to returnUrl or governance
  useEffect(() => {
    const token = localStorage.getItem('pc_token');
    if (token) {
      const returnUrl = searchParams.get('returnUrl') || '/governance';
      router.replace(returnUrl);
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || data.message || 'Login failed');
        return;
      }

      const token = data.data.accessToken;
      const user = data.data.user;

      // Store in localStorage (api.ts reads this)
      localStorage.setItem('pc_token', token);
      localStorage.setItem('pc_user', JSON.stringify(user));

      // Store in cookie so middleware can read it server-side (7-day expiry)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `pc_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      const returnUrl = searchParams.get('returnUrl') || '/governance';
      router.replace(returnUrl);
    } catch {
      setError('Network error — is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d4b878', fontWeight: 600, margin: '0 0 8px' }}>
            CRMSoft
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            Platform Console
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>
            Admin access only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#450a0a',
              border: '1px solid #991b1b',
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 13,
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? '#475569' : '#d4b878',
              color: loading ? '#94a3b8' : '#0f172a',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <LoginForm />
    </Suspense>
  );
}
