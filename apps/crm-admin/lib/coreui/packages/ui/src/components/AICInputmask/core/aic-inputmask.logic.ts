/**
 * AICInputmask mask logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-inputmask.component.ts — exact port.
 */

import type {
  AICInputmaskType,
  AICInputmaskState,
} from "./aic-inputmask.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface AICInputmaskInternalState {
  isFocused: boolean;
  rawValue: string;
  displayValue: string;
}

export const initialAICInputmaskState: AICInputmaskInternalState = {
  isFocused: false,
  rawValue: "",
  displayValue: "",
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type AICInputmaskAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT"; rawInput: string }
  | { type: "CLEAR" }
  | { type: "SET_VALUE"; value: string };

// ---------------------------------------------------------------------------
// Reducer config
// ---------------------------------------------------------------------------

export interface AICInputmaskReducerConfig {
  maskType: AICInputmaskType;
  customMask: string;
  regexPattern: string;
  maxLength?: number;
  emitUnmaskedValue: boolean;
  slotChar: string;
  showSlots: boolean;
}

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveAICInputmaskStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveAICInputmaskState(
  props: ResolveAICInputmaskStateProps,
  internalState: AICInputmaskInternalState,
): AICInputmaskState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Predefined masks — exact match of Angular resolveMask()
// ---------------------------------------------------------------------------

const PREDEFINED_MASKS: Record<
  Exclude<AICInputmaskType, "none" | "custom" | "regex">,
  string
> = {
  phone: "(999) 999-9999",
  date: "99/99/9999",
  time: "99:99",
  card: "9999 9999 9999 9999",
  cvv: "999",
  aadhaar: "9999 9999 9999",
};

/** Resolves the mask pattern string for a given mask type. */
export function resolveMask(
  maskType: AICInputmaskType,
  customMask: string,
): string {
  if (maskType === "none" || maskType === "regex") return "";
  if (maskType === "custom") return customMask || "";
  return PREDEFINED_MASKS[maskType] || "";
}

// ---------------------------------------------------------------------------
// Default placeholders — exact match of Angular resolvedPlaceholder()
// ---------------------------------------------------------------------------

const DEFAULT_PLACEHOLDERS: Record<AICInputmaskType, string> = {
  none: "Enter value",
  phone: "(123) 456-7890",
  date: "DD/MM/YYYY",
  time: "HH:MM",
  card: "1234 5678 9012 3456",
  cvv: "123",
  aadhaar: "1234 5678 9012",
  custom: "AA-9999",
  regex: "Pattern based input",
};

/** Resolves placeholder text — uses default per mask type when empty. */
export function resolveInputmaskPlaceholder(
  placeholder: string | undefined,
  maskType: AICInputmaskType,
  customMask: string,
): string {
  if (placeholder && placeholder.trim()) return placeholder;
  if (maskType === "custom") return customMask || DEFAULT_PLACEHOLDERS.custom;
  return DEFAULT_PLACEHOLDERS[maskType];
}

// ---------------------------------------------------------------------------
// Digits-only mask types
// ---------------------------------------------------------------------------

const DIGITS_ONLY_TYPES: AICInputmaskType[] = [
  "phone",
  "date",
  "time",
  "card",
  "cvv",
  "aadhaar",
];

// ---------------------------------------------------------------------------
// extractRawForMask — exact port of Angular extractRawForMask()
// ---------------------------------------------------------------------------

/** Strips non-relevant characters and truncates to max slot count. */
export function extractRawForMask(
  input: string,
  mask: string,
  maskType: AICInputmaskType,
  maxLength?: number,
): string {
  let raw = input;

  if (DIGITS_ONLY_TYPES.includes(maskType)) {
    raw = input.replace(/\D+/g, "");
  }

  const maxByMask = (mask.match(/[9aA*]/g) || []).length;
  const max = maxLength ?? maxByMask;
  if (typeof max === "number") raw = raw.slice(0, max);

  return raw;
}

// ---------------------------------------------------------------------------
// applyMask — exact port of Angular applyMask(), extended with 'a' support
// ---------------------------------------------------------------------------

/**
 * Applies a mask pattern to raw input.
 * Mask characters:
 * - `9` → digit
 * - `A` → alpha, forced uppercase (Angular behavior)
 * - `a` → alpha, case preserved
 * - `*` → alphanumeric
 * - Anything else → literal
 */
export function applyMask(raw: string, mask: string): string {
  if (!mask) return raw;

  let result = "";
  let rawIndex = 0;

  for (let i = 0; i < mask.length; i += 1) {
    const m = mask[i];
    const r = raw[rawIndex];

    if (!r) break;

    if (m === "9") {
      if (/\d/.test(r)) {
        result += r;
        rawIndex += 1;
      } else {
        rawIndex += 1;
        i -= 1;
      }
      continue;
    }

    if (m === "A") {
      if (/[a-zA-Z]/.test(r)) {
        result += r.toUpperCase();
        rawIndex += 1;
      } else {
        rawIndex += 1;
        i -= 1;
      }
      continue;
    }

    if (m === "a") {
      if (/[a-zA-Z]/.test(r)) {
        result += r;
        rawIndex += 1;
      } else {
        rawIndex += 1;
        i -= 1;
      }
      continue;
    }

    if (m === "*") {
      if (/[a-zA-Z0-9]/.test(r)) {
        result += r;
        rawIndex += 1;
      } else {
        rawIndex += 1;
        i -= 1;
      }
      continue;
    }

    // Literal character
    result += m;
    if (r === m) rawIndex += 1;
  }

  return result;
}

// ---------------------------------------------------------------------------
// applyMaskWithSlots — extends applyMask with placeholder slots
// ---------------------------------------------------------------------------

/**
 * Applies mask and fills remaining unfilled positions with the slot char.
 * Shows the full mask shape even when input is incomplete.
 */
export function applyMaskWithSlots(
  raw: string,
  mask: string,
  slotChar: string,
): string {
  if (!mask) return raw;

  // First, get the masked portion from applyMask
  const masked = applyMask(raw, mask);

  // Now continue from where the mask left off, filling slots
  let result = masked;
  let maskedLiteralCount = 0;
  let maskedSlotCount = 0;

  // Count how many mask positions are consumed
  for (let i = 0; i < mask.length && i < masked.length; i += 1) {
    const m = mask[i];
    if (m === "9" || m === "A" || m === "a" || m === "*") {
      maskedSlotCount += 1;
    } else {
      maskedLiteralCount += 1;
    }
  }

  // Fill remaining positions in the mask
  for (let i = masked.length; i < mask.length; i += 1) {
    const m = mask[i];
    if (m === "9" || m === "A" || m === "a" || m === "*") {
      result += slotChar;
    } else {
      result += m;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// applyRegexFilter — exact port of Angular applyRegexFilter()
// ---------------------------------------------------------------------------

/** Filters input characters by a regex pattern (per-character test). */
export function applyRegexFilter(
  input: string,
  regexPattern: string,
  maxLength?: number,
): string {
  const source = (regexPattern || "").trim();
  if (!source) return truncate(input, maxLength);

  let re: RegExp;
  try {
    re = new RegExp(source);
  } catch {
    return truncate(input, maxLength);
  }

  let out = "";
  for (const ch of input) {
    if (re.test(ch)) out += ch;
    re.lastIndex = 0;
  }

  return truncate(out, maxLength);
}

// ---------------------------------------------------------------------------
// truncate — exact port of Angular truncate()
// ---------------------------------------------------------------------------

/** Truncates string to maxLength if provided. */
export function truncate(input: string, maxLength?: number): string {
  if (typeof maxLength !== "number") return input;
  return input.slice(0, Math.max(0, maxLength));
}

// ---------------------------------------------------------------------------
// normalizeInput — orchestrates mask logic, exact port of Angular normalizeInput()
// ---------------------------------------------------------------------------

export interface NormalizeResult {
  /** Raw value (digits/chars only, no mask literals). */
  raw: string;
  /** Display value (with mask formatting applied). */
  display: string;
}

/**
 * Master normalization function — exact port of Angular normalizeInput().
 * Routes to the appropriate mask handler based on maskType.
 */
export function normalizeInput(
  input: string,
  config: AICInputmaskReducerConfig,
): NormalizeResult {
  const { maskType, customMask, regexPattern, maxLength, showSlots, slotChar } = config;

  if (maskType === "none") {
    const plain = truncate(input, maxLength);
    return { raw: plain, display: plain };
  }

  if (maskType === "regex") {
    const filtered = applyRegexFilter(input, regexPattern, maxLength);
    return { raw: filtered, display: filtered };
  }

  const mask = resolveMask(maskType, customMask);
  const raw = extractRawForMask(input, mask, maskType, maxLength);
  const display = showSlots
    ? applyMaskWithSlots(raw, mask, slotChar)
    : applyMask(raw, mask);

  return { raw, display };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function aicInputmaskReducer(
  state: AICInputmaskInternalState,
  action: AICInputmaskAction,
  config: AICInputmaskReducerConfig,
): AICInputmaskInternalState {
  switch (action.type) {
    case "FOCUS":
      return { ...state, isFocused: true };
    case "BLUR":
      return { ...state, isFocused: false };
    case "INPUT": {
      const result = normalizeInput(action.rawInput, config);
      return { ...state, rawValue: result.raw, displayValue: result.display };
    }
    case "SET_VALUE": {
      const result = normalizeInput(action.value, config);
      return { ...state, rawValue: result.raw, displayValue: result.display };
    }
    case "CLEAR":
      return { ...state, rawValue: "", displayValue: "" };
    default:
      return state;
  }
}
