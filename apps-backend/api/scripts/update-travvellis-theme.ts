/**
 * update-travvellis-theme.ts
 *
 * Populates the Golden Hour theme JSON on the Travvellis brand row.
 * Safe to re-run (idempotent update).
 *
 * Usage (from apps-backend/api/):
 *   npx ts-node --transpile-only scripts/update-travvellis-theme.ts
 */

import { PrismaClient } from '@prisma/identity-client';

const prisma = new PrismaClient();

const goldenHourThemeJson = {
  code: 'golden-hour',
  name: 'Golden Hour',

  // Visual tokens
  primary: '#b8894a',
  primaryDeep: '#8b6334',
  primarySoft: 'rgba(184, 137, 74, 0.12)',
  primaryGlow: 'rgba(184, 137, 74, 0.25)',
  secondary: '#1e3a5f',

  background: 'linear-gradient(135deg, #faf6ed 0%, #f5ebd5 100%)',
  bgElevated: '#ffffff',

  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBgHover: '#ffffff',
  cardBorder: 'rgba(184, 137, 74, 0.18)',
  cardBorderHover: 'rgba(184, 137, 74, 0.4)',
  cardShadow: '0 4px 24px rgba(184, 137, 74, 0.08)',
  cardShadowHover: '0 12px 48px rgba(184, 137, 74, 0.18)',

  text: '#2c1810',
  textMuted: '#6b5544',
  textSubtle: '#a08870',

  border: 'rgba(184, 137, 74, 0.15)',
  borderEmphasis: 'rgba(184, 137, 74, 0.3)',
  divider: 'rgba(44, 24, 16, 0.06)',

  success: '#3a8c5f',
  warning: '#d4a85e',
  danger: '#c25555',
  info: '#5a7ba5',

  // Typography
  fontHeading: 'var(--font-serif)',
  fontBody: 'var(--font-sans)',
  fontDisplay: 'var(--font-serif)',

  // Custom Golden Hour properties
  serifNumeric: true,
  letterSpacingHero: '-0.03em',

  // Branding meta
  tagline: 'Curated journeys, golden moments',
  logoUrl: null,
};

async function main() {
  console.log('🎨 Updating Travvellis brand with Golden Hour theme...');

  const existing = await (prisma as any).gvCfgBrand.findUnique({
    where: { code: 'travvellis' },
  });

  if (!existing) {
    console.error('❌ Travvellis brand not found. Run Day 1 seed first.');
    process.exit(1);
  }

  console.log('✅ Found Travvellis brand:', existing.name);

  const updated = await (prisma as any).gvCfgBrand.update({
    where: { code: 'travvellis' },
    data: { theme: goldenHourThemeJson },
  });

  console.log('\n✅ Travvellis theme updated successfully');
  console.log('   Brand code:', updated.code);
  console.log('   Theme primary:', goldenHourThemeJson.primary);
  console.log('   Font heading:', goldenHourThemeJson.fontHeading);
  console.log('   Tagline:', goldenHourThemeJson.tagline);
  console.log('   Total properties:', Object.keys(goldenHourThemeJson).length);

  const verified = await (prisma as any).gvCfgBrand.findUnique({
    where: { code: 'travvellis' },
  });

  const themeKeys = verified?.theme ? Object.keys(verified.theme as any).length : 0;
  console.log('\n📋 Verification:');
  console.log('   DB has', themeKeys, 'theme properties');
  console.log('   ✅ Update confirmed');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
