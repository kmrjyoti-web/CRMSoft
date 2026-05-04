// Travel Layout — Horizontal menu component
import React from "react";
import type { MenuItem } from "../core/travel.types";
import { useTravelLayout } from "../hooks/useTravelLayout";

export interface TravelMenuProps {
  onNavigate?: (link: string) => void;
}

export const TravelMenu: React.FC<TravelMenuProps> = ({ onNavigate }) => {
  const menuItems = useTravelLayout((s) => s.menuItems);

  const handleSubClick = (sub: MenuItem) => {
    if (sub.link && onNavigate) {
      onNavigate(sub.link);
    }
  };

  return (
    <div className="travel-horizontal-menu-wrapper">
      <nav className="travel-horizontal-menu">
        <ul className="menu-list">
          {menuItems.map((item, i) => (
            <li
              key={i}
              className={`h-menu-item${item.active ? " active" : ""}`}
            >
              <div className="item-content">
                <span>{item.label}</span>
                {item.hasSub && (
                  <span style={{ fontSize: 12 }}>▾</span>
                )}
              </div>

              {item.hasSub && item.subItems && (
                <ul className="submenu">
                  {item.subItems.map((sub, j) => (
                    <li
                      key={j}
                      className="submenu-item"
                      onClick={() => handleSubClick(sub)}
                    >
                      <span>{sub.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

TravelMenu.displayName = "TravelMenu";
