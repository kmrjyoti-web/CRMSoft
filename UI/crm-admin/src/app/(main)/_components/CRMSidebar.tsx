"use client";

import { useState, useMemo, useCallback } from "react";

import { Icon, ICON_MAP, useLayout, useMargLayout } from "@/components/ui";

import type { IconName, MenuItem } from "@/components/ui";

// ── Icon with fallback ──────────────────────────────────

function MenuIcon({ name, size = 18 }: { name: string; size?: number }) {
  if (name && name in ICON_MAP) {
    return <Icon name={name as IconName} size={size} />;
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 8,
      }}
    >
      ●
    </span>
  );
}

// ── Props ────────────────────────────────────────────────

interface CRMSidebarProps {
  onNavigate?: (link: string) => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

// ── Component ────────────────────────────────────────────

export function CRMSidebar({
  onNavigate,
  userName,
  userRole,
  onLogout,
}: CRMSidebarProps) {
  const isSidebarClosed = useLayout((s) => s.isSidebarClosed);
  const menuItems = useMargLayout((s) => s.menuItems);
  const filterMenuItems = useMargLayout((s) => s.filterMenuItems);
  const toggleItem = useMargLayout((s) => s.toggleItem);
  const setActiveItem = useMargLayout((s) => s.setActiveItem);

  const [isHovered, setHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const filteredItems = useMemo(
    () => filterMenuItems(searchText),
    [filterMenuItems, searchText, menuItems],
  );

  // Flatten visible items for keyboard navigation
  const flatVisibleItems = useMemo(() => {
    const flatten = (items: MenuItem[]): MenuItem[] => {
      const out: MenuItem[] = [];
      for (const item of items) {
        if (item.label === "__DIVIDER__" || item.label.startsWith("__TITLE__")) continue;
        out.push(item);
        if (item.expanded && item.subItems?.length) {
          out.push(...flatten(item.subItems));
        }
      }
      return out;
    };
    return flatten(filteredItems);
  }, [filteredItems]);

  const focusedItem =
    focusedIndex >= 0 && focusedIndex < flatVisibleItems.length
      ? flatVisibleItems[focusedIndex]
      : null;

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
    [flatVisibleItems, focusedItem, handleItemClick],
  );

  const showFull = !isSidebarClosed || isHovered;

  const wrapperCls = [
    "marg-sidebar-wrapper",
    isSidebarClosed && !isHovered ? "collapsed" : "",
    isSidebarClosed && isHovered ? "hover-expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

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
        <span
          style={{
            fontWeight: 700,
            fontSize: showFull ? 18 : 16,
            color: "#ff9d2b",
            letterSpacing: 0.5,
          }}
        >
          CRM
        </span>
        {showFull && (
          <span
            style={{
              fontWeight: 500,
              fontSize: 12,
              color: "#ffffff",
              marginLeft: 3,
            }}
          >
            SOFT
          </span>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="sidebar-content">
        {/* Search */}
        <div className="search-area">
          <div className="search-input-wrapper">
            {showFull && (
              <input
                type="text"
                placeholder="Type to search"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setFocusedIndex(-1);
                }}
                onKeyDown={handleSearchKeydown}
              />
            )}
            <span className="search-icon">
              <Icon name="search" size={14} />
            </span>
          </div>
        </div>

        {/* Menu List */}
        <ul className="menu-list">
          {filteredItems.map((item, i) =>
            item.label === "__DIVIDER__" ? (
              <li key={`divider-${i}`} className="menu-divider">
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    margin: "6px 16px",
                  }}
                />
              </li>
            ) : item.label.startsWith("__TITLE__") ? (
              <li key={`title-${i}`} style={{ padding: "12px 16px 4px" }}>
                {showFull && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {item.label.replace("__TITLE__", "")}
                  </span>
                )}
              </li>
            ) : (
            <li
              key={item.label + i}
              className={[
                item.active ? "active" : "",
                item.expanded ? "expanded" : "",
                focusedItem === item ? "focused" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className="menu-item"
                onClick={() => handleItemClick(item)}
              >
                <span className="menu-icon">
                  <MenuIcon name={item.icon} />
                </span>
                {showFull && (
                  <span className="menu-text">{item.label}</span>
                )}
                {item.hasSub && showFull && (
                  <span
                    className={`arrow-icon${item.expanded ? " rotated" : ""}`}
                  >
                    <Icon name="chevron-down" size={14} />
                  </span>
                )}
              </div>

              {/* Sub Menu */}
              {item.hasSub &&
                item.expanded &&
                showFull &&
                item.subItems && (
                  <ul className="sub-menu-list">
                    {item.subItems.map((sub, j) => (
                      <li
                        key={sub.label + j}
                        className={[
                          "sub-menu-item",
                          sub.active ? "active" : "",
                          focusedItem === sub ? "focused" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <div
                          className="sub-menu-row"
                          onClick={(e) => handleSubItemClick(sub, e)}
                        >
                          {sub.icon && (
                            <span className="sub-menu-icon">
                              <MenuIcon name={sub.icon} size={14} />
                            </span>
                          )}
                          <span className="sub-menu-text">{sub.label}</span>
                          {sub.hasSub && (
                            <span
                              className={`plus-icon${
                                sub.expanded ? " rotated" : ""
                              }`}
                            >
                              <Icon name="chevron-right" size={14} />
                            </span>
                          )}
                        </div>

                        {/* Third-level */}
                        {sub.hasSub && sub.expanded && sub.subItems && (
                          <ul className="sub-menu-list-nested">
                            {sub.subItems.map((child, k) => (
                              <li
                                key={child.label + k}
                                className={[
                                  "sub-menu-item nested",
                                  child.active ? "active" : "",
                                  focusedItem === child ? "focused" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                onClick={(e) =>
                                  handleSubItemClick(child, e)
                                }
                              >
                                <div className="sub-menu-row nested-row">
                                  {child.icon && (
                                    <span className="sub-menu-icon">
                                      <MenuIcon name={child.icon} size={14} />
                                    </span>
                                  )}
                                  <span className="sub-menu-text">
                                    {child.label}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
            </li>
            )
          )}
        </ul>
      </div>

      {/* User Support */}
      <div className="user-support">
        <div className="avatar-circle">
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
        </div>
        {showFull && userName && (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              marginLeft: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </span>
            {userRole && (
              <span
                style={{
                  color: "#78909c",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userRole}
              </span>
            )}
          </div>
        )}
        {showFull && onLogout && (
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              color: "#78909c",
              cursor: "pointer",
              padding: 4,
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon name="logout" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
