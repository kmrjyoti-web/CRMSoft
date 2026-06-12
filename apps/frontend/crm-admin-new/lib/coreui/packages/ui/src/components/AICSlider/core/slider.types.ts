/**
 * Slider component types.
 * Framework-agnostic.
 * Source: Angular slider.component.ts
 */

export type SliderOrientation = "horizontal" | "vertical";

export interface SliderProps<OnChange = (value: number | [number, number]) => void> {
  /** Current value (single or range). */
  value?: number | [number, number];
  /** Default value for uncontrolled usage. */
  defaultValue?: number | [number, number];
  /** Minimum value (default 0). */
  min?: number;
  /** Maximum value (default 100). */
  max?: number;
  /** Step increment (default 1). */
  step?: number;
  /** Range mode with two handles. */
  range?: boolean;
  /** Show tick marks at step intervals. */
  showTicks?: boolean;
  /** Show value labels. */
  showLabels?: boolean;
  /** Orientation (horizontal or vertical). */
  orientation?: SliderOrientation;
  /** Whether the slider is disabled. */
  disabled?: boolean;
  /** Label text. */
  label?: string;
  /** Custom track color. */
  trackColor?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Change handler. */
  onChange?: OnChange;
}
