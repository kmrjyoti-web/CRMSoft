// Travel Layout — Header component
import React from "react";
import { useLayout } from "../../../shared/hooks/useLayout";

export interface TravelHeaderProps {
  onOpenShortcuts?: () => void;
  title?: string;
}

export const TravelHeader: React.FC<TravelHeaderProps> = ({
  onOpenShortcuts,
  title = "Travel Management",
}) => {
  const toggleSidebar = useLayout((s) => s.toggleSidebar);

  return (
    <header className="travel-header">
      <div className="left-section">
        <div
          className="menu-toggle"
          onClick={toggleSidebar}
          role="button"
          aria-label="Toggle sidebar"
        >
          ☰
        </div>
        <span className="header-title">{title}</span>
      </div>

      <div className="right-section">
        <button
          className="header-btn"
          onClick={onOpenShortcuts}
          title="Shortcuts (Ctrl+Shift+K)"
        >
          ⌨
        </button>
        <button className="header-btn" title="Search">
          🔍
        </button>
        <button className="header-btn" title="Notifications">
          🔔
        </button>
        <div className="user-avatar">U</div>
      </div>
    </header>
  );
};

TravelHeader.displayName = "TravelHeader";
