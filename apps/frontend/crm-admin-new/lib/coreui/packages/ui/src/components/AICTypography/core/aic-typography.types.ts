/**
 * AICTypography component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-typography.component.ts
 */

// ---------------------------------------------------------------------------
// Typography variant and level
// ---------------------------------------------------------------------------

/** Typography semantic variant. */
export type TypographyVariant = 'display' | 'heading' | 'text' | 'label' | 'caption';

/** Typography level (1-6), used for heading tags. */
export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Font weight presets. */
export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/** Semantic color presets. */
export type TypographyColor = 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning' | 'danger';

// ---------------------------------------------------------------------------
// AICTypographyProps — framework-agnostic
// ---------------------------------------------------------------------------

export interface AICTypographyProps {
  /** Typography semantic variant. Defaults to 'text'. */
  variant?: TypographyVariant;
  /** Typography level (1-6). Defaults to 1. */
  level?: TypographyLevel;
  /** Custom font size (CSS value, e.g. '1.5rem', '24px'). */
  size?: string;
  /** Font weight preset. */
  weight?: TypographyWeight;
  /** Custom or semantic color. Applied as inline style if not a semantic preset. */
  color?: string;
  /** Whether to apply bold font weight. */
  bold?: boolean;
  /** Whether to apply italic styling. */
  italic?: boolean;
  /** Whether to apply underline decoration. */
  underline?: boolean;
  /** Whether to apply strikethrough (line-through) decoration. */
  deleted?: boolean;
  /** Whether to apply muted text styling. */
  muted?: boolean;
  /** Icon name/content to display alongside text. */
  icon?: string;
  /** Whether to enable icon display. */
  enableIcon?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
}
