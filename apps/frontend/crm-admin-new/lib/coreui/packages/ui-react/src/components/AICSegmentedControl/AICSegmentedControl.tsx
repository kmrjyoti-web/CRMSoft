/**
 * React AICSegmentedControl component.
 * Single-select segmented buttons with icon, image, and text support.
 *
 * Source: Angular segmented-control.component.ts
 */

import React, { useCallback, useState } from "react";

import { cn, segmentedControlSizeStyles } from "@coreui/ui";
import type { SegmentOption, SegmentedControlSize } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SegmentedControlProps {
  value?: string | number | boolean | null;
  defaultValue?: string | number | boolean | null;
  options?: SegmentOption[];
  label?: string;
  size?: SegmentedControlSize;
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

export const AICSegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = null,
    options = [],
    label,
    size = "md",
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
  const sizeConfig = segmentedControlSizeStyles[size];

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

  return (
    <div className={cn("relative mb-3", className)} ref={ref}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            "block text-sm font-medium text-[var(--color-text-secondary)] mb-2",
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

      {/* Segment container */}
      <div
        className="flex p-1 space-x-1 bg-[var(--color-bg-secondary)] rounded-lg"
        role="radiogroup"
        aria-label={ariaLabel ?? label ?? "Segmented control"}
        data-testid="segmented-control-container"
      >
        {options.map((opt) => {
          const isSelected = opt.value === currentValue;

          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={disabled || opt.disabled}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-border-focus)] shadow-sm",
                sizeConfig.button,
                isSelected
                  ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/50 shadow-none",
                disabled && "opacity-50 cursor-not-allowed",
                opt.disabled && "opacity-50 cursor-not-allowed",
              )}
              data-testid={`segment-option-${opt.value}`}
            >
              {/* Image */}
              {opt.image && (
                <img
                  src={opt.image}
                  className={cn(
                    "rounded-full object-cover",
                    sizeConfig.icon,
                    isSelected &&
                      "ring-2 ring-offset-1 ring-[var(--color-border-focus)]",
                  )}
                  alt=""
                  data-testid={`segment-image-${opt.value}`}
                />
              )}

              {/* Icon */}
              {opt.icon && (
                <span
                  className={cn(
                    sizeConfig.icon,
                    isSelected
                      ? "text-[var(--color-border-focus)]"
                      : "text-[var(--color-text-tertiary)]",
                  )}
                  data-testid={`segment-icon-${opt.value}`}
                >
                  {opt.icon}
                </span>
              )}

              {/* Text */}
              <span className="truncate">{opt.label}</span>
            </button>
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
});

AICSegmentedControl.displayName = "AICSegmentedControl";
