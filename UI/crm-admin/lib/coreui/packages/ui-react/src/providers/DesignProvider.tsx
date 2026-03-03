/**
 * DesignProvider — wraps the app with theme, density, and toast support.
 * Provides context for useTheme, useDensity, and useLayout hooks.
 */

import React, { createContext, useContext, useState, useMemo } from "react";
import { AICToastProvider, AICToastContainer } from "../components/AICToast";
import type { ToastConfig, ToastPosition } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark" | "high-contrast";
export type Density = "compact" | "comfortable" | "spacious";
export type LayoutDirection = "ltr" | "rtl";

export interface DesignProviderProps {
  /** Active theme. */
  theme?: Theme;
  /** UI density level. */
  density?: Density;
  /** Text direction. */
  direction?: LayoutDirection;
  /** Toast system configuration. */
  toastConfig?: ToastConfig;
  /** Position for the toast container. */
  toastPosition?: ToastPosition;
  /** Provider content. */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Context values
// ---------------------------------------------------------------------------

export interface ThemeContextValue {
  /** Current theme. */
  theme: Theme;
  /** Update the active theme. */
  setTheme: (theme: Theme) => void;
  /** Whether the current theme is dark-based. */
  isDark: boolean;
}

export interface DensityContextValue {
  /** Current density. */
  density: Density;
  /** Update the active density. */
  setDensity: (density: Density) => void;
}

export interface LayoutContextValue {
  /** Text direction. */
  direction: LayoutDirection;
  /** Update the text direction. */
  setDirection: (dir: LayoutDirection) => void;
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);
const DensityContext = createContext<DensityContextValue | null>(null);
const LayoutContext = createContext<LayoutContextValue | null>(null);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DesignProvider: React.FC<DesignProviderProps> = ({
  theme: initialTheme = "light",
  density: initialDensity = "comfortable",
  direction: initialDirection = "ltr",
  toastConfig,
  toastPosition = "top-right",
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [density, setDensity] = useState<Density>(initialDensity);
  const [direction, setDirection] = useState<LayoutDirection>(initialDirection);

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      isDark: theme === "dark",
    }),
    [theme],
  );

  const densityValue = useMemo<DensityContextValue>(
    () => ({
      density,
      setDensity,
    }),
    [density],
  );

  const layoutValue = useMemo<LayoutContextValue>(
    () => ({
      direction,
      setDirection,
    }),
    [direction],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <DensityContext.Provider value={densityValue}>
        <LayoutContext.Provider value={layoutValue}>
          <div
            data-theme={theme === "light" ? undefined : theme}
            data-density={density === "comfortable" ? undefined : density}
            dir={direction}
            className="min-h-full"
          >
            <AICToastProvider config={toastConfig}>
              {children}
              <AICToastContainer position={toastPosition} />
            </AICToastProvider>
          </div>
        </LayoutContext.Provider>
      </DensityContext.Provider>
    </ThemeContext.Provider>
  );
};

DesignProvider.displayName = "DesignProvider";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the current theme and a setter to change it.
 * Must be used inside a `<DesignProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <DesignProvider>.");
  }
  return ctx;
}

/**
 * Returns the current density and a setter to change it.
 * Must be used inside a `<DesignProvider>`.
 */
export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext);
  if (!ctx) {
    throw new Error("useDensity must be used within a <DesignProvider>.");
  }
  return ctx;
}

/**
 * Returns the current layout direction and a setter to change it.
 * Must be used inside a `<DesignProvider>`.
 */
export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout must be used within a <DesignProvider>.");
  }
  return ctx;
}
