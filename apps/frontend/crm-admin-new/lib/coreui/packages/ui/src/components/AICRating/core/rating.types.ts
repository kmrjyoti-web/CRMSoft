/**
 * Rating component types.
 * Framework-agnostic.
 * Source: Angular rating.component.ts
 */

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps<OnChange = (value: number) => void> {
  /** Current rating value. */
  value?: number;
  /** Default value for uncontrolled usage. */
  defaultValue?: number;
  /** Maximum number of stars (default 5). */
  max?: number;
  /** Whether the rating is readonly. */
  readonly?: boolean;
  /** Whether the rating is disabled. */
  disabled?: boolean;
  /** Whether half-star selection is supported. */
  allowHalf?: boolean;
  /** Size variant. */
  size?: RatingSize;
  /** Label text. */
  label?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Change handler. */
  onChange?: OnChange;
}
