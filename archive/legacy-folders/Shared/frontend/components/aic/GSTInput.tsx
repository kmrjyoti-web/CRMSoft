'use client';

import { forwardRef, useState, useId } from 'react';

/**
 * GST number format: 2-digit state code + 10-char PAN + 1-digit entity number + Z + 1-digit check
 * Example: 27AABCS1234A1Z5 (Maharashtra)
 */
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGST(value: string): boolean {
  return GST_REGEX.test(value.trim().toUpperCase());
}

interface GSTInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  showValidation?: boolean;
}

export const GSTInput = forwardRef<HTMLInputElement, GSTInputProps>(
  ({ label, value = '', onChange, error, showValidation = true, className, required, id, ...rest }, ref) => {
    const [touched, setTouched] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const normalized = value.toUpperCase();
    const isValid = validateGST(normalized);
    const showError = error ?? (touched && normalized.length > 0 && !isValid ? 'Invalid GST number (e.g. 27AABCS1234A1Z5)' : undefined);

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
          maxLength={15}
          value={normalized}
          onChange={(e) => onChange?.(e.target.value.toUpperCase())}
          onBlur={() => setTouched(true)}
          placeholder="e.g. 27AABCS1234A1Z5"
          aria-label={label ?? 'GST Number'}
          aria-required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : undefined}
          className={[
            'w-full rounded-md border px-3 py-2 text-sm font-mono uppercase tracking-wider',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            showError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300',
            className ?? '',
          ].join(' ')}
          {...rest}
        />
        {showValidation && !showError && touched && normalized.length === 15 && isValid && (
          <p className="mt-1 text-xs text-green-600" role="status">✓ Valid GST number</p>
        )}
        {showError && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">{showError}</p>
        )}
      </div>
    );
  },
);
GSTInput.displayName = 'GSTInput';
