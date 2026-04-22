/**
 * AICIcon component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-icon.component.ts
 */

// ---------------------------------------------------------------------------
// Provider & Size unions
// ---------------------------------------------------------------------------

/** Icon rendering provider — 'svg' renders inline SVG, 'class' renders via CSS class. */
export type AICIconProvider = "svg" | "class";

/** Predefined size presets or a custom CSS size string. */
export type AICIconSize =
  | "tiny"
  | "sm"
  | "small"
  | "md"
  | "medium"
  | "lg"
  | "large"
  | "xlarge"
  | "2xl"
  | string;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the AICIcon component.
 * Framework adapters extend this with their own event/child types.
 */
export interface AICIconProps {
  /** Icon name — resolved via `getIconSafe()` from the icon registry. */
  name?: string;
  /** Size preset or custom CSS size string. */
  size?: AICIconSize;
  /** CSS color value applied to the icon. */
  color?: string;
  /** Background color applied to the icon wrapper. */
  bgColor?: string;
  /** Raw SVG string to render directly (overrides `name` lookup). */
  svgContent?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Whether the icon should have a continuous spin animation. */
  spin?: boolean;
  /** Whether the icon should have a pulse animation. */
  pulse?: boolean;
}
