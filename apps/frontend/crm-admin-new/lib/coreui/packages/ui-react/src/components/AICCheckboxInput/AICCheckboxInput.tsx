/**
 * React AICCheckboxInput component.
 * Single checkbox with label, indeterminate state, and rich layout.
 *
 * Source: Angular checkbox-input.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn, isCheckboxRichLayout, resolveCheckboxInputState } from "@coreui/ui";
import type { CheckboxInputState } from "@coreui/ui";
import type { IconName } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckboxInputProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  label?: string;
  description?: string;
  icon?: IconName;
  image?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (checked: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICCheckboxInput = React.forwardRef<
  HTMLDivElement,
  CheckboxInputProps
>((props, ref) => {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    indeterminate = false,
    label,
    description,
    icon,
    image,
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

  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const inputRef = useRef<HTMLInputElement>(null);

  const isChecked = isControlled ? controlledChecked : internalChecked;
  const richLayout = isCheckboxRichLayout(icon, image);
  const visualState = resolveCheckboxInputState({
    disabled,
    error,
    checked: isChecked,
    indeterminate,
  });

  // Sync indeterminate property (not an HTML attribute)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback(() => {
    if (disabled) return;
    const newValue = !isChecked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  }, [disabled, isChecked, isControlled, onChange]);

  // -----------------------------------------------------------------------
  // Standard checkbox layout
  // -----------------------------------------------------------------------

  if (!richLayout) {
    return (
      <div className={cn("relative mb-3", className)} ref={ref}>
        <div className="flex items-center gap-2 pt-1 pb-1">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="checkbox"
              id={id}
              name={name}
              checked={isChecked}
              disabled={disabled}
              onChange={handleChange}
              className="peer cursor-pointer appearance-none rounded border border-[var(--color-border)] shadow-sm checked:bg-[var(--color-border-focus)] checked:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-all shrink-0 h-5 w-5"
              aria-label={ariaLabel ?? label}
              aria-checked={indeterminate ? "mixed" : isChecked}
              data-testid="checkbox-input"
            />
            {/* Checkmark icon */}
            {!indeterminate && (
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {/* Indeterminate dash icon */}
            {indeterminate && (
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
                aria-hidden="true"
                data-testid="checkbox-indeterminate-icon"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </div>
          {label && (
            <label
              htmlFor={id}
              className="cursor-pointer select-none text-[var(--color-text)] font-medium flex items-center gap-1"
              data-testid="checkbox-label"
            >
              <span>{label}</span>
              {required && (
                <span className="text-[var(--color-danger)]">*</span>
              )}
            </label>
          )}
        </div>

        {error && errorMessage && (
          <div className="text-xs text-[var(--color-danger)] mt-0.5" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Rich layout (with icon/image)
  // -----------------------------------------------------------------------

  return (
    <div className={cn("relative mb-3", className)} ref={ref}>
      <label
        className={cn(
          "relative flex cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm focus:outline-none transition-all items-center",
          isChecked &&
            "border-[var(--color-border-focus)] ring-1 ring-[var(--color-border-focus)] bg-[var(--color-border-focus)]/5",
          "hover:border-[var(--color-text-tertiary)]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        data-testid="checkbox-rich-layout"
      >
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)] mr-3"
          aria-label={ariaLabel ?? label}
          data-testid="checkbox-input"
        />
        {icon && (
          <div
            className={cn(
              "mr-3 text-[var(--color-text-tertiary)]",
              isChecked && "text-[var(--color-border-focus)]",
            )}
          >
            <span className="w-5 h-5">{icon}</span>
          </div>
        )}
        {image && (
          <img
            src={image}
            className="w-10 h-10 rounded object-cover mr-3"
            alt=""
          />
        )}
        <div className="flex flex-col">
          <span
            className={cn(
              "font-medium text-[var(--color-text)]",
              isChecked && "text-[var(--color-border-focus)]",
            )}
          >
            {label}
          </span>
          {description && (
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {description}
            </span>
          )}
        </div>
      </label>

      {error && errorMessage && (
        <div className="text-xs text-[var(--color-danger)] mt-0.5" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

AICCheckboxInput.displayName = "AICCheckboxInput";
