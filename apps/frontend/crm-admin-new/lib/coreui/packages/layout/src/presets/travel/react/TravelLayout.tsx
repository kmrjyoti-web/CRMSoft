// Travel Layout — Main orchestrator component
import React, { useEffect, useState, useCallback } from "react";
import { useLayout } from "../../../shared/hooks/useLayout";
import { usePageLayout } from "../../../shared/hooks/usePageLayout";
import { useTravelLayout } from "../hooks/useTravelLayout";
import { useTravelShortcut } from "../hooks/useTravelShortcut";
import { useTravelTheme } from "../hooks/useTravelTheme";
import { TravelHeader } from "./TravelHeader";
import { TravelSidebar } from "./TravelSidebar";
import { TravelFooter } from "./TravelFooter";
import { TravelMenu } from "./TravelMenu";
import { TravelThemeCustomizer } from "./TravelThemeCustomizer";
import { TravelShortcuts } from "./TravelShortcuts";

export interface TravelLayoutProps {
  children?: React.ReactNode;
  onNavigate?: (link: string) => void;
}

export const TravelLayout: React.FC<TravelLayoutProps> = ({
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

  const travelInit = useTravelLayout((s) => s.init);
  const handleKey = useTravelShortcut((s) => s.handleKey);

  // Read theme for mesh / bg / zoom / menu position
  const theme = useTravelTheme((s) => s.theme);

  // Sync theme menuPosition → layout store
  useEffect(() => {
    setMenuPosition(theme.menuPosition);
  }, [theme.menuPosition, setMenuPosition]);

  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize layout service
  useEffect(() => {
    travelInit();
  }, [travelInit]);

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
  const wrapperCls = `travel-layout-wrapper${!isVertical ? " horizontal-layout" : ""}`;

  return (
    <div className={wrapperCls}>
      {/* Background Image Layer */}
      {theme.bgImage && (
        <div className="travel-bg-layer" />
      )}

      {/* Mesh Gradient Layer */}
      {theme.meshEnabled && (
        <div className="travel-mesh-gradient" />
      )}

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
          <TravelSidebar onNavigate={onNavigate} />
        </div>
      )}

      {/* Zoom Container wraps main content */}
      <div className="main-content-wrapper">
        <div className="travel-zoom-container">
          {/* Header */}
          {showMainHeader && (
            <div className="header-area">
              <TravelHeader
                onOpenShortcuts={() => setShowShortcuts(true)}
              />
            </div>
          )}

          {/* Horizontal Menu */}
          {!isVertical && (
            <div className="horizontal-menu-area">
              <TravelMenu onNavigate={onNavigate} />
            </div>
          )}

          {/* Main Content */}
          <main className="content-area">{children}</main>
        </div>
      </div>

      {/* Footer (Full Width) */}
      {showMainFooter && (
        <div className="footer-area">
          <TravelFooter />
        </div>
      )}

      {/* Theme Customizer */}
      <TravelThemeCustomizer />

      {/* Shortcut Modal */}
      {showShortcuts && (
        <TravelShortcuts onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};

TravelLayout.displayName = "TravelLayout";
