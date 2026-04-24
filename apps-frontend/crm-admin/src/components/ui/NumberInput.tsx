'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import { AICNumber } from '@coreui/ui-react';

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

type AICNumberProps = React.ComponentProps<typeof AICNumber>;

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_OPTIONS = Object.entries(CURRENCY_SYMBOLS);

type NumberInputProps = Omit<AICNumberProps, 'label' | 'currency'> & {
  /** Floating label — floats up on focus / value / explicit placeholder */
  label?: string;
  /** Currency code e.g. "INR". Shows ₹/$/€/£ selector on the LEFT inside the input. */
  currencyCode?: string;
  onCurrencyChange?: (code: string) => void;
  /** @deprecated AICNumber has no leftIcon — use currencyCode instead */
  leftIcon?: React.ReactNode;
};

export const NumberInput = forwardRef<HTMLElement, NumberInputProps>((props, ref) => {
  const {
    label,
    value,
    onFocus,
    onBlur,
    onChange,
    leftIcon: _leftIcon,  // AICNumber has no leftIcon — consumed and ignored
    error,
    placeholder,
    currencyCode,
    onCurrencyChange,
    ...rest
  } = props;

  const [focused, setFocused] = useState(false);

  // Stabilize onChange so AICNumber's useCallback/useEffect deps don't change every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const stableOnChange = useCallback((v: number | null) => onChangeRef.current?.(v), []);

  // Float label only when: focused, has value, or caller passed an explicit non-blank placeholder.
  // We always pass placeholder=" " to AICNumber to suppress its default "Enter number".
  const hasExplicitPlaceholder = placeholder != null && placeholder.trim() !== '';
  const isActive = focused || value != null || hasExplicitPlaceholder;

  // ── Floating label ──────────────────────────────────────────────────
  const labelCls = [
    'absolute z-[2] bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[75%]',
    isActive
      ? `top-0 -translate-y-1/2 text-[11px] left-2 ${error ? 'text-red-500' : 'text-[var(--color-primary)]'}`
      : `top-1/2 -translate-y-1/2 text-sm text-gray-400 ${currencyCode != null ? 'left-10' : 'left-2.5'}`,
  ].join(' ');

  // Always suppress AICNumber's default "Enter number" placeholder
  const resolvedPlaceholder = hasExplicitPlaceholder ? placeholder! : ' ';

  // ── Currency selector ────────────────────────────────────────────────
  // We use AICNumber's built-in `currency` prop to render the symbol as a
  // flex sibling — this naturally pushes the input text right without any
  // padding hacks. We overlay a transparent <select> on top for interaction.
  const currencySymbol = currencyCode != null ? CURRENCY_SYMBOLS[currencyCode] ?? currencyCode : undefined;

  // The currency slot rendered by AICNumber is ~28px wide (symbol + mr-1).
  // We overlay a same-size transparent <select> absolutely positioned over it.
  const currencyOverlay = currencyCode != null ? (
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 0,
        bottom: 0,
        width: 32,
        zIndex: 4,
        pointerEvents: 'none',   // let clicks pass through to the input below
        borderRight: '1px solid #e5e7eb',
      }}
    >
      <select
        value={currencyCode}
        onChange={(e) => onCurrencyChange?.(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'auto',  // re-enable for the select itself
        }}
        title="Select currency"
      >
        {CURRENCY_OPTIONS.map(([code, sym]) => (
          <option key={code} value={code}>{sym} {code}</option>
        ))}
      </select>
    </div>
  ) : null;

  // ── No floating label ───────────────────────────────────────────────
  if (!label) {
    return (
      <div className="relative w-full [&_input]:text-right" onKeyDown={handleMaxDigits}>
        <AICNumber
          ref={ref as any}
          size="sm"
          variant="outlined"
          label=""
          value={value}
          onChange={stableOnChange}
          currency={currencySymbol}
          error={error}
          placeholder={resolvedPlaceholder}
          showSpinner={false}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
        {currencyOverlay}
      </div>
    );
  }

  // ── With floating label ─────────────────────────────────────────────
  return (
    <div className="relative w-full min-w-[140px] [&_input]:text-right" onKeyDown={handleMaxDigits}>
      <AICNumber
        ref={ref as any}
        size="sm"
        variant="outlined"
        label=""
        value={value}
        onChange={stableOnChange}
        currency={currencySymbol}
        error={error}
        placeholder={resolvedPlaceholder}
        showSpinner={false}
        onFocus={(e: any) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e: any) => { setFocused(false); onBlur?.(e); }}
        {...rest}
      />
      <label className={labelCls}>
        {label}
        {rest.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {currencyOverlay}
    </div>
  );
});
NumberInput.displayName = 'NumberInput';
