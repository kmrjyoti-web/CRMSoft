/**
 * React AICToggleButton component.
 * AICButton-style toggle with icon, text, and active checkmark.
 *
 * Source: Angular toggle-button.component.ts
 */

import React, { useCallback, useState } from "react";

import {
  cn,
  toggleButtonSizeStyles,
  toggleButtonActiveStyles,
  toggleButtonInactiveStyles,
} from "@coreui/ui";

import type { ToggleButtonSize, IconName } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ToggleButtonProps {
  active?: boolean;
  defaultActive?: boolean;
  label?: string;
  description?: string;
  icon?: IconName;
  size?: ToggleButtonSize;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (active: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICToggleButton = React.forwardRef<
  HTMLDivElement,
  ToggleButtonProps
>((props, ref) => {
  const {
    active: controlledActive,
    defaultActive = false,
    label,
    description,
    icon,
    size = "md",
    disabled = false,
    error = false,
    errorMessage,
    className,
    id,
    name,
    ariaLabel,
    onChange,
  } = props;

  const isControlled = controlledActive !== undefined;
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = isControlled ? controlledActive : internalActive;
  const sizeConfig = toggleButtonSizeStyles[size];

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const newValue = !isActive;
    if (!isControlled) {
      setInternalActive(newValue);
    }
    onChange?.(newValue);
  }, [disabled, isActive, isControlled, onChange]);

  return (
    <div className={cn("relative mb-3", className)} ref={ref}>
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={isActive ? "true" : "false"}
        />
      )}

      <button
        type="button"
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isActive}
        aria-label={ariaLabel ?? label}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-border-focus)]",
          sizeConfig.button,
          isActive ? toggleButtonActiveStyles : toggleButtonInactiveStyles,
          error && "ring-2 ring-[var(--color-danger)] border-[var(--color-danger)]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        data-testid="toggle-button"
      >
        {/* Prefix icon */}
        {icon && (
          <span className={sizeConfig.icon} data-testid="toggle-button-icon">
            {icon}
          </span>
        )}

        <span className="font-medium">{label}</span>

        {/* Checkmark when active */}
        {isActive && (
          <svg
            className={cn(sizeConfig.icon, "opacity-90 ml-1")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            data-testid="toggle-button-checkmark"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Description */}
      {description && (
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)] text-center">
          {description}
        </p>
      )}

      {error && errorMessage && (
        <div
          className="text-xs text-[var(--color-danger)] mt-0.5 text-center"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
});

AICToggleButton.displayName = "AICToggleButton";
