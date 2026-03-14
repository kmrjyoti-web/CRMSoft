'use client';

import { forwardRef, useState } from 'react';
import { AICCurrencyInput } from '@coreui/ui-react';

type AICCurrencyInputProps = React.ComponentProps<typeof AICCurrencyInput>;

type CurrencyInputProps = Omit<AICCurrencyInputProps, 'label'> & {
  /** Floating label — floats up on focus / value */
  label?: string;
};

export const CurrencyInput = forwardRef<HTMLElement, CurrencyInputProps>((props, ref) => {
  const { label, value, onFocus, onBlur, error, placeholder, required, ...rest } = props;
  const [focused, setFocused] = useState(false);

  const hasExplicitPlaceholder = placeholder != null && placeholder.trim() !== '';
  const isActive = focused || value != null || hasExplicitPlaceholder;

  // No floating label — pass through directly
  if (!label) {
    return (
      <AICCurrencyInput
        ref={ref as any}
        size="sm"
        variant="outlined"
        label=""
        value={value}
        error={error}
        placeholder={placeholder ?? ' '}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />
    );
  }

  const labelCls = [
    'absolute z-[2] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[75%]',
    isActive
      ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
      : 'top-1/2 -translate-y-1/2 text-sm text-gray-400 left-10',
  ].join(' ');

  return (
    <div className="relative w-full">
      <AICCurrencyInput
        ref={ref as any}
        size="sm"
        variant="outlined"
        label=""
        value={value}
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
