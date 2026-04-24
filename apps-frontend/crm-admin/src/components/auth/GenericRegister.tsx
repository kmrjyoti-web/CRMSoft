'use client';

import { useRouter } from 'next/navigation';
import { getAllBrands } from '@/lib/brand/registry';

export default function GenericRegister() {
  const router = useRouter();
  const brands = getAllBrands();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d1a', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Create an account</h1>
        <p style={{ color: '#8b92a6', marginBottom: 36, fontSize: 15 }}>Choose a platform to register with:</p>

        <div style={{ display: 'grid', gap: 14 }}>
          {brands.map((brand) => (
            <button
              key={brand.code}
              onClick={() => router.push(`/register?brand=${brand.code}`)}
              style={{
                padding: '20px 24px',
                background: brand.colors.background,
                border: `2px solid ${brand.colors.secondary}`,
                borderRadius: 12,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }}
            >
              <div style={{ fontFamily: brand.fonts.heading, fontSize: 22, fontWeight: 700, color: brand.colors.text, marginBottom: 4 }}>
                {brand.name}
              </div>
              <div style={{ fontSize: 13, color: brand.colors.secondary, marginBottom: 2 }}>
                {brand.description}
              </div>
              <div style={{ fontSize: 11, color: '#8b92a6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {brand.vertical}
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: '#8b92a6', fontSize: 14 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
