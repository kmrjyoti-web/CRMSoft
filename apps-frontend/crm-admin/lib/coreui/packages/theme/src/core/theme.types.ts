/** Color token definitions for a theme. */
export interface ColorTokens {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  danger: string;
  dangerHover: string;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgOverlay: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textLink: string;
  border: string;
  borderHover: string;
  borderFocus: string;
}

/** Font token definitions for a theme. */
export interface FontTokens {
  sans: string;
  serif: string;
  mono: string;
  heading: string;
}

/** Border-radius token definitions. */
export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/** Spacing token definitions. */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
}

/** Shadow token definitions. */
export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/** Complete theme configuration object. */
export interface ThemeConfig {
  name: string;
  colors: ColorTokens;
  fonts: FontTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
}
