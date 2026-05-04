'use client';

import { forwardRef, useState } from 'react';

// ── Props ──────────────────────────────────────────────────────────────────

interface TextareaInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Floating label — floats up on focus or when value is present */
  label?: string;
  /** Left icon element (e.g. <Icon name="file-text" size={16} />) */
  leftIcon?: React.ReactNode;
  /** Error state — turns border + label red */
  error?: boolean;
  /** Error message shown below the textarea */
  errorMessage?: string;
  /** Number of visible rows (default: 3) */
  rows?: number;
  /** Auto-grow to fit content (up to maxRows) */
  autoResize?: boolean;
  /** Max rows when autoResize is enabled */
  maxRows?: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  (
    {
      label,
      leftIcon,
      error,
      errorMessage,
      rows = 3,
      autoResize = false,
      maxRows = 10,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      className = '',
      required,
      disabled,
      placeholder,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');

    const controlledValue = value !== undefined ? value : internalValue;
    const isActive = focused || !!controlledValue || !!placeholder;

    // ── Auto-resize handler ──
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setInternalValue(e.target.value);
      if (autoResize) {
        const el = e.target;
        el.style.height = 'auto';
        const lineHeight = parseInt(getComputedStyle(el).lineHeight || '20', 10);
        const maxHeight = lineHeight * maxRows + 16; // +padding
        el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
      }
      onChange?.(e);
    };

    // ── Styles ────────────────────────────────────────────────────────────

    const borderColor = error
      ? 'border-red-500 focus:border-red-500'
      : focused
      ? 'border-[var(--color-primary)]'
      : 'border-gray-300 hover:border-gray-400';

    const textareaCls = [
      'w-full rounded-md border bg-white text-sm text-gray-900',
      'transition-colors duration-150 outline-none resize-none',
      'px-3 py-2',
      leftIcon ? 'pl-9' : '',
      label ? 'pt-4' : '',
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      borderColor,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // ── Label positioning (mirrors Input.tsx pattern) ──────────────────────

    const labelCls = [
      'absolute z-[1] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[80%]',
      isActive
        ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
        : `top-4 -translate-y-1/2 text-sm text-gray-500 ${leftIcon ? 'left-9' : 'left-2.5'}`,
    ].join(' ');

    return (
      <div className="flex flex-col gap-0.5">
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3 top-3.5 text-gray-400 pointer-events-none flex-shrink-0">
              {leftIcon}
            </span>
          )}

          <textarea
            ref={ref}
            rows={rows}
            value={controlledValue}
            disabled={disabled}
            required={required}
            placeholder={label ? undefined : placeholder}
            className={textareaCls}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            onChange={handleChange}
            {...rest}
          />

          {/* Floating label */}
          {label && (
            <label className={labelCls}>
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-red-500 px-1">{errorMessage}</p>
        )}
      </div>
    );
  },
);

TextareaInput.displayName = 'TextareaInput';
