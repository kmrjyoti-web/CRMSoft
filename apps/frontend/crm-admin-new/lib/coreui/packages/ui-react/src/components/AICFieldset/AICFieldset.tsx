/**
 * React AICFieldset component.
 * Grouping container with legend, collapsible, border variants.
 * Source: Angular fieldset in dynamic-field.component.ts
 */

import React, { useCallback, useState } from "react";
import { cn, GLOBAL_UI_CONFIG, getFieldsetContainerClass } from "@coreui/ui";
import type { FieldsetAppearance } from "@coreui/ui";

export interface FieldsetProps {
  label?: string;
  subtitle?: string;
  icon?: string;
  image?: string;
  appearance?: FieldsetAppearance;
  toggleable?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  onToggle?: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

export const AICFieldset = React.forwardRef<HTMLDivElement, FieldsetProps>(
  (props, ref) => {
    const {
      label,
      subtitle,
      icon,
      image,
      appearance = "legend",
      toggleable = false,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      className,
      onToggle,
      children,
    } = props;

    const isControlled = controlledCollapsed !== undefined;
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

    const toggle = useCallback(() => {
      if (!toggleable) return;
      const newVal = !isCollapsed;
      if (!isControlled) {
        setInternalCollapsed(newVal);
      }
      onToggle?.(newVal);
    }, [toggleable, isCollapsed, isControlled, onToggle]);

    const containerClass = getFieldsetContainerClass(
      appearance,
      GLOBAL_UI_CONFIG.fieldsetContainer,
    );

    const chevronSvg = (
      <svg
        className={cn(
          GLOBAL_UI_CONFIG.fieldsetToggleIcon,
          "w-5 h-5 transition-transform duration-200",
          !isCollapsed && "rotate-180",
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );

    return (
      <div
        className={cn(
          containerClass,
          toggleable && appearance === "panel" && "overflow-hidden",
          className,
        )}
        ref={ref}
        data-testid="fieldset"
      >
        {/* Panel appearance header */}
        {appearance === "panel" ? (
          <div
            className={cn(
              GLOBAL_UI_CONFIG.fieldsetHeader,
              toggleable && "cursor-pointer",
            )}
            onClick={toggle}
            data-testid="fieldset-header"
          >
            <div className="flex items-center gap-3">
              {image && (
                <img
                  src={image}
                  className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200"
                  alt=""
                />
              )}
              {icon && (
                <span className="text-[var(--color-border-focus)] w-5 h-5">
                  {icon}
                </span>
              )}
              <div className="flex flex-col">
                <span className={GLOBAL_UI_CONFIG.fieldsetLegend} data-testid="fieldset-legend">
                  {label}
                </span>
                {subtitle && (
                  <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
            {toggleable && (
              <button type="button" className="focus:outline-none" data-testid="fieldset-toggle">
                {chevronSvg}
              </button>
            )}
          </div>
        ) : (
          /* Legend appearance: floating legend */
          <div
            className={cn(
              "absolute -top-3 left-4 px-2 bg-white flex items-center gap-2 select-none z-10 transition-colors",
              toggleable && "cursor-pointer",
              toggleable && !isCollapsed && "text-[var(--color-border-focus)]",
              (!toggleable || isCollapsed) && "text-[var(--color-text)]",
            )}
            onClick={toggle}
            data-testid="fieldset-header"
          >
            {toggleable && (
              <div
                className={cn(
                  "border border-gray-200 rounded-full p-0.5 bg-gray-50 transition-transform duration-200",
                  !isCollapsed && "rotate-180",
                )}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
            {image && (
              <img
                src={image}
                className="w-6 h-6 rounded-full object-cover border border-gray-100 shadow-sm"
                alt=""
              />
            )}
            <span className="font-bold text-sm leading-none" data-testid="fieldset-legend">
              {label}
            </span>
          </div>
        )}

        {/* Content */}
        {!isCollapsed && (
          <div
            className={cn(
              GLOBAL_UI_CONFIG.fieldsetContent,
              appearance === "legend" && "pt-6",
            )}
            data-testid="fieldset-content"
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);

AICFieldset.displayName = "AICFieldset";
