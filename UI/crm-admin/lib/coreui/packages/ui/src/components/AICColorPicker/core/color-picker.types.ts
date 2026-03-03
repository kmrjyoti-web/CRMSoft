/**
 * ColorPicker component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular color-picker.component.ts
 */

// ---------------------------------------------------------------------------
// RGB
// ---------------------------------------------------------------------------

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ColorPickerProps<
  OnChange = (color: string) => void,
> {
  /** Current hex color value (e.g. "#ff0000"). */
  value?: string;
  /** Default color for uncontrolled usage. */
  defaultValue?: string;
  /** Predefined palette swatches. */
  palette?: string[];
  /** Maximum number of recent colors to track. */
  maxRecentColors?: number;
  /** Whether the color picker is disabled. */
  disabled?: boolean;
  /** Label text. */
  label?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Change handler — fires with hex string. */
  onChange?: OnChange;
}
