// Source: Angular components/menu/menu.component.ts
import React from "react";
import type { MenuItem } from "../core/marg.types";
import { useMargLayout } from "../hooks/useMargLayout";

export interface MargMenuProps {
  onNavigate?: (link: string) => void;
}

export const MargMenu: React.FC<MargMenuProps> = ({ onNavigate }) => {
  const menuItems = useMargLayout((s) => s.menuItems);

  const handleSubClick = (sub: MenuItem) => {
    if (sub.link && onNavigate) {
      onNavigate(sub.link);
    }
  };

  return (
    <div className="marg-horizontal-menu-wrapper">
      <nav className="marg-horizontal-menu">
        <ul className="menu-list">
          {menuItems.map((item, i) => (
            <li
              key={i}
              className={`h-menu-item${item.active ? " active" : ""}`}
            >
              <div className="item-content">
                <span>{item.label}</span>
                {item.hasSub && (
                  <span className="arrow" style={{ fontSize: 12 }}>
                    ▾
                  </span>
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

MargMenu.displayName = "MargMenu";
