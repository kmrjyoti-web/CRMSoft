'use client';

import { forwardRef, useState, useId } from 'react';

/**
 * PAN format: 5 letters + 4 digits + 1 letter
 * 4th letter encodes entity type: P=Individual, C=Company, H=HUF, F=Firm, A=AOP, T=Trust, etc.
 * Example: ABCDE1234F
 */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validatePAN(value: string): boolean {
  return PAN_REGEX.test(value.trim().toUpperCase());
}

interface PANInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  showValidation?: boolean;
}

export const PANInput = forwardRef<HTMLInputElement, PANInputProps>(
  ({ label, value = '', onChange, error, showValidation = true, className, required, id, ...rest }, ref) => {
    const [touched, setTouched] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const normalized = value.toUpperCase();
    const isValid = validatePAN(normalized);
    const showError = error ?? (touched && normalized.length > 0 && !isValid ? 'Invalid PAN (e.g. ABCDE1234F)' : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="text"
          maxLength={10}
          value={normalized}
          onChange={(e) => onChange?.(e.target.value.toUpperCase())}
          onBlur={() => setTouched(true)}
          placeholder="e.g. ABCDE1234F"
          aria-label={label ?? 'PAN Number'}
          aria-required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : undefined}
          className={[
            'w-full rounded-md border px-3 py-2 text-sm font-mono uppercase tracking-widest',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            showError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300',
            className ?? '',
          ].join(' ')}
          {...rest}
        />
        {showValidation && !showError && touched && normalized.length === 10 && isValid && (
          <p className="mt-1 text-xs text-green-600" role="status">✓ Valid PAN</p>
        )}
        {showError && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">{showError}</p>
        )}
      </div>
    );
  },
);
PANInput.displayName = 'PANInput';
