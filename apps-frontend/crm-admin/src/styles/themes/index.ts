import { neutralPremiumTheme } from './neutral-premium';
import { goldenHourTheme } from './golden-hour';

export { neutralPremiumTheme, goldenHourTheme };
export type { NeutralPremiumTheme } from './neutral-premium';
export type { GoldenHourTheme } from './golden-hour';

/**
 * Theme registry — lookup by code from gv_cfg_brands.theme.code
 */
export const themesByCode = {
  'neutral-premium': neutralPremiumTheme,
  'golden-hour': goldenHourTheme,
  'default': neutralPremiumTheme,
} as const;

export type ThemeCode = keyof typeof themesByCode;

/**
 * Get theme by code with fallback to neutral-premium
 */
export function getTheme(code?: string | null) {
  if (!code) return neutralPremiumTheme;
  return (themesByCode as unknown as Record<string, typeof neutralPremiumTheme>)[code] ?? neutralPremiumTheme;
}

/**
 * Convert theme object to CSS variable map
 * Used by BrandThemeProvider to inject into <html>
 */
export function themeToCssVars(theme: typeof neutralPremiumTheme | typeof goldenHourTheme): Record<string, string> {
  return {
    '--brand-bg': theme.background ?? '',
    '--brand-bg-elevated': theme.bgElevated ?? '',
    '--brand-card-bg': theme.cardBg ?? '',
    '--brand-card-bg-hover': theme.cardBgHover ?? '',
    '--brand-card-border': theme.cardBorder ?? '',
    '--brand-card-border-hover': theme.cardBorderHover ?? '',
    '--brand-card-shadow': theme.cardShadow ?? '',
    '--brand-card-shadow-hover': theme.cardShadowHover ?? '',
    '--brand-text': theme.text ?? '',
    '--brand-muted': theme.textMuted ?? '',
    '--brand-subtle': theme.textSubtle ?? '',
    '--brand-primary': theme.primary ?? '',
    '--brand-primary-soft': theme.primarySoft ?? '',
    '--brand-primary-glow': theme.primaryGlow ?? '',
    '--brand-primary-deep': theme.primaryDeep ?? '',
    '--brand-secondary': theme.secondary ?? '',
    '--brand-success': theme.success ?? '',
    '--brand-warning': theme.warning ?? '',
    '--brand-danger': theme.danger ?? '',
    '--brand-info': theme.info ?? '',
    '--brand-border': theme.border ?? '',
    '--brand-border-emphasis': theme.borderEmphasis ?? '',
    '--brand-divider': theme.divider ?? '',
    '--font-heading': theme.fontHeading ?? 'var(--font-sans)',
    '--font-body': theme.fontBody ?? 'var(--font-sans)',
    '--font-display': theme.fontDisplay ?? 'var(--font-serif)',
  };
}
