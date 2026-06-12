/**
 * CurrencyInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular currency-input.component.ts
 */

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State unions
// ---------------------------------------------------------------------------

/** Visual variant of the CurrencyInput container. */
export type CurrencyInputVariant = "outlined" | "filled" | "standard";

/** Size preset for the CurrencyInput component. */
export type CurrencyInputSize = "sm" | "md" | "lg";

/** Shape of the CurrencyInput container corners. */
export type CurrencyInputShape = "rounded" | "square";

/** Resolved visual state for styling. */
export type CurrencyInputState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// Currency option (for optional currency code dropdown)
// ---------------------------------------------------------------------------

/** A selectable currency option for the dropdown. */
export interface CurrencyOption {
  /** Currency symbol (₹, $, €, £, ¥). */
  symbol: string;
  /** ISO 4217 currency code (INR, USD, EUR, GBP, JPY). */
  code: string;
  /** Display label for the dropdown. */
  label: string;
}

/** Locale for number formatting. */
export type CurrencyLocale = "en-IN" | "en-US" | string;

// ---------------------------------------------------------------------------
// CurrencyInputProps
// ---------------------------------------------------------------------------

/**
 * Core props for the CurrencyInput component.
 * `OnChange` is generic so framework adapters can supply their own type.
 */
export interface CurrencyInputProps<
  OnChange = (value: number | null) => void,
> {
  /** Current numeric value. */
  value?: number | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: number | null;
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Currency symbol displayed as prefix. */
  currency?: string;
  /** Number of decimal places (0-4). Default: 2. */
  decimals?: number;
  /** Locale for thousand-separator formatting. */
  locale?: CurrencyLocale;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Optional list of selectable currencies for a dropdown. */
  currencies?: CurrencyOption[];
  /** Visual variant. */
  variant?: CurrencyInputVariant;
  /** Size preset. */
  size?: CurrencyInputSize;
  /** Corner shape. */
  shape?: CurrencyInputShape;
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
  /** Currency change handler (when user selects from dropdown). */
  onCurrencyChange?: (currency: CurrencyOption) => void;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
