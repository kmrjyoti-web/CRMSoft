'use client';

import { useRouter } from 'next/navigation';
import { getAllBrands } from '@/lib/brand/registry';

export default function GenericRegister() {
  const router = useRouter();
  const brands = getAllBrands();

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0d1a 0%, #1a1f2e 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Create an account
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
            Choose a platform to register with
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          {brands.map((brand) => (
            <button
              key={brand.code}
              onClick={() => router.push(`/register?brand=${brand.code}`)}
              style={{
                padding: '24px 28px',
                background: 'rgba(15, 20, 32, 0.6)',
                color: '#fff',
                border: `1.5px solid ${brand.colors.secondary}40`,
                borderRadius: 12,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = brand.colors.secondary;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${brand.colors.secondary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${brand.colors.secondary}40`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontFamily: brand.fonts.heading, fontSize: 24, fontWeight: 600, marginBottom: 6, color: brand.colors.secondary }}>
                {brand.name}
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 12, lineHeight: 1.5 }}>
                {brand.description}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', color: brand.colors.secondary, textTransform: 'uppercase' }}>
                {brand.vertical}
              </div>
              <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 24, color: brand.colors.secondary, opacity: 0.5 }}>
                →
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, margin: 0 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
