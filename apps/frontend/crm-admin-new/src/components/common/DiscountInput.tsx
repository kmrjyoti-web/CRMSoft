'use client';

import { forwardRef, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useCompanyProfile } from '@/features/company-profile/hooks/useCompanyProfile';

interface DiscountInputProps {
  label?: string;
  value: number | null;
  discountType: string;
  onChange: (value: number | null) => void;
  onTypeChange: (type: string) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

const DISCOUNT_TYPES = [
  { label: '%', value: 'PERCENTAGE' },
  { label: '₹', value: 'FLAT' },
];

/**
 * Shared discount input — input group with number field + attached Percent/Flat toggle.
 * Right-aligned numeric input, only digits and decimal point allowed.
 * Type selector is attached to the right as an input group addon.
 */
export const DiscountInput = forwardRef<HTMLInputElement, DiscountInputProps>(
  ({ label, value, discountType, onChange, onTypeChange, error, errorMessage, disabled, className }, ref) => {
    const { data: profile } = useCompanyProfile();
    const decimalPlaces: number = (profile as any)?.data?.decimalPlaces ?? (profile as any)?.decimalPlaces ?? 2;

    const [focused, setFocused] = useState(false);
    const [rawValue, setRawValue] = useState('');

    const displayValue = focused
      ? rawValue
      : value != null && value > 0
        ? value.toFixed(decimalPlaces)
        : (0).toFixed(decimalPlaces);

    const isActive = focused || value != null;

    const MAX_INTEGER_DIGITS = 5;

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      if (e.key === '.') {
        if (e.currentTarget.value.includes('.')) e.preventDefault();
        return;
      }
      if (!/^[0-9]$/.test(e.key)) { e.preventDefault(); return; }
      // Enforce max 5 integer digits
      const current = e.currentTarget.value;
      const intPart = current.split('.')[0] ?? '';
      if (!current.includes('.') && intPart.length >= MAX_INTEGER_DIGITS) e.preventDefault();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '' || val === '.') {
        setRawValue(val);
        onChange(null);
        return;
      }
      if (!/^\d*\.?\d*$/.test(val)) return;
      // Enforce max 5 integer digits
      const intPart = val.split('.')[0] ?? '';
      if (intPart.length > MAX_INTEGER_DIGITS) return;
      setRawValue(val);
      const num = parseFloat(val);
      if (!isNaN(num)) onChange(num);
    }, [onChange]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setRawValue(value != null ? String(value) : '');
      setTimeout(() => e.target.select(), 0);
    }, [value]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      if (value != null) {
        let clamped = Math.max(0, value);
        // For percent, cap at 100
        if (discountType === 'PERCENTAGE' && clamped > 100) clamped = 100;
        clamped = parseFloat(clamped.toFixed(decimalPlaces));
        if (clamped !== value) onChange(clamped);
      } else {
        onChange(null);
      }
    }, [value, discountType, decimalPlaces, onChange]);

    // Floating label
    const labelCls = label
      ? [
          'absolute z-[2] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[60%]',
          isActive
            ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400 left-7',
        ].join(' ')
      : '';

    const borderColor = error
      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200'
      : 'border-gray-300 focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary-light,#dbeafe)]';

    return (
      <div className={`relative w-[160px] min-w-[160px] ${className ?? ''}`}>
        <div
          className={[
            'flex items-stretch rounded-md border overflow-hidden transition-colors',
            borderColor,
            disabled ? 'bg-gray-50' : 'bg-white',
          ].join(' ')}
        >
          {/* Left icon */}
          <span className="flex items-center pl-2 text-gray-400 pointer-events-none">
            <Icon name="tag" size={14} />
          </span>

          {/* Number input */}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            maxLength={8}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={[
              'flex-1 min-w-0 pl-1.5 pr-3 py-[7px] text-sm text-right font-medium tabular-nums',
              'border-none outline-none bg-transparent',
              disabled ? 'text-gray-400 cursor-not-allowed' : '',
            ].join(' ')}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />

          {/* Type selector (attached addon) */}
          <div className="flex border-l border-gray-300">
            {DISCOUNT_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                disabled={disabled}
                onClick={() => onTypeChange(dt.value)}
                className={[
                  'px-2.5 py-[7px] text-xs font-semibold transition-colors',
                  'focus:outline-none',
                  discountType === dt.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                  // Separator between buttons
                  dt.value === 'FLAT' ? 'border-l border-gray-300' : '',
                ].join(' ')}
                title={dt.value === 'PERCENT' ? 'Percentage' : 'Flat Amount'}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {label && <label className={labelCls}>{label}</label>}
        {error && errorMessage && (
          <span className="text-xs text-red-500 mt-0.5 block">{errorMessage}</span>
        )}
      </div>
    );
  },
);
DiscountInput.displayName = 'DiscountInput';
