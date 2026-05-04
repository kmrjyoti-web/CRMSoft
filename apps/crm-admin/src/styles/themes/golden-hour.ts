/**
 * Golden Hour Theme — for Travvellis luxury travel brand
 * Tokens extracted from theme-goldenhour.jsx design canvas
 * Inspiration: Aman resorts, Vogue editorial, premium hospitality
 */

export const goldenHourTheme = {
  name: 'Golden Hour',
  code: 'golden-hour',

  // Backgrounds — ivory cream (luxury day)
  background: 'linear-gradient(135deg, #faf6ed 0%, #f5ebd5 100%)',
  bgElevated: '#ffffff',
  bgGlass: 'rgba(255, 255, 255, 0.85)',

  // For night variant (data-theme="dark" override)
  backgroundNight: 'linear-gradient(135deg, #0e0a14 0%, #1a1410 100%)',
  bgElevatedNight: 'rgba(26, 20, 16, 0.95)',

  // Cards
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBgHover: '#ffffff',
  cardBorder: 'rgba(184, 137, 74, 0.18)',
  cardBorderHover: 'rgba(184, 137, 74, 0.4)',
  cardShadow: '0 4px 24px rgba(184, 137, 74, 0.08)',
  cardShadowHover: '0 12px 48px rgba(184, 137, 74, 0.18)',

  // Text — warm dark
  text: '#2c1810',
  textMuted: '#6b5544',
  textSubtle: '#a08870',

  // Accent — rich gold luxury
  primary: '#b8894a',
  primarySoft: 'rgba(184, 137, 74, 0.12)',
  primaryGlow: 'rgba(184, 137, 74, 0.25)',
  primaryDeep: '#8b6334',
  secondary: '#1e3a5f',

  // Status (warm-tinted)
  success: '#3a8c5f',
  warning: '#d4a85e',
  danger: '#c25555',
  info: '#5a7ba5',

  // Borders
  border: 'rgba(184, 137, 74, 0.15)',
  borderEmphasis: 'rgba(184, 137, 74, 0.3)',
  divider: 'rgba(44, 24, 16, 0.06)',

  // Typography — luxury serif for headings
  fontHeading: 'var(--font-serif)',   // Playfair Display
  fontBody: 'var(--font-sans)',        // Inter
  fontDisplay: 'var(--font-serif)',

  // Custom Golden Hour properties
  serifNumeric: true,
  letterSpacing: '-0.03em',

  // Branding meta
  tagline: 'Curated journeys, golden moments',
} as const;

export type GoldenHourTheme = typeof goldenHourTheme;
