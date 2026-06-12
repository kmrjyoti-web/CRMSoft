/**
 * Country database for MobileInput.
 * Each entry contains dial code, flag, mask, and maxLength.
 *
 * Source: Angular mobile-input.component.ts countries array (extended).
 */

import type { CountryData } from "./mobile-input.types";

/**
 * Built-in country database.
 * Popular countries are flagged for pinning at the top of the dropdown.
 */
export const COUNTRY_DATABASE: CountryData[] = [
  // ── Popular countries (pinned at top) ──────────────────
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", mask: "00000-00000", maxLength: 10, popular: true },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", mask: "(000) 000-0000", maxLength: 10, popular: true },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", mask: "00000 000000", maxLength: 11, popular: true },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", mask: "(000) 000-0000", maxLength: 10, popular: true },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", mask: "0000 000 000", maxLength: 9, popular: true },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪", mask: "00 000 0000", maxLength: 9, popular: true },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", mask: "0000 0000", maxLength: 8, popular: true },

  // ── Asia ──────────────────────────────────────────────
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", mask: "000 0000 0000", maxLength: 11 },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", mask: "000-0000-0000", maxLength: 11 },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷", mask: "000-0000-0000", maxLength: 11 },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", mask: "00000-00000", maxLength: 10 },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", mask: "000-0000000", maxLength: 10 },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", mask: "00 000 0000", maxLength: 9 },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", mask: "00-0000 0000", maxLength: 10 },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", mask: "00 000 0000", maxLength: 9 },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", mask: "000 000 0000", maxLength: 10 },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", mask: "000-0000-0000", maxLength: 11 },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", mask: "000-0000000", maxLength: 10 },

  // ── Europe ────────────────────────────────────────────
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", mask: "0000 0000000", maxLength: 11 },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", mask: "0 00 00 00 00", maxLength: 9 },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", mask: "000 000 0000", maxLength: 10 },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", mask: "000 000 000", maxLength: 9 },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", mask: "0 00000000", maxLength: 9 },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭", mask: "00 000 00 00", maxLength: 9 },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪", mask: "00-000 00 00", maxLength: 9 },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺", mask: "(000) 000-00-00", maxLength: 10 },

  // ── Americas ──────────────────────────────────────────
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", mask: "(00) 00000-0000", maxLength: 11 },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", mask: "00 0000 0000", maxLength: 10 },

  // ── Middle East & Africa ──────────────────────────────
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", mask: "00 000 0000", maxLength: 9 },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", mask: "00 000 0000", maxLength: 9 },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", mask: "000 000 0000", maxLength: 10 },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", mask: "000 000000", maxLength: 9 },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", mask: "00 0000 0000", maxLength: 10 },
];

/** Default country code. */
export const DEFAULT_COUNTRY_CODE = "IN";
