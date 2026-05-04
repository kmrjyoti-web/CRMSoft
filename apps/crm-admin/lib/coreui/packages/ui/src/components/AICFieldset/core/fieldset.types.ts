/**
 * Fieldset component types.
 * Framework-agnostic.
 * Source: Angular fieldset in dynamic-field.component.ts
 */

export type FieldsetAppearance = "panel" | "legend";

export interface FieldsetProps<OnToggle = (collapsed: boolean) => void> {
  /** Legend text. */
  label?: string;
  /** Subtitle text (panel appearance). */
  subtitle?: string;
  /** Prefix icon name. */
  icon?: string;
  /** Image URL (shown as avatar). */
  image?: string;
  /** Appearance variant. */
  appearance?: FieldsetAppearance;
  /** Whether the fieldset is collapsible. */
  toggleable?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Default collapsed state. */
  defaultCollapsed?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Toggle handler. */
  onToggle?: OnToggle;
}
