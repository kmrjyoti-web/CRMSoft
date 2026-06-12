/**
 * React AICSwitch component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useCallback } from "react";

import {
  getSwitchTrackStyles,
  getSwitchThumbStyles,
  getSwitchWrapperStyles,
  getSwitchLabelStyles,
  getSwitchDescriptionStyles,
  getSwitchA11yProps,
  getSwitchKeyboardHandlers,
} from "@coreui/ui";

import type {
  SwitchSize,
  SwitchAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICSwitch props.
 */
export interface SwitchProps {
  /** Whether the switch is toggled on. */
  checked?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** Size preset for the switch. */
  size?: SwitchSize;
  /** Position of the label relative to the switch track. */
  labelPosition?: "left" | "right";
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute for the underlying input. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler called with the new checked state. */
  onChange?: (checked: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICSwitch built on the shared core logic from `@coreui/ui`.
 *
 * Renders a hidden native `<input type="checkbox">` for form support alongside
 * a custom styled track with an animated sliding thumb.
 */
export const AICSwitch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (props, ref) => {
    const {
      checked = false,
      disabled = false,
      label,
      description,
      size = "md",
      labelPosition = "right",
      className,
      id,
      name,
      ariaLabel,
      onChange,
    } = props;

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const trackClasses = getSwitchTrackStyles({
      checked,
      disabled,
      size,
      className,
    });

    const thumbClasses = getSwitchThumbStyles({ checked, size });
    const wrapperClasses = getSwitchWrapperStyles({ labelPosition });
    const labelClasses = getSwitchLabelStyles({ disabled });
    const descriptionClasses = getSwitchDescriptionStyles();

    const a11yProps = getSwitchA11yProps({
      checked,
      disabled,
      id,
      ariaLabel,
    });

    const keyMap = getSwitchKeyboardHandlers();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleToggle = useCallback(() => {
      if (disabled) return;
      onChange?.(!checked);
    }, [disabled, checked, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        const actionType = keyMap[e.key] as SwitchAction["type"] | undefined;
        if (actionType === "TOGGLE") {
          e.preventDefault();
          handleToggle();
        }
      },
      [disabled, keyMap, handleToggle],
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        onChange?.(e.target.checked);
      },
      [disabled, onChange],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <label className={wrapperClasses}>
        {/* Hidden native input for form support */}
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          name={name}
          id={id}
          role="switch"
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Custom styled switch track */}
        <div
          className={trackClasses}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          {...a11yProps}
        >
          {/* Sliding thumb */}
          <span
            className={thumbClasses}
            aria-hidden="true"
          />
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className={labelClasses}>{label}</span>}
            {description && (
              <span className={descriptionClasses}>{description}</span>
            )}
          </div>
        )}
      </label>
    );
  },
);

AICSwitch.displayName = "AICSwitch";
