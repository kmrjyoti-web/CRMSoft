/**
 * OTPInput component types.
 * Framework-agnostic.
 * Source: Angular otp-input.component.ts
 */

export interface OTPInputProps<
  OnComplete = (code: string) => void,
  OnChange = (code: string) => void,
> {
  /** Number of OTP digits (default 6). */
  length?: number;
  /** Current value. */
  value?: string;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Label text. */
  label?: string;
  /** Error state. */
  error?: boolean;
  /** Error message. */
  errorMessage?: string;
  /** Timer duration in seconds for resend (0 = no timer). */
  resendTimer?: number;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Called when all digits are filled. */
  onComplete?: OnComplete;
  /** Called on each digit change. */
  onChange?: OnChange;
  /** Called when resend is clicked. */
  onResend?: () => void;
}
