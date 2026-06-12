/**
 * React AICCheckboxGroup component.
 * Multiple checkboxes from options array with grid/list layout,
 * min/max selection, select all toggle, icons, images, descriptions.
 *
 * Source: Angular checkbox-group.component.ts
 */

import React, { useCallback, useEffect, useState } from "react";

import {
  cn,
  checkboxGroupReducer,
  initialCheckboxGroupState,
  toggleCheckboxValue,
  canDeselect,
  getGridColsClass,
} from "@coreui/ui";

import type {
  CheckboxGroupOption,
  CheckboxGroupVariant,
  CheckboxGroupInternalState,
  CheckboxGroupAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckboxGroupProps {
  value?: (string | number | boolean)[];
  defaultValue?: (string | number | boolean)[];
  options?: CheckboxGroupOption[];
  label?: string;
  variant?: CheckboxGroupVariant;
  cols?: number;
  maxHeight?: string;
  minSelection?: number;
  maxSelection?: number;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  onChange?: (values: (string | number | boolean)[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICCheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = [],
    options = [],
    label,
    variant = "grid",
    cols,
    maxHeight = "250px",
    minSelection,
    maxSelection,
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

  const [internalState, setInternalState] =
    useState<CheckboxGroupInternalState>(() => ({
      ...initialCheckboxGroupState,
      selectedValues: controlledValue ?? defaultValue,
    }));

  const dispatch = useCallback(
    (action: CheckboxGroupAction) => {
      setInternalState((prev) => {
        const next = checkboxGroupReducer(prev, action);
        if (
          action.type === "TOGGLE" ||
          action.type === "SELECT_ALL" ||
          action.type === "DESELECT_ALL"
        ) {
          onChange?.(next.selectedValues);
        }
        return next;
      });
    },
    [onChange],
  );

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      dispatch({ type: "SET_VALUES", values: controlledValue ?? [] });
    }
  }, [controlledValue, isControlled, dispatch]);

  const currentValues = isControlled
    ? (controlledValue ?? [])
    : internalState.selectedValues;

  const handleToggle = useCallback(
    (val: string | number | boolean) => {
      if (disabled) return;
      const isSelected = currentValues.includes(val);
      if (isSelected && !canDeselect(currentValues.length, minSelection)) {
        return;
      }
      dispatch({ type: "TOGGLE", value: val, maxSelection });
    },
    [disabled, currentValues, minSelection, maxSelection, dispatch],
  );

  const handleSelectAll = useCallback(() => {
    dispatch({ type: "SELECT_ALL", options, maxSelection });
  }, [dispatch, options, maxSelection]);

  const handleDeselectAll = useCallback(() => {
    if (minSelection && minSelection > 0) return;
    dispatch({ type: "DESELECT_ALL" });
  }, [dispatch, minSelection]);

  const isChecked = (val: string | number | boolean) =>
    currentValues.includes(val);

  const gridColsClass = getGridColsClass(cols);
  const isListVariant = variant === "list";

  // -----------------------------------------------------------------------
  // List variant
  // -----------------------------------------------------------------------

  const renderListVariant = () => (
    <div
      className="border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] shadow-sm flex flex-col w-full overflow-y-auto"
      style={{ maxHeight }}
      data-testid="checkbox-group-list"
    >
      {options.map((opt, index) => {
        const checked = isChecked(opt.value);
        const isLast = index === options.length - 1;

        return (
          <div
            key={String(opt.value)}
            className={cn(
              "flex items-center p-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors",
              !isLast && "border-b border-[var(--color-border)]/50",
              checked && "bg-[var(--color-border-focus)]/5",
              opt.disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !opt.disabled && handleToggle(opt.value)}
            data-testid={`checkbox-group-option-${opt.value}`}
          >
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="h-4 w-4 rounded border-[var(--color-border)] pointer-events-none"
                tabIndex={-1}
              />
            </div>
            <div className="ml-3 text-sm flex-1">
              <div className="flex items-center gap-2">
                {opt.icon && (
                  <span className="text-[var(--color-text-tertiary)] w-4 h-4">
                    {opt.icon}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium text-[var(--color-text)]",
                    checked && "text-[var(--color-border-focus)]",
                  )}
                >
                  {opt.label}
                </span>
              </div>
              {opt.description && (
                <p className="text-[var(--color-text-tertiary)] text-xs mt-0.5">
                  {opt.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {options.length === 0 && (
        <div className="p-4 text-center text-[var(--color-text-tertiary)] text-sm italic">
          No items available
        </div>
      )}
    </div>
  );

  // -----------------------------------------------------------------------
  // Grid/Card variant
  // -----------------------------------------------------------------------

  const renderGridVariant = () => (
    <div
      className={cn("grid gap-3", gridColsClass)}
      data-testid="checkbox-group-grid"
    >
      {options.map((opt) => {
        const checked = isChecked(opt.value);

        return (
          <div
            key={String(opt.value)}
            className={cn(
              "relative flex cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm focus:outline-none transition-all items-center",
              checked &&
                "border-[var(--color-border-focus)] ring-1 ring-[var(--color-border-focus)] bg-[var(--color-border-focus)]/5",
              "hover:border-[var(--color-text-tertiary)]",
              opt.disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !opt.disabled && handleToggle(opt.value)}
            data-testid={`checkbox-group-option-${opt.value}`}
          >
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="h-4 w-4 rounded border-[var(--color-border)] pointer-events-none"
                tabIndex={-1}
              />
            </div>

            {opt.icon && (
              <div
                className={cn(
                  "flex-shrink-0 ml-3 text-[var(--color-text-tertiary)]",
                  checked && "text-[var(--color-border-focus)]",
                )}
                data-testid={`checkbox-group-icon-${opt.value}`}
              >
                <span className="w-5 h-5">{opt.icon}</span>
              </div>
            )}

            {opt.image && (
              <img
                src={opt.image}
                alt=""
                className="flex-shrink-0 w-10 h-10 rounded-md object-cover ml-3"
              />
            )}

            <div className="flex flex-1 flex-col ml-3">
              <span
                className={cn(
                  "block text-sm font-medium text-[var(--color-text)]",
                  checked && "text-[var(--color-border-focus)]",
                )}
              >
                {opt.label}
              </span>
              {opt.description && (
                <span
                  className="mt-0.5 flex items-center text-xs text-[var(--color-text-tertiary)]"
                  data-testid={`checkbox-group-description-${opt.value}`}
                >
                  {opt.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className={cn("relative mb-3", className)}
      ref={ref}
      role="group"
      aria-label={ariaLabel ?? label ?? "AICCheckbox group"}
    >
      {/* Label + AICSelect All */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            className={cn(
              "block text-sm font-medium text-[var(--color-text-secondary)]",
              required &&
                "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]",
            )}
          >
            {label}
          </label>
          {options.length > 1 && !disabled && (
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className="text-[var(--color-border-focus)] hover:underline font-medium"
                onClick={handleSelectAll}
                data-testid="checkbox-group-select-all"
              >
                AICSelect All
              </button>
              <button
                type="button"
                className="text-[var(--color-text-tertiary)] hover:underline font-medium"
                onClick={handleDeselectAll}
                data-testid="checkbox-group-deselect-all"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {name &&
        currentValues.map((val) => (
          <input
            key={String(val)}
            type="hidden"
            name={name}
            value={String(val)}
          />
        ))}

      {isListVariant ? renderListVariant() : renderGridVariant()}

      {error && errorMessage && (
        <div className="text-xs text-[var(--color-danger)] mt-0.5" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

AICCheckboxGroup.displayName = "AICCheckboxGroup";
