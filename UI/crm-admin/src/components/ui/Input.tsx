'use client';

import { forwardRef, useState } from 'react';

import { AICInput } from '@coreui/ui-react';

type InputProps = React.ComponentProps<typeof AICInput> & {
  /** Floating label text. When provided, renders label inside the border that floats up on focus/value. */
  label?: string;
};

export const Input = forwardRef<HTMLElement, InputProps>((props, ref) => {
  const { label, value, onFocus, onBlur, leftIcon, error, ...rest } = props;
  const [focused, setFocused] = useState(false);
  const isActive = focused || !!value || !!props.placeholder;

  if (!label) {
    return (
      <AICInput
        ref={ref as any}
        size="sm"
        value={value}
        leftIcon={leftIcon}
        error={error}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />
    );
  }

  const labelCls = [
    'absolute z-[1] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[80%]',
    isActive
      ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
      : `top-4 -translate-y-1/2 text-sm text-gray-500 ${leftIcon ? 'left-9' : 'left-2.5'}`,
  ].join(' ');

  return (
    <div className="relative">
      <AICInput
        ref={ref as any}
        size="sm"
        value={value}
        leftIcon={leftIcon}
        error={error}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...rest}
      />
      <label className={labelCls}>
        {label}
        {rest.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
});
Input.displayName = 'Input';
