// Source: Angular components/header/header.component.ts
import React, { useState } from "react";
import { useLayout } from "../../../shared/hooks/useLayout";

export interface MargHeaderProps {
  onOpenShortcuts?: () => void;
  storeName?: string;
  version?: string;
}

export const MargHeader: React.FC<MargHeaderProps> = ({
  onOpenShortcuts,
  storeName = "Demo Departmental Store (DEDEST)",
  version = "V 4.0.106",
}) => {
  const toggleSidebar = useLayout((s) => s.toggleSidebar);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="marg-header">
      <div className="left-section">
        <div
          className="menu-toggle"
          onClick={toggleSidebar}
          role="button"
          aria-label="Toggle sidebar"
        >
          ☰
        </div>

        <div className="store-info">
          <div className="store-name">
            <span>📁</span>
            <span>{storeName}</span>
          </div>
          <div className="status-info">
            <span className="status-content">
              <span>📶</span>
              <span className="speed-text">Online</span>
            </span>
            <div className="divider-v" style={{ width: 1, height: 12, background: "rgba(255,255,255,0.2)", margin: "0 6px" }} />
            <span style={{ opacity: 0.8 }}>{version}</span>
          </div>
        </div>
      </div>

      <div className="right-section">
        <button
          className="header-special-btn quick-action"
          onClick={onOpenShortcuts}
          title="Quick Action (Ctrl+K)"
        >
          ⚡
        </button>
        <button className="header-special-btn app-switch" title="My Apps">
          ▦
        </button>

        <div className="divider" />

        <div className="user-profile">👤</div>

        <div className="toolbar-actions">
          <div
            className="action-item more-actions-btn"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            ⋮
          </div>

          <div
            className={`collapsible-actions${isMobileMenuOpen ? " mobile-open" : ""}`}
          >
            <div className="action-item">
              <span className="icon">📥</span>
              <span>Pos Import</span>
            </div>
            <div className="action-item">
              <span className="icon">✉️</span>
              <span>Ticket</span>
            </div>
            <div className="action-item">
              <span className="icon">❓</span>
              <span>Help</span>
            </div>
            <div className="action-item">
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </div>
            <div className="action-item">
              <span className="icon">🕐</span>
              <span>History</span>
            </div>
          </div>

          <div className="always-visible-actions">
            <div className="action-item">
              <span className="icon">🔔</span>
              <span>Notification</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

MargHeader.displayName = "MargHeader";
