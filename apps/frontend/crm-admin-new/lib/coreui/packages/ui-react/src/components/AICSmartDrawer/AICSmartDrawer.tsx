/**
 * React AICDrawer component.
 * Slide-in panel with multiple modes (drawer / modal), positions,
 * minimize/maximize states, header action buttons, and footer actions.
 *
 * Source: Angular aic-drawer.component.ts
 */

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  cn,
  getDrawerContainerClasses,
  getDrawerContainerStyles,
} from "@coreui/ui";

import type {
  AICDrawerConfig,
  AICDrawerProps as CoreAICDrawerProps,
  AICDrawerButton,
  AICDrawerMode,
  AICDrawerHeaderButton,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props (extends core with React-specific children)
// ---------------------------------------------------------------------------

export interface AICSmartDrawerProps extends CoreAICDrawerProps {
  /** Content rendered inside the drawer body. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

const CloseIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MinimizeIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
  </svg>
);

const MaximizeIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const RestoreIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="7" width="14" height="14" rx="2" />
    <path d="M9 3h10a2 2 0 0 1 2 2v10" />
  </svg>
);

const NewTabIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ToggleModeIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// ---------------------------------------------------------------------------
// Skeleton loader for loading state
// ---------------------------------------------------------------------------

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse" data-testid="aic-drawer-skeleton">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-32 bg-gray-200 rounded w-full" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AICSmartDrawer: React.FC<AICSmartDrawerProps> = (props) => {
  const {
    isOpen,
    config = {},
    title: titleProp,
    onClose,
    onFooterAction,
    className,
    children,
  } = props;

  // Merge config with prop-level overrides
  const {
    mode: initialMode = "drawer",
    title: configTitle,
    icon,
    width,
    height,
    position = "right",
    isLoading = false,
    hasBackdrop = true,
    showClose = true,
    showMinimize = false,
    showMaximize = false,
    showNewTab = false,
    headerIconButtons = [],
    footerButtons = [],
  } = config;

  const resolvedTitle = titleProp || configTitle;

  // -----------------------------------------------------------------------
  // Internal state
  // -----------------------------------------------------------------------

  const [mode, setMode] = useState<AICDrawerMode>(initialMode);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Reset state when the drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
      setIsMinimized(false);
      setIsPreviewing(false);
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // -----------------------------------------------------------------------
  // Keyboard: Escape to close
  // -----------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // -----------------------------------------------------------------------
  // Backdrop click
  // -----------------------------------------------------------------------

  const handleBackdropClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // -----------------------------------------------------------------------
  // Header button actions
  // -----------------------------------------------------------------------

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === "drawer" ? "modal" : "drawer"));
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
    setIsMaximized(false);
    setIsPreviewing(false);
  }, []);

  const handleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
    setIsMinimized(false);
    setIsPreviewing(false);
  }, []);

  const handleMouseEnterMinimized = useCallback(() => {
    if (isMinimized) {
      setIsPreviewing(true);
    }
  }, [isMinimized]);

  const handleMouseLeaveMinimized = useCallback(() => {
    setIsPreviewing(false);
  }, []);

  // -----------------------------------------------------------------------
  // Footer button handler
  // -----------------------------------------------------------------------

  const handleFooterButton = useCallback(
    (btn: AICDrawerButton) => {
      if (typeof btn.action === "function") {
        btn.action();
      } else if (typeof btn.action === "string") {
        onFooterAction?.(btn.action);
      }
    },
    [onFooterAction],
  );

  // -----------------------------------------------------------------------
  // Header icon button handler
  // -----------------------------------------------------------------------

  const handleHeaderIconButton = useCallback(
    (action: string | (() => void) | undefined) => {
      if (typeof action === "function") {
        action();
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Compute position classes and styles
  // -----------------------------------------------------------------------

  const containerClasses = getDrawerContainerClasses({
    mode,
    position,
    isMaximized,
    isMinimized,
    isPreviewing,
  });

  const containerStyles = getDrawerContainerStyles({
    mode,
    position,
    isMaximized,
    isMinimized,
    isPreviewing,
    width,
    height,
  });

  // -----------------------------------------------------------------------
  // Footer button variant classes
  // -----------------------------------------------------------------------

  const getFooterButtonClasses = (btn: AICDrawerButton): string => {
    const base =
      "px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variantMap: Record<string, string> = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary:
        "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    };
    return cn(
      base,
      variantMap[btn.variant || "secondary"],
      btn.class,
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (!isOpen) return null;

  const showBackdrop = hasBackdrop && mode === "modal" && !isMinimized;

  const drawer = (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      data-testid="aic-drawer-root"
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-200"
          onClick={handleBackdropClick}
          aria-hidden="true"
          data-testid="aic-drawer-backdrop"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed flex flex-col bg-white shadow-2xl pointer-events-auto overflow-hidden",
          "transition-all duration-300 ease-in-out",
          "border border-gray-200",
          containerClasses,
          className,
        )}
        style={containerStyles}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitle ? "aic-drawer-title" : undefined}
        data-testid="aic-drawer-panel"
        onMouseEnter={handleMouseEnterMinimized}
        onMouseLeave={handleMouseLeaveMinimized}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 shrink-0",
            isMinimized && !isPreviewing ? "h-14" : "h-14 border-b border-gray-200",
          )}
          data-testid="aic-drawer-header"
        >
          {/* Icon */}
          {icon && (
            <span className="text-gray-500 text-lg" data-testid="aic-drawer-icon">
              {icon}
            </span>
          )}

          {/* Title */}
          <h2
            id="aic-drawer-title"
            className="flex-1 text-sm font-semibold text-gray-900 truncate"
            data-testid="aic-drawer-title"
          >
            {resolvedTitle}
          </h2>

          {/* Mode badge */}
          <span
            className="text-[10px] uppercase tracking-wider text-gray-400 font-medium px-1.5 py-0.5 rounded bg-gray-100"
            data-testid="aic-drawer-mode-badge"
          >
            {mode}
          </span>

          {/* Header icon buttons */}
          {headerIconButtons.map((btn: AICDrawerHeaderButton, i: number) => (
            <button
              key={i}
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              onClick={() => handleHeaderIconButton(btn.action)}
              title={btn.title}
              data-testid={`aic-drawer-header-btn-${i}`}
            >
              <span className="text-sm">{btn.icon}</span>
            </button>
          ))}

          {/* Toggle mode */}
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            onClick={handleToggleMode}
            title="Toggle mode"
            data-testid="aic-drawer-toggle-mode"
          >
            <ToggleModeIcon />
          </button>

          {/* New tab */}
          {showNewTab && (
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              onClick={() => {
                /* open current page in new tab */
              }}
              title="Open in new tab"
              data-testid="aic-drawer-new-tab"
            >
              <NewTabIcon />
            </button>
          )}

          {/* Minimize */}
          {showMinimize && (
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              onClick={handleMinimize}
              title={isMinimized ? "Restore" : "Minimize"}
              data-testid="aic-drawer-minimize"
            >
              <MinimizeIcon />
            </button>
          )}

          {/* Maximize */}
          {showMaximize && (
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
              data-testid="aic-drawer-maximize"
            >
              {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
            </button>
          )}

          {/* Close */}
          {showClose && (
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close drawer"
              data-testid="aic-drawer-close"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        {!(isMinimized && !isPreviewing) && (
          <div
            className="flex-1 overflow-y-auto p-4"
            data-testid="aic-drawer-body"
          >
            {isLoading ? <SkeletonLoader /> : children}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────── */}
        {footerButtons.length > 0 && !(isMinimized && !isPreviewing) && (
          <div
            className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 shrink-0"
            data-testid="aic-drawer-footer"
          >
            {footerButtons.map((btn: AICDrawerButton, i: number) => (
              <button
                key={i}
                type="button"
                className={getFooterButtonClasses(btn)}
                onClick={() => handleFooterButton(btn)}
                disabled={btn.disabled}
                data-testid={`aic-drawer-footer-btn-${i}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
};

AICSmartDrawer.displayName = "AICSmartDrawer";
