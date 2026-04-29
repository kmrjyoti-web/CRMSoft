'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

const BRAND_DISPLAY: Record<string, { name: string; accentColor: string }> = {
  travvellis: { name: 'Travvellis', accentColor: '#d4b878' },
  default:    { name: 'CRMSoft',   accentColor: '#58a6ff' },
};

function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = (searchParams.get('brand') ?? 'default').toLowerCase();
  const returnUrl = searchParams.get('returnUrl') ?? `/onboarding?brand=${brand}`;

  const { name: brandName, accentColor } = BRAND_DISPLAY[brand] ?? BRAND_DISPLAY.default;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (token) router.replace(returnUrl);
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? 'Login failed');
        return;
      }
      const token = data.data.accessToken;
      const user = data.data.user;

      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_user', JSON.stringify(user));
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      document.cookie = `portal_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      router.replace(returnUrl);
    } catch {
      setError('Network error — is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '36px 32px', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: accentColor, fontWeight: 600, margin: '0 0 6px' }}>
            {brandName}
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Sign In</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px', background: loading ? '#475569' : accentColor, color: '#0f172a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={14} className="animate-spin" />Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
          No account?{' '}
          <a href={`/register?brand=${brand}`} style={{ color: accentColor, textDecoration: 'none' }}>Register</a>
        </p>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <PortalLoginForm />
    </Suspense>
  );
}
