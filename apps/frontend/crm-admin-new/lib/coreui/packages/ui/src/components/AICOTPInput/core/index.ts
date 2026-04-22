// Types
export type { OTPInputProps } from "./otp-input.types";

// Logic
export {
  createEmptyDigits,
  parseOTPValue,
  joinDigits,
  isOTPComplete,
  handleDigitInput,
  handleBackspace,
  formatTimer,
} from "./otp-input.logic";
