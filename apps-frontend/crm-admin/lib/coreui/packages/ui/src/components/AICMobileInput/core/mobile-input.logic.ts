/**
 * MobileInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular mobile-input.component.ts — exact port.
 */

import type {
  MobileInputState,
  CountryData,
} from "./mobile-input.types";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

export interface MobileInputInternalState {
  isFocused: boolean;
  /** Raw digits (no formatting, no dial code). */
  rawValue: string;
  /** Masked/formatted display value. */
  displayValue: string;
  /** Currently selected country. */
  selectedCountry: CountryData | null;
}

export const initialMobileInputState: MobileInputInternalState = {
  isFocused: false,
  rawValue: "",
  displayValue: "",
  selectedCountry: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type MobileInputAction =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT"; rawInput: string }
  | { type: "SET_VALUE"; value: string }
  | { type: "SELECT_COUNTRY"; country: CountryData }
  | { type: "CLEAR" };

// ---------------------------------------------------------------------------
// Resolve visual state
// ---------------------------------------------------------------------------

export interface ResolveMobileInputStateProps {
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

export function resolveMobileInputState(
  props: ResolveMobileInputStateProps,
  internalState: MobileInputInternalState,
): MobileInputState {
  if (props.disabled) return "disabled";
  if (props.readOnly) return "readOnly";
  if (props.error) return "error";
  if (internalState.isFocused) return "focused";
  return "default";
}

// ---------------------------------------------------------------------------
// Apply phone mask — exact port of Angular applyMask()
// Uses '0' as digit placeholder (per Angular mobile-input source).
// ---------------------------------------------------------------------------

/**
 * Applies a phone mask to raw digit string.
 * Mask char '0' = digit slot; everything else is a literal separator.
 *
 * @example
 * applyPhoneMask("9876543210", "00000-00000") → "98765-43210"
 * applyPhoneMask("2125551234", "(000) 000-0000") → "(212) 555-1234"
 */
export function applyPhoneMask(rawDigits: string, mask: string): string {
  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < rawDigits.length; i++) {
    const maskChar = mask[i];
    if (maskChar === "0") {
      result += rawDigits[digitIndex];
      digitIndex++;
    } else {
      // literal separator — add it
      result += maskChar;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Strip non-digits
// ---------------------------------------------------------------------------

/** Extract only digits from input — exact port of Angular onInput() stripping. */
export function stripNonDigits(input: string): string {
  return input.replace(/\D/g, "");
}

// ---------------------------------------------------------------------------
// Filter countries for search
// ---------------------------------------------------------------------------

/**
 * Filters the country list by name, code, or dial code.
 * Case-insensitive substring match.
 */
export function filterCountries(
  countries: CountryData[],
  searchTerm: string,
): CountryData[] {
  if (!searchTerm.trim()) return countries;

  const term = searchTerm.toLowerCase().trim();
  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.dialCode.includes(term),
  );
}

// ---------------------------------------------------------------------------
// Partition countries — popular first
// ---------------------------------------------------------------------------

/** Returns only countries marked as popular. */
export function getPopularCountries(countries: CountryData[]): CountryData[] {
  return countries.filter((c) => c.popular);
}

/** Returns countries NOT marked as popular. */
export function getNonPopularCountries(countries: CountryData[]): CountryData[] {
  return countries.filter((c) => !c.popular);
}

// ---------------------------------------------------------------------------
// Validate phone number length
// ---------------------------------------------------------------------------

/**
 * Validates raw digit length against the country's maxLength.
 * Returns error message or null.
 */
export function validatePhoneNumber(
  rawDigits: string,
  country: CountryData | null,
): string | null {
  if (!country || !rawDigits) return null;
  if (rawDigits.length > 0 && rawDigits.length < country.maxLength) {
    return `Phone number must be ${country.maxLength} digits`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Find country by code
// ---------------------------------------------------------------------------

export function findCountryByCode(
  countries: CountryData[],
  code: string,
): CountryData | undefined {
  return countries.find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function mobileInputReducer(
  state: MobileInputInternalState,
  action: MobileInputAction,
): MobileInputInternalState {
  switch (action.type) {
    case "FOCUS": {
      return { ...state, isFocused: true };
    }
    case "BLUR": {
      return { ...state, isFocused: false };
    }
    case "INPUT": {
      const digits = stripNonDigits(action.rawInput);
      const country = state.selectedCountry;

      // Truncate to maxLength
      const truncated = country
        ? digits.slice(0, country.maxLength)
        : digits;

      // Apply mask
      const display =
        country && country.mask
          ? applyPhoneMask(truncated, country.mask)
          : truncated;

      return { ...state, rawValue: truncated, displayValue: display };
    }
    case "SET_VALUE": {
      const digits = stripNonDigits(action.value);
      const country = state.selectedCountry;
      const truncated = country
        ? digits.slice(0, country.maxLength)
        : digits;
      const display =
        country && country.mask
          ? applyPhoneMask(truncated, country.mask)
          : truncated;
      return { ...state, rawValue: truncated, displayValue: display };
    }
    case "SELECT_COUNTRY": {
      const country = action.country;
      // Re-apply mask with new country — exact port of Angular onCountryChange()
      const truncated = state.rawValue.slice(0, country.maxLength);
      const display = country.mask
        ? applyPhoneMask(truncated, country.mask)
        : truncated;
      return {
        ...state,
        selectedCountry: country,
        rawValue: truncated,
        displayValue: display,
      };
    }
    case "CLEAR": {
      return { ...state, rawValue: "", displayValue: "" };
    }
    default:
      return state;
  }
}
