/**
 * AICInputmask component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-inputmask.component.ts
 */

// ---------------------------------------------------------------------------
// Mask type union — exact match of Angular AICInputmaskType
// ---------------------------------------------------------------------------

/** Predefined and custom mask types. */
export type AICInputmaskType =
  | "none"
  | "phone"
  | "date"
  | "time"
  | "card"
  | "cvv"
  | "aadhaar"
  | "custom"
  | "regex";

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State (same as AICTextbox pattern)
// ---------------------------------------------------------------------------

/** Visual variant of the AICInputmask container. */
export type AICInputmaskVariant = "outlined" | "filled" | "standard";

/** Size preset for the AICInputmask component. */
export type AICInputmaskSize = "sm" | "md" | "lg";

/** Shape of the AICInputmask container corners. */
export type AICInputmaskShape = "rounded" | "square";

/** Resolved visual state for styling. */
export type AICInputmaskState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// AICInputmaskProps
// ---------------------------------------------------------------------------

/**
 * Core props for the AICInputmask component.
 * `OnChange` is generic so framework adapters can supply their own type.
 */
export interface AICInputmaskProps<OnChange = (value: string) => void> {
  /** Current masked (or unmasked if emitUnmaskedValue) string value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Label text. */
  label?: string;
  /** Placeholder text — auto-resolved per mask type when omitted. */
  placeholder?: string;
  /** The mask type to apply. */
  maskType?: AICInputmaskType;
  /** Mask pattern for `custom` type. 9=digit, a/A=alpha, *=alphanumeric. */
  customMask?: string;
  /** Regex source string for `regex` type. Each char is tested individually. */
  regexPattern?: string;
  /** Maximum raw character length. Defaults to mask slot count. */
  maxLength?: number;
  /** When true, onChange emits the raw value (no mask literals). */
  emitUnmaskedValue?: boolean;
  /** Slot character for unfilled mask positions (default: '_'). */
  slotChar?: string;
  /** Whether to show slot placeholder chars for unfilled positions. */
  showSlots?: boolean;
  /** Visual variant. */
  variant?: AICInputmaskVariant;
  /** Size preset. */
  size?: AICInputmaskSize;
  /** Corner shape. */
  shape?: AICInputmaskShape;
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
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
