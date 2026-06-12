/**
 * MobileInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular mobile-input.component.ts
 */

// ---------------------------------------------------------------------------
// Country data
// ---------------------------------------------------------------------------

/** Country entry for the country code dropdown. */
export interface CountryData {
  /** ISO 3166-1 alpha-2 country code (e.g. 'IN', 'US'). */
  code: string;
  /** Country name. */
  name: string;
  /** International dial code with + prefix (e.g. '+91', '+1'). */
  dialCode: string;
  /** Flag emoji. */
  flag: string;
  /** Phone mask pattern. 0=digit, other chars are literals. */
  mask: string;
  /** Maximum digits (without country code). */
  maxLength: number;
  /** Whether this country appears in the popular section. */
  popular?: boolean;
}

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State
// ---------------------------------------------------------------------------

/** Visual variant of the MobileInput container. */
export type MobileInputVariant = "outlined" | "filled" | "standard";

/** Size preset for the MobileInput component. */
export type MobileInputSize = "sm" | "md" | "lg";

/** Shape of the MobileInput container corners. */
export type MobileInputShape = "rounded" | "square";

/** Resolved visual state for styling. */
export type MobileInputState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// MobileInputProps
// ---------------------------------------------------------------------------

/**
 * Core props for the MobileInput component.
 */
export interface MobileInputProps<
  OnChange = (value: string, dialCode: string) => void,
> {
  /** Current raw phone number (digits only, no dial code). */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Default country code (ISO 3166-1 alpha-2). Default: 'IN'. */
  defaultCountry?: string;
  /** Override the country list (uses built-in database if omitted). */
  countries?: CountryData[];
  /** Visual variant. */
  variant?: MobileInputVariant;
  /** Size preset. */
  size?: MobileInputSize;
  /** Corner shape. */
  shape?: MobileInputShape;
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
  /** Value change handler (raw digits + dial code). */
  onChange?: OnChange;
  /** Country change handler. */
  onCountryChange?: (country: CountryData) => void;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
