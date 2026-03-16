'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import { AICCurrencyInput } from '@coreui/ui-react';

const MAX_INTEGER_DIGITS = 12;

function handleMaxDigits(e: React.KeyboardEvent<HTMLDivElement>) {
  const input = (e.target as HTMLElement).closest('input') ?? (e.target as HTMLInputElement);
  if (input?.tagName !== 'INPUT') return;
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
  if (!/^[0-9]$/.test(e.key)) return;
  const val = input.value ?? '';
  const intPart = val.split('.')[0]?.replace(/[^0-9]/g, '') ?? '';
  if (intPart.length >= MAX_INTEGER_DIGITS) e.preventDefault();
}

type AICCurrencyInputProps = React.ComponentProps<typeof AICCurrencyInput>;

type CurrencyInputProps = Omit<AICCurrencyInputProps, 'label'> & {
  /** Floating label — floats up on focus / value */
  label?: string;
};

export const CurrencyInput = forwardRef<HTMLElement, CurrencyInputProps>((props, ref) => {
  const { label, value, onFocus, onBlur, onChange, error, placeholder, required, ...rest } = props;
  const [focused, setFocused] = useState(false);

  // Stabilize onChange so AICCurrencyInput's useCallback/useEffect deps don't change every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const stableOnChange = useCallback((v: number | null) => onChangeRef.current?.(v), []);

  const hasExplicitPlaceholder = placeholder != null && placeholder.trim() !== '';
  const isActive = focused || value != null || hasExplicitPlaceholder;

  // No floating label — pass through directly
  if (!label) {
    return (
      <div className="relative w-full" onKeyDown={handleMaxDigits}>
        <AICCurrencyInput
          ref={ref as any}
          size="sm"
          variant="outlined"
          label=""
          value={value}
          onChange={stableOnChange}
          error={error}
          placeholder={placeholder ?? ' '}
          required={required}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
      </div>
    );
  }

  const labelCls = [
    'absolute z-[2] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[75%]',
    isActive
      ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
      : 'top-1/2 -translate-y-1/2 text-sm text-gray-400 left-10',
  ].join(' ');

  return (
    <div className="relative w-full min-w-[140px]" onKeyDown={handleMaxDigits}>
      <AICCurrencyInput
        ref={ref as any}
        size="sm"
        variant="outlined"
        label=""
        value={value}
        onChange={stableOnChange}
        error={error}
        placeholder={hasExplicitPlaceholder ? placeholder! : ' '}
        required={required}
        onFocus={(e: any) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e: any) => { setFocused(false); onBlur?.(e); }}
        {...rest}
      />
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
});
CurrencyInput.displayName = 'CurrencyInput';
