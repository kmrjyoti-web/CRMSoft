/**
 * React AICSwitchInput component.
 * Toggle switch with on/off labels, sizes, custom colors,
 * and rich layout with icon/image/description.
 *
 * Source: Angular switch-input.component.ts
 */

import React, { useCallback, useState } from "react";
import { cn, switchSizeStyles, isSwitchRichLayout } from "@coreui/ui";
import type { SwitchInputSize, IconName } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SwitchInputProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  description?: string;
  icon?: IconName;
  image?: string;
  onLabel?: string;
  offLabel?: string;
  size?: SwitchInputSize;
  activeColor?: string;
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

export const AICSwitchInput = React.forwardRef<HTMLDivElement, SwitchInputProps>(
  (props, ref) => {
    const {
      checked: controlledChecked,
      defaultChecked = false,
      label,
      description,
      icon,
      image,
      onLabel,
      offLabel,
      size = "md",
      activeColor,
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
    const isChecked = isControlled ? controlledChecked : internalChecked;
    const richLayout = isSwitchRichLayout(icon, image, description);
    const sizeConfig = switchSizeStyles[size];

    const handleChange = useCallback(() => {
      if (disabled) return;
      const newValue = !isChecked;
      if (!isControlled) {
        setInternalChecked(newValue);
      }
      onChange?.(newValue);
    }, [disabled, isChecked, isControlled, onChange]);

    const trackStyle = activeColor && isChecked
      ? { backgroundColor: activeColor }
      : undefined;

    const wrapperClasses = richLayout
      ? cn(
          "relative flex cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm focus:outline-none transition-all items-center",
          isChecked &&
            "border-[var(--color-border-focus)] ring-1 ring-[var(--color-border-focus)] bg-[var(--color-border-focus)]/5",
          "hover:border-[var(--color-text-tertiary)]",
          disabled && "opacity-50 cursor-not-allowed",
        )
      : "flex items-center cursor-pointer";

    return (
      <div className={cn("relative mb-3", className)} ref={ref}>
        <label className={wrapperClasses} data-testid="switch-input-wrapper">
          {/* Hidden checkbox input */}
          <input
            type="checkbox"
            id={id}
            name={name}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only peer"
            aria-label={ariaLabel ?? label}
            role="switch"
            aria-checked={isChecked}
            data-testid="switch-input"
          />

          {/* Track */}
          <div
            className={cn(
              "relative rounded-full bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-border-focus)]/50 transition-all",
              sizeConfig.track,
              isChecked && !activeColor && "bg-[var(--color-border-focus)]",
            )}
            style={trackStyle}
            data-testid="switch-track"
          >
            {/* Thumb */}
            <div
              className={cn(
                "absolute bg-white border border-[var(--color-border)] rounded-full transition-all",
                sizeConfig.thumb,
                isChecked && sizeConfig.thumbTranslate,
                isChecked && "border-white",
              )}
            />
          </div>

          {/* Content */}
          <div className="ml-3 flex flex-1 items-center">
            {image && (
              <img
                src={image}
                className="w-10 h-10 rounded object-cover mr-3 border border-[var(--color-border)]"
                alt=""
              />
            )}
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
            <div className="flex flex-col">
              {label && (
                <span
                  className={cn(
                    "text-sm font-medium text-[var(--color-text)]",
                    isChecked && richLayout && "text-[var(--color-border-focus)]",
                  )}
                >
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {description}
                </span>
              )}
              {/* On/Off label */}
              {(onLabel || offLabel) && (
                <span
                  className="text-xs text-[var(--color-text-tertiary)]"
                  data-testid="switch-state-label"
                >
                  {isChecked ? onLabel : offLabel}
                </span>
              )}
            </div>
          </div>

          {required && (
            <span className="text-[var(--color-danger)] ml-1 self-start">*</span>
          )}
        </label>

        {error && errorMessage && (
          <div className="text-xs text-[var(--color-danger)] mt-0.5" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

AICSwitchInput.displayName = "AICSwitchInput";
