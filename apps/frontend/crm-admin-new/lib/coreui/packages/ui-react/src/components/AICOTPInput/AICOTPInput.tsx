/**
 * React AICOTPInput component.
 * N-digit OTP input with auto-focus, paste support, resend timer.
 * Source: Angular otp-input.component.ts
 */

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  cn,
  parseOTPValue,
  joinDigits,
  isOTPComplete,
  handleDigitInput,
  handleBackspace,
  formatTimer,
  GLOBAL_UI_CONFIG,
} from "@coreui/ui";

export interface OTPInputProps {
  length?: number;
  value?: string;
  disabled?: boolean;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  resendTimer?: number;
  className?: string;
  id?: string;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  onResend?: () => void;
}

export const AICOTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (props, ref) => {
    const {
      length = 6,
      value: controlledValue,
      disabled = false,
      label,
      error = false,
      errorMessage,
      resendTimer = 0,
      className,
      id,
      onComplete,
      onChange,
      onResend,
    } = props;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [digits, setDigits] = useState(() =>
      parseOTPValue(controlledValue, length),
    );
    const [timer, setTimer] = useState(resendTimer);
    const [timerActive, setTimerActive] = useState(resendTimer > 0);

    // Sync controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        setDigits(parseOTPValue(controlledValue, length));
      }
    }, [controlledValue, length]);

    // Timer countdown
    useEffect(() => {
      if (!timerActive || timer <= 0) {
        if (timer <= 0) setTimerActive(false);
        return;
      }
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [timerActive, timer]);

    const focusIndex = useCallback(
      (index: number) => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
      },
      [],
    );

    const commitDigits = useCallback(
      (newDigits: string[]) => {
        setDigits(newDigits);
        const code = joinDigits(newDigits);
        onChange?.(code);
        if (isOTPComplete(newDigits)) {
          onComplete?.(code);
        }
      },
      [onChange, onComplete],
    );

    const handleInput = useCallback(
      (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const result = handleDigitInput(digits, index, e.target.value);
        commitDigits(result.digits);
        focusIndex(result.focusIndex);
      },
      [digits, commitDigits, focusIndex],
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          const result = handleBackspace(digits, index);
          commitDigits(result.digits);
          focusIndex(result.focusIndex);
        } else if (e.key === "ArrowLeft" && index > 0) {
          focusIndex(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
          focusIndex(index + 1);
        }
      },
      [digits, commitDigits, focusIndex, length],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        const result = handleDigitInput(digits, 0, pasted);
        commitDigits(result.digits);
        focusIndex(result.focusIndex);
      },
      [digits, commitDigits, focusIndex, length],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
      },
      [],
    );

    const handleResend = useCallback(() => {
      setTimer(resendTimer);
      setTimerActive(true);
      onResend?.();
    }, [resendTimer, onResend]);

    return (
      <div className={cn("relative", className)} ref={ref} data-testid="otp-input">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-3 text-center">
            {label}
          </label>
        )}

        <div className={GLOBAL_UI_CONFIG.otpContainer} data-testid="otp-container">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={handleFocus}
              disabled={disabled}
              className={cn(
                GLOBAL_UI_CONFIG.otpInput,
                error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              data-testid={`otp-digit-${index}`}
              id={id ? `${id}-${index}` : undefined}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Timer / Resend */}
        {resendTimer > 0 && (
          <div className="text-center mt-3" data-testid="otp-timer-section">
            {timerActive ? (
              <span className="text-sm text-[var(--color-text-tertiary)]" data-testid="otp-timer">
                Resend in {formatTimer(timer)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={disabled}
                className="text-sm text-[var(--color-border-focus)] hover:underline font-medium"
                data-testid="otp-resend"
              >
                Resend Code
              </button>
            )}
          </div>
        )}

        {error && errorMessage && (
          <div className="text-xs text-[var(--color-danger)] text-center mt-2" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

AICOTPInput.displayName = "AICOTPInput";
