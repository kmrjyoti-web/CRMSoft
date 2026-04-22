/**
 * Signature component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular signature.component.ts
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SignatureProps<
  OnChange = (dataUrl: string | null) => void,
> {
  /** Current signature data URL value. */
  value?: string | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: string | null;
  /** Label text. */
  label?: string;
  /** Canvas width in pixels (defaults to container width). */
  width?: number;
  /** Canvas height in pixels. */
  height?: number;
  /** Stroke line width. */
  lineWidth?: number;
  /** Stroke line color. */
  lineColor?: string;
  /** Whether the signature pad is disabled. */
  disabled?: boolean;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field has a validation error. */
  error?: boolean;
  /** Error message to display. */
  errorMessage?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Change handler — fires with data URL string or null on clear. */
  onChange?: OnChange;
}
