/**
 * React AICInputmask component.
 * AICInput with mask patterns (phone, date, credit card, custom).
 *
 * Source: Angular aic-inputmask.component.ts
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  cn,
  aicInputmaskSizeStyles,
  aicInputmaskVariantStyles,
  aicInputmaskShapeStyles,
  aicInputmaskStateStyles,
  aicInputmaskReducer,
  initialAICInputmaskState,
  resolveAICInputmaskState,
  resolveInputmaskPlaceholder,
  normalizeInput,
} from "@coreui/ui";

import type {
  AICInputmaskType,
  AICInputmaskVariant,
  AICInputmaskSize,
  AICInputmaskShape,
  AICInputmaskInternalState,
  AICInputmaskAction,
  AICInputmaskReducerConfig,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AICInputmaskProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  maskType?: AICInputmaskType;
  customMask?: string;
  regexPattern?: string;
  maxLength?: number;
  emitUnmaskedValue?: boolean;
  slotChar?: string;
  showSlots?: boolean;
  variant?: AICInputmaskVariant;
  size?: AICInputmaskSize;
  shape?: AICInputmaskShape;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  ariaLabel?: string;
  /** Value change handler providing the string value (masked or unmasked). */
  onChange?: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICInputmask = React.forwardRef<
  HTMLInputElement,
  AICInputmaskProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = "",
    label = "AICInput Mask",
    placeholder,
    maskType = "phone",
    customMask = "999-999",
    regexPattern = "[0-9]",
    maxLength,
    emitUnmaskedValue = false,
    slotChar = "_",
    showSlots = false,
    variant = "outlined",
    size = "md",
    shape = "rounded",
    required = false,
    disabled = false,
    readOnly = false,
    error = false,
    errorMessage,
    ariaLabel,
    className,
    id,
    name,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;

  const reducerConfig: AICInputmaskReducerConfig = {
    maskType,
    customMask,
    regexPattern,
    maxLength,
    emitUnmaskedValue,
    slotChar,
    showSlots,
  };

  // Internal state
  const [internalState, setInternalState] =
    useState<AICInputmaskInternalState>(() => {
      const initial = controlledValue ?? defaultValue;
      if (initial) {
        const result = normalizeInput(initial, reducerConfig);
        return {
          ...initialAICInputmaskState,
          rawValue: result.raw,
          displayValue: result.display,
        };
      }
      return { ...initialAICInputmaskState };
    });

  const dispatch = useCallback(
    (action: AICInputmaskAction) => {
      setInternalState((prev) => {
        const next = aicInputmaskReducer(prev, action, reducerConfig);
        // Notify parent on value changes
        if (
          (next.rawValue !== prev.rawValue ||
            next.displayValue !== prev.displayValue) &&
          action.type !== "FOCUS" &&
          action.type !== "BLUR"
        ) {
          const emitted = emitUnmaskedValue
            ? next.rawValue
            : next.displayValue;
          onChange?.(emitted);
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maskType, customMask, regexPattern, maxLength, emitUnmaskedValue, slotChar, showSlots, onChange],
  );

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      const result = normalizeInput(controlledValue || "", reducerConfig);
      setInternalState((prev) => ({
        ...prev,
        rawValue: result.raw,
        displayValue: result.display,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue, isControlled, maskType, customMask, regexPattern, maxLength, showSlots, slotChar]);

  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

  // Derived state
  const visualState = resolveAICInputmaskState(
    { disabled, readOnly, error },
    internalState,
  );

  const resolvedPlaceholder = resolveInputmaskPlaceholder(
    placeholder,
    maskType,
    customMask,
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      dispatch({ type: "INPUT", rawInput: raw });

      // Correct cursor position after mask application
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const currentDisplay = inputRef.current.value;
          // Find the position after the last filled character
          let cursorPos = currentDisplay.length;
          if (showSlots && slotChar) {
            const firstSlotIndex = currentDisplay.indexOf(slotChar);
            if (firstSlotIndex >= 0) {
              cursorPos = firstSlotIndex;
            }
          }
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      });
    },
    [dispatch, inputRef, showSlots, slotChar],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      dispatch({ type: "FOCUS" });
      onFocus?.(e);
    },
    [dispatch, onFocus],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      dispatch({ type: "BLUR" });
      onBlur?.(e);
    },
    [dispatch, onBlur],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
    },
    [onKeyDown],
  );

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerClasses = cn(
    "flex w-full items-center gap-1 px-3 text-[var(--color-text)] transition-colors",
    aicInputmaskVariantStyles[variant],
    aicInputmaskSizeStyles[size],
    shapeStylesHelper(variant, shape),
    aicInputmaskStateStyles[visualState],
    className,
  );

  const inputClasses =
    "flex-1 bg-transparent outline-none border-none min-w-0 text-inherit placeholder:text-[var(--color-text-tertiary)] tracking-wider font-mono";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const inputPlaceholder = label?.trim() ? " " : resolvedPlaceholder;

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-[var(--color-text-secondary)]",
            required &&
              "after:content-['*'] after:ml-0.5 after:text-[var(--color-danger)]",
          )}
        >
          {label}
        </label>
      )}

      {/* AICInput container */}
      <div className={containerClasses} data-testid="aic-inputmask-container">
        <input
          ref={inputRef}
          type="text"
          inputMode={isNumericMask(maskType) ? "numeric" : "text"}
          id={id}
          name={name}
          value={internalState.displayValue}
          placeholder={inputPlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={ariaLabel ?? label}
          aria-invalid={error || undefined}
          aria-describedby={
            error && errorMessage && id ? `${id}-error` : undefined
          }
          data-testid="aic-inputmask-input"
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && errorMessage && (
        <span
          id={id ? `${id}-error` : undefined}
          className="text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
});

AICInputmask.displayName = "AICInputmask";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shapeStylesHelper(
  variant: AICInputmaskVariant,
  shape: AICInputmaskShape,
): string {
  if (variant === "standard") return "";
  return aicInputmaskShapeStyles[shape];
}

function isNumericMask(maskType: AICInputmaskType): boolean {
  return ["phone", "date", "time", "card", "cvv", "aadhaar"].includes(
    maskType,
  );
}
