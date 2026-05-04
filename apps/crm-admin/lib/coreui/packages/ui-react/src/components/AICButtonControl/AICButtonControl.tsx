/**
 * React AICButtonControl component.
 * Wrapper around AICButton supporting standard, group, and split modes.
 *
 * Source: Angular button-control.component.ts
 */

import React, { useCallback, useState, useEffect, useRef } from "react";

import { cn, isActiveOption } from "@coreui/ui";

import type {
  AICButtonVariant,
  AICButtonSize,
  ButtonType,
  ButtonOption,
} from "@coreui/ui";

import { AICSmartButton } from "../AICSmartButton/AICSmartButton";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICButtonControl props.
 */
export interface ButtonControlProps {
  /** Rendering mode: standard button, button group, or split button. */
  buttonType?: ButtonType;
  /** Visual style variant passed to AICButton. */
  variant?: AICButtonVariant;
  /** Size preset passed to AICButton. */
  size?: AICButtonSize;
  /** Primary label text. */
  label?: string;
  /** AICButton label text (alias for label). */
  buttonLabel?: string;
  /** Prefix icon name. */
  icon?: string;
  /** Suffix icon name. */
  suffixIcon?: string;
  /** Image URL for button content. */
  image?: string;
  /** Keyboard shortcut label. */
  shortcut?: string;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Whether the button acts as a toggle. */
  toggle?: boolean;
  /** Options for group or split modes. */
  options?: ButtonOption[];
  /** Current value (string for group/split, boolean for toggle). */
  value?: string | boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether the button is in a loading/pending state. */
  loading?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Change handler for group/split/toggle interactions. */
  onChange?: (value: string | boolean) => void;
  /** Click handler for standard mode. */
  onClick?: (e: React.MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICButtonControl built on AICButton from `@coreui/ui`.
 *
 * Supports three modes:
 * - `standard` — renders a single AICButton
 * - `group` — renders an inline button group from an options array
 * - `split` — renders a main AICButton + toggle for a dropdown menu
 */
export const AICButtonControl = React.forwardRef<HTMLDivElement, ButtonControlProps>(
  (props, ref) => {
    const {
      buttonType = "standard",
      variant = "primary",
      size = "md",
      label,
      buttonLabel,
      icon,
      suffixIcon,
      image,
      shortcut,
      fullWidth = false,
      toggle = false,
      options = [],
      value,
      disabled = false,
      loading = false,
      className,
      onChange,
      onClick,
    } = props;

    const displayLabel = buttonLabel ?? label;

    // -----------------------------------------------------------------------
    // Split dropdown state
    // -----------------------------------------------------------------------

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = useCallback(() => {
      setDropdownOpen((prev) => !prev);
    }, []);

    const handleOptionClick = useCallback(
      (optionValue: string) => {
        onChange?.(optionValue);
        setDropdownOpen(false);
      },
      [onChange],
    );

    // Close dropdown on outside click
    useEffect(() => {
      if (!dropdownOpen) return;

      const handleOutsideClick = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, [dropdownOpen]);

    // -----------------------------------------------------------------------
    // Standard mode
    // -----------------------------------------------------------------------

    if (buttonType === "standard") {
      return (
        <div
          ref={ref}
          className={cn("inline-flex", className)}
          data-testid="button-control"
        >
          <AICSmartButton
            variant={variant}
            size={size}
            icon={icon}
            suffixIcon={suffixIcon}
            label={displayLabel}
            shortcut={shortcut}
            fullWidth={fullWidth}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
          >
            {image && (
              <img
                src={image}
                alt=""
                className="h-5 w-5 object-contain"
                data-testid="button-control-image"
              />
            )}
          </AICSmartButton>
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // Group mode
    // -----------------------------------------------------------------------

    if (buttonType === "group") {
      return (
        <div
          ref={ref}
          className={cn(
            "inline-flex rounded-md border border-gray-300 overflow-hidden",
            fullWidth && "w-full",
            className,
          )}
          role="group"
          data-testid="button-control"
        >
          {options.map((option) => {
            const isActive = isActiveOption(value, option.value);
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium border-r last:border-r-0 transition-colors duration-150",
                  isActive
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => handleOptionClick(option.value)}
                data-testid={`button-group-option-${option.value}`}
              >
                {option.icon && (
                  <span className="inline-flex mr-1">{option.icon}</span>
                )}
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    // -----------------------------------------------------------------------
    // Split mode
    // -----------------------------------------------------------------------

    if (buttonType === "split") {
      return (
        <div
          ref={dropdownRef}
          className={cn("relative inline-flex", className)}
          data-testid="button-control"
        >
          {/* Main button */}
          <AICSmartButton
            variant={variant}
            size={size}
            icon={icon}
            label={displayLabel}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            className="rounded-r-none"
          />

          {/* Toggle button */}
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "inline-flex items-center justify-center px-2 border-l border-white/20 rounded-r-md transition-colors",
              "bg-primary text-white hover:bg-blue-600",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={toggleDropdown}
            data-testid="split-toggle"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              data-testid="split-dropdown"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  onClick={() => handleOptionClick(option.value)}
                  data-testid={`split-option-${option.value}`}
                >
                  {option.icon && (
                    <span className="inline-flex mr-2">{option.icon}</span>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  },
);

AICButtonControl.displayName = "AICButtonControl";
