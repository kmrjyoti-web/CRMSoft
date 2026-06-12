'use client';

import { forwardRef, useState, useCallback } from 'react';
import { useCompanyProfile } from '@/features/company-profile/hooks/useCompanyProfile';

interface QuantityInputProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Shared quantity input — no +/- stepper, right-aligned, numeric-only.
 * Reads `decimalPlaces` from company profile settings.
 * Only allows digits and a single decimal point.
 */
export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ label, value, onChange, min = 0, max, error, errorMessage, required, disabled, className }, ref) => {
    const { data: profile } = useCompanyProfile();
    const decimalPlaces: number = (profile as any)?.data?.decimalPlaces ?? (profile as any)?.decimalPlaces ?? 2;

    const [focused, setFocused] = useState(false);
    const [rawValue, setRawValue] = useState('');

    // Format display value
    const displayValue = focused
      ? rawValue
      : value != null
        ? value.toFixed(decimalPlaces)
        : (0).toFixed(decimalPlaces);

    const isActive = focused || value != null || (label && value === 0);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;

      // Allow Ctrl/Cmd + A/C/V/X
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;

      // Allow decimal point (only one)
      if (e.key === '.') {
        if (e.currentTarget.value.includes('.')) {
          e.preventDefault();
        }
        return;
      }

      // Block everything except digits
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      // Allow empty string for clearing
      if (val === '' || val === '.') {
        setRawValue(val);
        onChange(null);
        return;
      }

      // Validate: only digits and single decimal point
      if (!/^\d*\.?\d*$/.test(val)) return;

      setRawValue(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }, [onChange]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      // Set raw value to current value for editing
      setRawValue(value != null ? String(value) : '');
      // Select all on focus for easy replacement
      setTimeout(() => e.target.select(), 0);
    }, [value]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      // Clamp value on blur
      if (value != null) {
        let clamped = value;
        if (min != null && clamped < min) clamped = min;
        if (max != null && clamped > max) clamped = max;
        // Round to decimal places
        clamped = parseFloat(clamped.toFixed(decimalPlaces));
        if (clamped !== value) onChange(clamped);
      } else {
        // If empty, default to 0
        onChange(0);
      }
    }, [value, min, max, decimalPlaces, onChange]);

    // Floating label classes
    const labelCls = label
      ? [
          'absolute z-[2] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[75%]',
          isActive
            ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400 left-2.5',
        ].join(' ')
      : '';

    return (
      <div className={`relative w-full ${className ?? ''}`}>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={[
            'w-full rounded-md border px-3 py-[7px] text-sm text-right font-medium tabular-nums',
            'outline-none transition-colors',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
              : 'border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light,#dbeafe)]',
            disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white',
          ].join(' ')}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        />
        {label && (
          <label className={labelCls}>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {error && errorMessage && (
          <span className="text-xs text-red-500 mt-0.5 block">{errorMessage}</span>
        )}
      </div>
    );
  },
);
QuantityInput.displayName = 'QuantityInput';
