'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface TenantItem {
  tenantId: string | null;
  companyId: string;
  companyName: string;
  brandCode: string | null;
  brandName: string | null;
  logoUrl: string | null;
  domain: string | null;
  subdomain: string | null;
  role: string;
  verticalName: string | null;
  planCode: string | null;
}

function SelectTenantContent() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem('central-session-token');
    const data = sessionStorage.getItem('central-tenants');

    if (!token || !data) {
      router.replace('/central/login');
      return;
    }

    setSessionToken(token);
    try {
      setTenants(JSON.parse(data));
    } catch {
      router.replace('/central/login');
    }
  }, [router]);

  async function handleSelect(tenant: TenantItem) {
    if (selecting || !sessionToken) return;
    setSelecting(tenant.companyId);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/central-login/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, companyId: tenant.companyId }),
      });
      const body = await res.json();

      if (!res.ok) {
        const msg = body?.message ?? '';
        if (msg.includes('expired') || msg.includes('invalid')) {
          setError('Session expired. Please log in again.');
          sessionStorage.removeItem('central-session-token');
          sessionStorage.removeItem('central-tenants');
          setTimeout(() => router.replace('/central/login'), 2000);
        } else {
          setError(msg || 'Failed to open workspace. Please try again.');
        }
        setSelecting(null);
        return;
      }

      const payload = body?.data ?? body;

      // Clear session storage — one-time use
      sessionStorage.removeItem('central-session-token');
      sessionStorage.removeItem('central-tenants');

      // Full navigation to brand portal with SSO token
      window.location.href = payload.redirectUrl;
    } catch {
      setError('Network error. Please try again.');
      setSelecting(null);
    }
  }

  if (!mounted) return null;

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
      <div style={{ width: '100%', maxWidth: 860 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #c9a25f 0%, #8b6334 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>C</span>
            </div>
            <span style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>
              CRM<span style={{ color: '#c9a25f' }}>Soft</span>
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>
            Select your workspace
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            You have access to {tenants.length} workspace{tenants.length !== 1 ? 's' : ''}. Choose where you want to work today.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
            fontSize: 13, color: '#fca5a5', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Tenant grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {tenants.map((t) => {
            const isActive = selecting === t.companyId;
            const accent = '#c9a25f';

            return (
              <button
                key={t.companyId}
                onClick={() => handleSelect(t)}
                disabled={selecting !== null}
                style={{
                  padding: '24px 20px',
                  background: isActive ? `${accent}18` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isActive ? accent : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: 14,
                  cursor: selecting ? (isActive ? 'wait' : 'not-allowed') : 'pointer',
                  textAlign: 'left',
                  opacity: selecting && !isActive ? 0.45 : 1,
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Logo or avatar */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {t.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.logoUrl}
                      alt={t.brandName ?? ''}
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain', background: 'rgba(255,255,255,0.08)' }}
                    />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: `${accent}22`, border: `1px solid ${accent}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ color: accent, fontSize: 18, fontWeight: 700 }}>
                        {(t.companyName ?? t.brandName ?? 'W')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: '#f1f5f9',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {t.companyName}
                    </div>
                    {t.brandName && t.brandName !== t.companyName && (
                      <div style={{ fontSize: 12, color: accent, fontWeight: 500, marginTop: 2 }}>
                        {t.brandName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 8px', borderRadius: 4,
                    marginRight: 6, marginBottom: 6,
                    textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600,
                  }}>
                    {t.role}
                  </span>
                  {t.verticalName && (
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '2px 8px', borderRadius: 4, marginBottom: 6,
                      textTransform: 'capitalize', letterSpacing: 0.3,
                    }}>
                      {t.verticalName.toLowerCase()}
                    </span>
                  )}
                </div>

                {/* Domain */}
                {(t.domain ?? t.subdomain) && (
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 16, wordBreak: 'break-all' }}>
                    {t.domain ?? t.subdomain}
                  </div>
                )}

                {/* CTA */}
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? accent : 'rgba(148,163,184,0.7)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {isActive ? (
                    <span>Opening workspace…</span>
                  ) : (
                    <span>Open workspace →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="/central/login"
            style={{ fontSize: 13, color: '#374151', textDecoration: 'none' }}
            onClick={() => {
              sessionStorage.removeItem('central-session-token');
              sessionStorage.removeItem('central-tenants');
            }}
          >
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SelectTenantPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0a0d1a' }} />}>
      <SelectTenantContent />
    </Suspense>
  );
}
