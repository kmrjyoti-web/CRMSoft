/**
 * OTPInput state logic and pure helper functions.
 * Framework-agnostic.
 * Source: Angular otp-input.component.ts
 */

/** Create empty digits array of given length. */
export function createEmptyDigits(length: number): string[] {
  return new Array(length).fill("");
}

/** Parse a value string into digits array, padding to length. */
export function parseOTPValue(value: string | undefined, length: number): string[] {
  if (!value) return createEmptyDigits(length);
  const chars = value.split("").slice(0, length);
  return chars.concat(new Array(Math.max(0, length - chars.length)).fill(""));
}

/** Join digits into a single string. */
export function joinDigits(digits: string[]): string {
  return digits.join("");
}

/** Check if all digits are filled. */
export function isOTPComplete(digits: string[]): boolean {
  return digits.every((d) => d.length === 1);
}

/** Handle single digit input — returns new digits array and next focus index. */
export function handleDigitInput(
  digits: string[],
  index: number,
  value: string,
): { digits: string[]; focusIndex: number } {
  // Paste: multiple characters
  if (value.length > 1) {
    const chars = value.replace(/\D/g, "").split("").slice(0, digits.length);
    const newDigits = chars.concat(
      new Array(Math.max(0, digits.length - chars.length)).fill(""),
    );
    return {
      digits: newDigits,
      focusIndex: Math.min(chars.length, digits.length - 1),
    };
  }

  // Single character
  const digit = value.replace(/\D/g, "");
  const newDigits = [...digits];
  newDigits[index] = digit;
  const focusIndex = digit && index < digits.length - 1 ? index + 1 : index;
  return { digits: newDigits, focusIndex };
}

/** Handle backspace — returns new digits array and focus index. */
export function handleBackspace(
  digits: string[],
  index: number,
): { digits: string[]; focusIndex: number } {
  const newDigits = [...digits];
  if (!newDigits[index] && index > 0) {
    // Current empty: clear previous and move back
    newDigits[index - 1] = "";
    return { digits: newDigits, focusIndex: index - 1 };
  }
  // Clear current
  newDigits[index] = "";
  return { digits: newDigits, focusIndex: index };
}

/** Format seconds into MM:SS string. */
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
