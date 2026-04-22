// Source: core/ui-kit/angular/src/lib/control-library/shared/directives/aic-ui.directives.ts

import React, { createContext, useContext } from "react";
import type { ResolvedControlConfig } from "@coreui/ui";
import { getIconSafe } from "@coreui/ui";

// ── Context ─────────────────────────────────────────────

const BaseControlContext = createContext<ResolvedControlConfig | null>(null);

/**
 * Read the resolved control config from the nearest AICContainer.
 * Throws if used outside a AICContainer.
 */
export function useBaseControlContext(): ResolvedControlConfig {
  const ctx = useContext(BaseControlContext);
  if (!ctx) {
    throw new Error(
      "AIC* components must be used within a <AICContainer>.",
    );
  }
  return ctx;
}

// ── AICContainer ──────────────────────────────────────

export interface AICContainerProps {
  config: ResolvedControlConfig;
  className?: string;
  children: React.ReactNode;
}

/**
 * Outer wrapper that provides BaseControlContext and applies
 * container class + size + variant + dt token styles.
 *
 * Angular equivalent: `[aicContainer]` directive.
 */
export const AICContainer: React.FC<AICContainerProps> = ({
  config,
  className,
  children,
}) => {
  return (
    <BaseControlContext.Provider value={config}>
      <div
        className={`${config.uiConfig.container} ${className ?? ""}`.trim()}
        style={
          Object.keys(config.tokenStyles).length > 0
            ? config.tokenStyles
            : undefined
        }
      >
        {children}
      </div>
    </BaseControlContext.Provider>
  );
};

AICContainer.displayName = "AICContainer";

// ── AICLabel ──────────────────────────────────────────

export interface AICLabelProps {
  htmlFor?: string;
  className?: string;
}

/**
 * Floating label with correct position based on variant/mode/active state.
 *
 * Angular equivalent: `[aicLabel]` directive.
 */
export const AICLabel: React.FC<AICLabelProps> = ({
  htmlFor,
  className,
}) => {
  const config = useBaseControlContext();

  // Base class by variant
  let base = config.uiConfig.label;
  if (config.variant === "filled") base = config.uiConfig.labelFilled;
  else if (config.variant === "outlined") base = config.uiConfig.labelOutlined;
  else if (config.variant === "standard") base = config.uiConfig.labelStandard;

  const sizeClass = config.sizeStyles.label;
  const errorClass =
    config.error && config.touched
      ? "text-danger peer-focus:text-danger"
      : "";
  const prefixClass = config.prefixIcon
    ? config.uiConfig.labelHasPrefix
    : "";

  // Floating position logic (matches Angular AICLabelDirective)
  let floatClass: string;
  if (config.variant === "outlined") {
    floatClass =
      "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-90 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-90";
  } else {
    floatClass =
      "peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-75 origin-[0]";
  }

  return (
    <label
      htmlFor={htmlFor ?? config.key}
      className={`${base} ${sizeClass} ${errorClass} ${prefixClass} ${floatClass} ${className ?? ""}`.trim()}
    >
      {config.label}
    </label>
  );
};

AICLabel.displayName = "AICLabel";

// ── AICPrefix ─────────────────────────────────────────

export interface AICPrefixProps {
  children?: React.ReactNode;
}

/**
 * Renders prefixIcon or custom children in the prefix position.
 *
 * Angular equivalent: icon prefix slot in control templates.
 */
export const AICPrefix: React.FC<AICPrefixProps> = ({ children }) => {
  const config = useBaseControlContext();

  if (!config.prefixIcon && !children) return null;

  const svg = config.prefixIcon ? getIconSafe(config.prefixIcon) : null;

  return (
    <span className={config.uiConfig.iconPrefixWrapper}>
      {children ??
        (svg ? (
          <span
            className={config.sizeStyles.icon}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : null)}
    </span>
  );
};

AICPrefix.displayName = "AICPrefix";

// ── AICSuffix ─────────────────────────────────────────

export interface AICSuffixProps {
  onAction?: (action: string) => void;
  children?: React.ReactNode;
}

/**
 * Renders suffixIcon with action (toggleVisibility, clear, search, calendar)
 * or custom children in the suffix position.
 *
 * Angular equivalent: icon suffix slot in control templates.
 */
export const AICSuffix: React.FC<AICSuffixProps> = ({
  onAction,
  children,
}) => {
  const config = useBaseControlContext();

  if (!config.suffixIcon && !config.suffixAction && !children) return null;

  // If a suffixAction is defined, render an interactive button
  if (config.suffixAction) {
    return (
      <span className={config.uiConfig.iconSuffixWrapper}>
        <button
          type="button"
          className="cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => onAction?.(config.suffixAction!)}
          aria-label={config.suffixAction}
        >
          {children ?? (
            <span className={config.sizeStyles.icon}>
              {getSuffixLabel(config.suffixAction)}
            </span>
          )}
        </button>
      </span>
    );
  }

  // Static suffix icon
  const svg = config.suffixIcon ? getIconSafe(config.suffixIcon) : null;

  return (
    <span className={config.uiConfig.iconSuffixWrapper}>
      {children ??
        (svg ? (
          <span
            className={config.sizeStyles.icon}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : null)}
    </span>
  );
};

AICSuffix.displayName = "AICSuffix";

function getSuffixLabel(action: string): string {
  switch (action) {
    case "clear":
      return "✕";
    case "toggleVisibility":
      return "👁";
    case "search":
      return "🔍";
    case "calendar":
      return "📅";
    default:
      return "";
  }
}

// ── AICLeft ───────────────────────────────────────────

export interface AICLeftProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Left-side slot wrapper.
 */
export const AICLeft: React.FC<AICLeftProps> = ({
  className,
  children,
}) => {
  const config = useBaseControlContext();

  return (
    <span
      className={`${config.uiConfig.iconPrefixWrapper} ${className ?? ""}`.trim()}
    >
      {children}
    </span>
  );
};

AICLeft.displayName = "AICLeft";

// ── AICRight ──────────────────────────────────────────

export interface AICRightProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Right-side slot wrapper.
 */
export const AICRight: React.FC<AICRightProps> = ({
  className,
  children,
}) => {
  const config = useBaseControlContext();

  return (
    <span
      className={`${config.uiConfig.iconSuffixWrapper} ${className ?? ""}`.trim()}
    >
      {children}
    </span>
  );
};

AICRight.displayName = "AICRight";

// ── AICError ──────────────────────────────────────────

export interface AICErrorProps {
  className?: string;
}

/**
 * Error message display. Only visible when error exists and field is touched.
 *
 * Angular equivalent: error message in control templates using `hasError()`.
 */
export const AICError: React.FC<AICErrorProps> = ({ className }) => {
  const config = useBaseControlContext();

  if (!config.error || !config.touched) return null;

  return (
    <p className={`${config.uiConfig.error} ${className ?? ""}`.trim()}>
      {config.error}
    </p>
  );
};

AICError.displayName = "AICError";
