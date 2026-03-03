// Source: Angular marg-layout.component.ts
import React, { useEffect, useState, useCallback } from "react";
import { useLayout } from "../../../shared/hooks/useLayout";
import { usePageLayout } from "../../../shared/hooks/usePageLayout";
import { useMargLayout } from "../hooks/useMargLayout";
import { useMargShortcut } from "../hooks/useMargShortcut";
import { useMargTheme } from "../hooks/useMargTheme";
import { MargHeader } from "./MargHeader";
import { MargSidebar } from "./MargSidebar";
import { MargFooter } from "./MargFooter";
import { MargMenu } from "./MargMenu";
import { MargThemeCustomizer } from "./MargThemeCustomizer";
import { MargShortcuts } from "./MargShortcuts";

export interface MargLayoutProps {
  children?: React.ReactNode;
  onNavigate?: (link: string) => void;
}

export const MargLayout: React.FC<MargLayoutProps> = ({
  children,
  onNavigate,
}) => {
  const isSidebarClosed = useLayout((s) => s.isSidebarClosed);
  const menuPosition = useLayout((s) => s.menuPosition);
  const toggleSidebar = useLayout((s) => s.toggleSidebar);
  const setMenuPosition = useLayout((s) => s.setMenuPosition);

  const showMainHeader = usePageLayout((s) => s.showMainHeader);
  const showMainSidebar = usePageLayout((s) => s.showMainSidebar);
  const showMainFooter = usePageLayout((s) => s.showMainFooter);

  const margInit = useMargLayout((s) => s.init);
  const handleKey = useMargShortcut((s) => s.handleKey);

  // Sync theme menuPosition → layout store
  const themeMenuPosition = useMargTheme((s) => s.theme.menuPosition);
  useEffect(() => {
    setMenuPosition(themeMenuPosition);
  }, [themeMenuPosition, setMenuPosition]);

  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize layout service
  useEffect(() => {
    margInit();
  }, [margInit]);

  // Global keyboard handler
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Ctrl+Shift+K opens shortcuts modal
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }
      handleKey(event);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const handleBackdropClick = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const isVertical = menuPosition === "vertical";
  const wrapperCls = `marg-layout-wrapper${!isVertical ? " horizontal-layout" : ""}`;

  return (
    <div className={wrapperCls}>
      {/* Mobile Sidebar Backdrop */}
      {!isSidebarClosed && isVertical && (
        <div
          className="mobile-sidebar-backdrop"
          data-testid="sidebar-backdrop"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar (Vertical) */}
      {showMainSidebar && isVertical && (
        <div
          className={`sidebar-area${isSidebarClosed ? " collapsed" : ""}`}
        >
          <MargSidebar onNavigate={onNavigate} />
        </div>
      )}

      <div className="main-content-wrapper">
        {/* Header */}
        {showMainHeader && (
          <div className="header-area">
            <MargHeader
              onOpenShortcuts={() => setShowShortcuts(true)}
            />
          </div>
        )}

        {/* Horizontal Menu */}
        {!isVertical && (
          <div className="horizontal-menu-area">
            <MargMenu onNavigate={onNavigate} />
          </div>
        )}

        {/* Main Content */}
        <main className="content-area">{children}</main>
      </div>

      {/* Footer (Full Width) */}
      {showMainFooter && (
        <div className="footer-area">
          <MargFooter />
        </div>
      )}

      {/* Theme Customizer */}
      <MargThemeCustomizer />

      {/* Shortcut Modal */}
      {showShortcuts && (
        <MargShortcuts onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};

MargLayout.displayName = "MargLayout";
