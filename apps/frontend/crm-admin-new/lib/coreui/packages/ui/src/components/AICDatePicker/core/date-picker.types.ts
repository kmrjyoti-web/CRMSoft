/**
 * DatePicker component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular date-picker.component.ts
 */

// ---------------------------------------------------------------------------
// Shape & FloatLabel unions
// ---------------------------------------------------------------------------

/** Available shape variants for the DatePicker component. */
export type DatePickerShape = "rounded" | "square" | "circle";

/** Floating label behavior modes. */
export type FloatLabelMode = "auto" | "in" | "on" | "over" | "off";

// ---------------------------------------------------------------------------
// DatePickerProps
// ---------------------------------------------------------------------------

/**
 * Core props for the DatePicker component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type (e.g. React.ChangeEvent, native Event, etc.).
 */
export interface DatePickerProps<OnChange = (value: string) => void> {
  /** Current date value in YYYY-MM-DD format. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Label text displayed above or inside the input. */
  label?: string;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Minimum selectable date in YYYY-MM-DD format. */
  min?: string;
  /** Maximum selectable date in YYYY-MM-DD format. */
  max?: string;
  /** Shape variant for border-radius styling. */
  shape?: DatePickerShape;
  /** Floating label behavior mode. */
  floatLabel?: FloatLabelMode;
  /** Icon identifier rendered on the left side of the input. */
  prefixIcon?: string;
  /** Whether the date picker is disabled. */
  disabled?: boolean;
  /** Whether the date picker is required. */
  required?: boolean;
  /** Whether the date picker is in an error state. */
  error?: boolean;
  /** Error message displayed below the input when `error` is true. */
  errorMessage?: string;
  /** Whether the input takes the full width of its container. */
  fluid?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Change handler — generic to stay framework-agnostic. */
  onChange?: OnChange;
}
