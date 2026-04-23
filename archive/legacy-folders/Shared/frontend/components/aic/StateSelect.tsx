'use client';

import { forwardRef, useId } from 'react';
import { INDIAN_STATES, type IndianStateCode } from '../../../common/constants/indian-states';

interface StateSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: IndianStateCode | '') => void;
  error?: string;
  placeholder?: string;
  /** Show GST state code alongside state name */
  showGstCode?: boolean;
}

export const StateSelect = forwardRef<HTMLSelectElement, StateSelectProps>(
  (
    {
      label,
      value = '',
      onChange,
      error,
      placeholder = 'Select state',
      showGstCode = false,
      className,
      required,
      id,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          value={value}
          onChange={(e) => onChange?.(e.target.value as IndianStateCode | '')}
          aria-label={label ?? 'State'}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={[
            'w-full rounded-md border px-3 py-2 text-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300',
            className ?? '',
          ].join(' ')}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {INDIAN_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {showGstCode ? `${state.gstCode} — ${state.name}` : state.name}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  },
);
StateSelect.displayName = 'StateSelect';
