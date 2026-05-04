// Travel Layout — Glassmorphism sidebar component
import React, { useState, useMemo, useCallback } from "react";
import { useLayout } from "../../../shared/hooks/useLayout";
import { useTravelLayout } from "../hooks/useTravelLayout";
import type { MenuItem } from "../core/travel.types";

export interface TravelSidebarProps {
  onNavigate?: (link: string) => void;
}

export const TravelSidebar: React.FC<TravelSidebarProps> = ({ onNavigate }) => {
  const isSidebarClosed = useLayout((s) => s.isSidebarClosed);
  const menuItems = useTravelLayout((s) => s.menuItems);
  const filterMenuItems = useTravelLayout((s) => s.filterMenuItems);
  const toggleItem = useTravelLayout((s) => s.toggleItem);
  const setActiveItem = useTravelLayout((s) => s.setActiveItem);

  const [isHovered, setHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const filteredItems = useMemo(
    () => filterMenuItems(searchText),
    [filterMenuItems, searchText],
  );

  // Flatten visible items for keyboard nav
  const flatVisibleItems = useMemo(() => {
    const flatten = (items: MenuItem[]): MenuItem[] => {
      const out: MenuItem[] = [];
      for (const item of items) {
        out.push(item);
        if (item.expanded && item.subItems?.length) {
          out.push(...flatten(item.subItems));
        }
      }
      return out;
    };
    return flatten(filteredItems);
  }, [filteredItems]);

  const focusedItem = focusedIndex >= 0 && focusedIndex < flatVisibleItems.length
    ? flatVisibleItems[focusedIndex]
    : null;

  const handleSearchKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!flatVisibleItems.length) return;

      if (e.key === "ArrowDown") {
        setFocusedIndex((i) => Math.min(i + 1, flatVisibleItems.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setFocusedIndex((i) => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter" && focusedItem) {
        handleItemClick(focusedItem);
        e.preventDefault();
      }
    },
    [flatVisibleItems, focusedItem],
  );

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.hasSub) {
        toggleItem(item);
      } else if (item.link) {
        setActiveItem(item.link);
        onNavigate?.(item.link);
      }
    },
    [toggleItem, setActiveItem, onNavigate],
  );

  const handleSubItemClick = useCallback(
    (item: MenuItem, e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.hasSub) {
        toggleItem(item);
        return;
      }
      if (item.link) {
        setActiveItem(item.link);
        onNavigate?.(item.link);
      }
    },
    [toggleItem, setActiveItem, onNavigate],
  );

  const showFull = !isSidebarClosed || isHovered;

  const wrapperCls = [
    "travel-sidebar-wrapper",
    isSidebarClosed && !isHovered ? "collapsed" : "",
    isSidebarClosed && isHovered ? "hover-expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={wrapperCls}
      onMouseEnter={() => {
        if (isSidebarClosed) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className="logo-area">
        <div className="logo-icon">T</div>
        {showFull && <span className="logo-text">TravelDesk</span>}
      </div>

      {/* Sidebar Content */}
      <div className="sidebar-content">
        {/* Search */}
        <div className="search-area">
          <div className="search-input-wrapper">
            {showFull && (
              <input
                type="text"
                placeholder="Search menu..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setFocusedIndex(-1);
                }}
                onKeyDown={handleSearchKeydown}
              />
            )}
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Menu List */}
        <ul className="menu-list">
          {filteredItems.map((item, i) => (
            <li
              key={i}
              className={[
                item.active ? "active" : "",
                item.expanded ? "expanded" : "",
                focusedItem === item ? "focused" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="menu-item" onClick={() => handleItemClick(item)}>
                <span className="menu-icon">●</span>
                {showFull && <span className="menu-text">{item.label}</span>}
                {item.hasSub && showFull && (
                  <span
                    className={`arrow-icon${item.expanded ? " rotated" : ""}`}
                  >
                    ›
                  </span>
                )}
              </div>

              {/* Sub Menu */}
              {item.hasSub && item.expanded && showFull && item.subItems && (
                <ul className="sub-menu-list">
                  {item.subItems.map((sub, j) => (
                    <li
                      key={j}
                      className={`sub-menu-item${focusedItem === sub ? " focused" : ""}`}
                    >
                      <div
                        className="sub-menu-row"
                        onClick={(e) => handleSubItemClick(sub, e)}
                      >
                        <span className="sub-menu-text">{sub.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* User Support */}
      <div className="user-support">
        <div className="avatar-circle">
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--travel-accent, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              borderRadius: "50%",
            }}
          >
            U
          </div>
        </div>
      </div>
    </div>
  );
};

TravelSidebar.displayName = "TravelSidebar";
