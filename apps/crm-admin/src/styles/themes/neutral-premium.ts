/**
 * Neutral Premium Theme
 * Used for: Self-care panel (consistent UI for all users)
 * Inspiration: LinkedIn × Notion × subtle Golden Hour hints
 * Default fallback when no brand-specific theme is present.
 */

export const neutralPremiumTheme = {
  name: 'Neutral Premium',
  code: 'neutral-premium',

  // Backgrounds — deep navy-ink with subtle warmth
  background: 'linear-gradient(135deg, #0a0d1a 0%, #131826 50%, #0d1118 100%)',
  bgElevated: 'rgba(20, 24, 35, 0.85)',
  bgGlass: 'rgba(26, 31, 46, 0.6)',

  // Cards — glass morphism with subtle gold accent
  cardBg: 'rgba(20, 24, 35, 0.5)',
  cardBgHover: 'rgba(28, 34, 48, 0.7)',
  cardBorder: 'rgba(201, 162, 95, 0.12)',
  cardBorderHover: 'rgba(201, 162, 95, 0.25)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
  cardShadowHover: '0 8px 32px rgba(201, 162, 95, 0.15)',

  // Text
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',

  // Accent — subtle gold (premium hint, not full luxury)
  primary: '#c9a25f',
  primarySoft: 'rgba(201, 162, 95, 0.15)',
  primaryGlow: 'rgba(201, 162, 95, 0.25)',
  primaryDeep: '#8b6334',
  secondary: '#3b82f6',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Borders
  border: 'rgba(201, 162, 95, 0.1)',
  borderEmphasis: 'rgba(201, 162, 95, 0.2)',
  divider: 'rgba(255, 255, 255, 0.05)',

  // Typography
  fontHeading: 'var(--font-sans)',
  fontBody: 'var(--font-sans)',
  fontDisplay: 'var(--font-serif)',

  // Effects
  glassBlur: 'blur(20px)',
  glassBg: 'rgba(20, 24, 35, 0.6)',
} as const;

export type NeutralPremiumTheme = typeof neutralPremiumTheme;
