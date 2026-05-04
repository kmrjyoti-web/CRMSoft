/**
 * Input component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Type, Size & State unions
// ---------------------------------------------------------------------------

/** Supported HTML input type attributes for the Input component. */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

/** Available size presets for the Input component. */
export type InputSize = "sm" | "md" | "lg";

/** Resolved visual state used to determine which style set to apply. */
export type InputState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// InputProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Input component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type (e.g. React.ChangeEvent, native Event, etc.).
 */
export interface InputProps<OnChange = (value: string) => void> {
  /** HTML input type attribute. */
  type?: InputType;
  /** Size preset. */
  size?: InputSize;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Current input value. */
  value?: string;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in an error state. */
  error?: boolean;
  /** Error message displayed below the input when `error` is true. */
  errorMessage?: string;
  /** Icon identifier rendered on the left side of the input. */
  leftIcon?: string;
  /** Icon identifier rendered on the right side of the input. */
  rightIcon?: string;
  /** Static text rendered before the input value (inside the input container). */
  prefix?: string;
  /** Static text rendered after the input value (inside the input container). */
  suffix?: string;
  /** Whether to show a clear button when the input has a value. */
  clearable?: boolean;
  /** Maximum number of characters allowed. */
  maxLength?: number;
  /** Whether to display a character count indicator when `maxLength` is set. */
  showCharCount?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler — generic to stay framework-agnostic. */
  onChange?: OnChange;
}
