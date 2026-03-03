/**
 * React AICRadioGroup component.
 * AICRadio button options with grid layout, icons, images,
 * descriptions, and keyboard navigation.
 *
 * Source: Angular radio-group.component.ts
 */

import React, { useCallback, useState } from "react";

import {
  cn,
  getRadioGridColsClass,
  getNextRadioValue,
} from "@coreui/ui";

import type { RadioGroupOption } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RadioGroupProps {
  value?: string | number | boolean | null;
  defaultValue?: string | number | boolean | null;
  options?: RadioGroupOption[];
  label?: string;
  cols?: number;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (value: string | number | boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICRadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = null,
      options = [],
      label,
      cols,
      required = false,
      disabled = false,
      error = false,
      errorMessage,
      className,
      id,
      name,
      ariaLabel,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<
      string | number | boolean | null
    >(defaultValue);

    const currentValue = isControlled ? controlledValue : internalValue;

    const handleSelect = useCallback(
      (val: string | number | boolean) => {
        if (disabled) return;
        if (!isControlled) {
          setInternalValue(val);
        }
        onChange?.(val);
      },
      [disabled, isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = getNextRadioValue(options, currentValue, "next");
          if (next !== null) handleSelect(next);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = getNextRadioValue(options, currentValue, "prev");
          if (prev !== null) handleSelect(prev);
        }
      },
      [disabled, options, currentValue, handleSelect],
    );

    const gridColsClass = getRadioGridColsClass(cols);

    return (
      <div className={cn("mb-5", className)} ref={ref}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium text-[var(--color-text-secondary)] mb-3",
              required &&
                "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]",
            )}
          >
            {label}
          </label>
        )}

        {/* Hidden input for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue != null ? String(currentValue) : ""}
          />
        )}

        {/* Options grid */}
        <div
          className={cn("grid gap-3", gridColsClass)}
          role="radiogroup"
          aria-label={ariaLabel ?? label ?? "AICRadio group"}
          onKeyDown={handleKeyDown}
          data-testid="radio-group-container"
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;

            return (
              <label
                key={String(opt.value)}
                className={cn(
                  "relative flex cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm focus:outline-none transition-all items-center",
                  isSelected &&
                    "border-[var(--color-border-focus)] ring-1 ring-[var(--color-border-focus)] bg-[var(--color-border-focus)]/5",
                  "hover:border-[var(--color-text-tertiary)]",
                  opt.disabled && "opacity-50 cursor-not-allowed",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                data-testid={`radio-group-option-${opt.value}`}
              >
                <input
                  type="radio"
                  name={name ?? id}
                  value={String(opt.value)}
                  checked={isSelected}
                  disabled={disabled || opt.disabled}
                  onChange={() => handleSelect(opt.value)}
                  className="sr-only"
                  tabIndex={isSelected ? 0 : -1}
                />

                {opt.icon && (
                  <div
                    className={cn(
                      "flex-shrink-0 mr-3 text-[var(--color-text-tertiary)]",
                      isSelected && "text-[var(--color-border-focus)]",
                    )}
                    data-testid={`radio-group-icon-${opt.value}`}
                  >
                    <span className="w-5 h-5">{opt.icon}</span>
                  </div>
                )}

                {opt.image && (
                  <img
                    src={opt.image}
                    alt=""
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-md object-cover mr-3",
                      isSelected &&
                        "ring-2 ring-offset-1 ring-[var(--color-border-focus)]",
                    )}
                    data-testid={`radio-group-image-${opt.value}`}
                  />
                )}

                <span className="flex flex-1 flex-col">
                  <span
                    className={cn(
                      "block text-sm font-medium text-[var(--color-text)]",
                      isSelected && "text-[var(--color-border-focus)]",
                    )}
                  >
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="mt-0.5 flex items-center text-xs text-[var(--color-text-tertiary)]">
                      {opt.description}
                    </span>
                  )}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[var(--color-border-focus)]">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {error && errorMessage && (
          <div className="text-xs text-[var(--color-danger)] mt-0.5" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

AICRadioGroup.displayName = "AICRadioGroup";
