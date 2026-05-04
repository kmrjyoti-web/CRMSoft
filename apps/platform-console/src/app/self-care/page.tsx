'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, User, Building2, ChevronRight, Settings } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useBrand } from '@/contexts/BrandContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
}

function SelfCareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = (searchParams.get('brand') ?? 'default').toLowerCase();

  const { brand: brandConfig, loading: brandLoading } = useBrand();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('portal_token');
    const storedUser = localStorage.getItem('portal_user');

    if (!storedToken) {
      router.replace(`/portal-login?brand=${brand}&returnUrl=/self-care?brand=${brand}`);
      return;
    }
    setToken(storedToken);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
  }, [router, brand]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    document.cookie = 'portal_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.replace(`/portal-login?brand=${brand}`);
  };

  const accentColor = brandConfig?.theme.primaryColor ?? '#1a73e8';
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : '';

  return (
    <div style={{ minHeight: '100dvh', fontFamily: 'var(--brand-font-body)', background: 'var(--brand-bg)' }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid var(--brand-border)`,
        background: 'var(--brand-card-bg)',
        boxShadow: 'var(--brand-card-shadow)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLogo height={32} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {displayName && (
              <span style={{ fontSize: 13, color: 'var(--brand-text-muted)' }}>{displayName}</span>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                background: 'transparent', border: `1px solid var(--brand-border)`,
                borderRadius: 6, color: 'var(--brand-text-muted)', fontSize: 13, cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}05 100%)`,
        borderBottom: `1px solid var(--brand-border)`,
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: accentColor, margin: '0 0 10px' }}>
          {brandConfig?.name ?? 'CRMSoft'}
        </p>
        <h1 style={{
          fontSize: 32, fontWeight: 700, margin: '0 0 10px',
          fontFamily: 'var(--brand-font-heading)',
          color: 'var(--brand-text)',
        }}>
          Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        {brandConfig?.theme.tagline && (
          <p style={{ fontSize: 15, color: 'var(--brand-text-muted)', margin: 0, fontStyle: 'italic' }}>
            {brandConfig.theme.tagline}
          </p>
        )}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <DashboardCard
            icon={<User size={22} />}
            title="My Profile"
            description="View and update your personal information, contact details, and preferences."
            accentColor={accentColor}
            onClick={() => router.push(`/self-care/profile?brand=${brand}`)}
          />
          <DashboardCard
            icon={<Building2 size={22} />}
            title="My Companies"
            description="Manage your company workspaces and switch between active accounts."
            accentColor={accentColor}
            onClick={() => router.push(`/self-care/companies?brand=${brand}`)}
          />
          <DashboardCard
            icon={<Settings size={22} />}
            title="Account Settings"
            description="Configure notifications, security settings, and account preferences."
            accentColor={accentColor}
            onClick={() => router.push(`/self-care/settings?brand=${brand}`)}
          />
        </div>

        {/* Brand info footer */}
        {!brandLoading && brandConfig && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid var(--brand-border)`, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--brand-text-subtle)', margin: 0 }}>
              {brandConfig.name} — Powered by CRMSoft
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  icon, title, description, accentColor, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${accentColor}0a` : 'var(--brand-card-bg)',
        border: `1px solid ${hovered ? accentColor + '40' : 'var(--brand-card-border)'}`,
        borderRadius: 12,
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? `0 4px 20px ${accentColor}18` : 'var(--brand-card-shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <ChevronRight size={16} style={{ color: 'var(--brand-text-subtle)', marginTop: 4 }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-text)', margin: '0 0 6px', fontFamily: 'var(--brand-font-heading)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--brand-text-muted)', margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}

export default function SelfCarePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--brand-bg)' }} />}>
      <SelfCareInner />
    </Suspense>
  );
}
