'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getBrandConfig } from '@/lib/brand/registry';
import { useAuthStore } from '@/stores/auth.store';
import type { ActiveCompany } from '@/stores/auth.store';

interface CompanyOption extends ActiveCompany {
  talentId?: string;
  categoryCode?: string | null;
}

function SelectCompanyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandHint = searchParams.get('brand');
  const brandConfig = getBrandConfig(brandHint);

  const { setActiveCompany, setAvailableCompanies } = useAuthStore();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const theme = brandConfig
    ? {
        primary: brandConfig.colors.primary,
        secondary: brandConfig.colors.secondary,
        background: brandConfig.colors.background,
        fontHeading: brandConfig.fonts.heading,
      }
    : {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: 'linear-gradient(135deg, #0a0d1a 0%, #1a1f2e 100%)',
        fontHeading: 'Inter, sans-serif',
      };

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem('selector-companies');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      setCompanies(JSON.parse(stored));
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleSelect = (company: CompanyOption) => {
    setSelecting(company.id);
    setActiveCompany(company);
    setAvailableCompanies(companies);

    sessionStorage.removeItem('selector-token');
    sessionStorage.removeItem('selector-companies');

    const brandCode = company.brandCode;
    const dest = brandCode ? `/dashboard?brand=${brandCode}` : '/dashboard';
    router.push(dest);
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.background,
      padding: 20,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: 720,
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          color: '#f1f5f9',
          margin: '0 0 8px',
          fontFamily: theme.fontHeading,
        }}>
          Choose your workspace
        </h1>
        <p style={{ color: '#94a3b8', margin: '0 0 36px', fontSize: 15 }}>
          You have access to {companies.length} companies. Pick where you want to work today.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {companies.map((c) => {
            const cfg = getBrandConfig(c.brandCode);
            const cardPrimary = cfg?.colors.primary ?? theme.primary;
            const isSelecting = selecting === c.id;

            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                disabled={selecting !== null}
                style={{
                  padding: '24px 20px',
                  background: isSelecting
                    ? `${cardPrimary}22`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelecting ? cardPrimary : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 12,
                  cursor: selecting ? 'wait' : 'pointer',
                  textAlign: 'left',
                  color: '#f1f5f9',
                  opacity: selecting && !isSelecting ? 0.5 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {c.isDefault && (
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: `${cardPrimary}33`,
                    color: cardPrimary,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Default
                  </span>
                )}

                <div style={{
                  display: 'inline-block',
                  background: `${cardPrimary}22`,
                  border: `1px solid ${cardPrimary}44`,
                  color: cardPrimary,
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {cfg?.name ?? c.brandCode ?? 'CRMSoft'}
                </div>

                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
                  {c.name}
                </div>

                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  {c.verticalCode
                    ? c.verticalCode.charAt(0) + c.verticalCode.slice(1).toLowerCase()
                    : 'General'}
                  {' · '}
                  {c.role}
                </div>

                {isSelecting && (
                  <div style={{ marginTop: 12, fontSize: 13, color: cardPrimary }}>
                    Loading workspace...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <a
            href="/login"
            style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}
          >
            ← Back to login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SelectCompanyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#94a3b8' }}>Loading...</span>
      </div>
    }>
      <SelectCompanyContent />
    </Suspense>
  );
}
