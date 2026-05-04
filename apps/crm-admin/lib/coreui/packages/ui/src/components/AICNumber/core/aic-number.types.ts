/**
 * AICNumber component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-number.component.ts
 */

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State unions
// ---------------------------------------------------------------------------

/** Visual variant of the AICNumber container. */
export type AICNumberVariant = "outlined" | "filled" | "standard";

/** Size preset for the AICNumber component. */
export type AICNumberSize = "sm" | "md" | "lg";

/** Shape of the AICNumber container corners. */
export type AICNumberShape = "rounded" | "square";

/** Resolved visual state for styling. */
export type AICNumberState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

/**
 * Spinner button layout — matches Angular `spinnerLayout` input.
 * - `right`: both +/- buttons on the right (default)
 * - `left`: both +/- buttons on the left
 * - `split`: - on left, + on right
 * - `split-reverse`: + on left, - on right
 */
export type SpinnerLayout = "right" | "left" | "split" | "split-reverse";

/** Currency symbol for currency mode. */
export type CurrencySymbol = "₹" | "$" | "€" | "£" | "¥" | string;

/**
 * Locale for number formatting.
 * - `en-IN`: Indian format (1,00,000)
 * - `en-US`: Western format (100,000)
 */
export type NumberLocale = "en-IN" | "en-US" | string;

// ---------------------------------------------------------------------------
// Spinner button descriptor (from Angular leftButtons/rightButtons)
// ---------------------------------------------------------------------------

export interface SpinnerButton {
  action: "increase" | "decrease";
  icon: "plus" | "minus";
  label: string;
}

// ---------------------------------------------------------------------------
// AICNumberProps
// ---------------------------------------------------------------------------

/**
 * Core props for the AICNumber component.
 * `OnChange` is generic so framework adapters can supply their own type.
 */
export interface AICNumberProps<OnChange = (value: number | null) => void> {
  /** Current numeric value. */
  value?: number | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: number | null;
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Step increment/decrement value (supports decimals, e.g. 0.5). */
  step?: number;
  /** Decimal precision for rounding. 0 = integers, 2 = two decimal places. */
  precision?: number;
  /** Whether to show spinner buttons. */
  showSpinner?: boolean;
  /** Layout of spinner buttons. */
  spinnerLayout?: SpinnerLayout;
  /** Visual variant. */
  variant?: AICNumberVariant;
  /** Size preset. */
  size?: AICNumberSize;
  /** Corner shape. */
  shape?: AICNumberShape;
  /** Whether the input is required. */
  required?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in error state. */
  error?: boolean;
  /** Error message displayed below the input. */
  errorMessage?: string;
  /** Currency mode — when set, shows the symbol as a prefix. */
  currency?: CurrencySymbol;
  /** Number formatting locale. */
  locale?: NumberLocale;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Design token overrides. */
  dt?: Record<string, unknown>;
  /** Value change handler. */
  onChange?: OnChange;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
