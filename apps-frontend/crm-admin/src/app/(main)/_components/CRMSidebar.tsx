"use client";

import { useState, useMemo, useCallback } from "react";

import { Icon, ICON_MAP, useLayout, useMargLayout } from "@/components/ui";
import { useMenuStore } from "@/stores/menu.store";
import { useTabStore, ROUTE_TO_DOC_TYPE, DOCUMENT_CONFIG } from "@/stores/tab.store";

import type { IconName, MenuItem } from "@/components/ui";

// ── Skeleton Loader ─────────────────────────────────────

function SidebarSkeleton() {
  // Simulate a realistic menu structure: 8 items, some with sub-items
  const rows = [1, 1, 0.7, 1, 0.85, 1, 0.6, 1, 0.75, 1, 0.9, 1];
  return (
    <ul className="menu-list" style={{ padding: "8px 0" }}>
      {rows.map((widthFactor, i) => (
        <li key={i} style={{ padding: "0 12px", marginBottom: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 8px",
              borderRadius: 6,
            }}
          >
            {/* Icon placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                flexShrink: 0,
              }}
            />
            {/* Text placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                height: 12,
                borderRadius: 4,
                width: `${widthFactor * 100}%`,
                maxWidth: 140,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Empty state ─────────────────────────────────────────

function SidebarEmptyState() {
  return (
    <div style={{ padding: "32px 16px", textAlign: "center" }}>
      <Icon name="alert-circle" size={28} />
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 12,
          marginTop: 8,
          lineHeight: 1.4,
        }}
      >
        No menu items available.
        <br />
        Contact your administrator.
      </p>
    </div>
  );
}

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
  const menuLoading = useMenuStore((s) => s.loading);
  const menuLoaded = useMenuStore((s) => s.loaded);

  const [isHovered, setHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const addTab = useTabStore((s) => s.addTab);

  // Local state for Level 2 expand/collapse — CoreUI's toggleItem doesn't
  // reliably find nested sub-items in the top-level menuItems array, so we
  // track Level 2 expanded state independently.
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set());

  const toggleL2 = useCallback((label: string) => {
    setExpandedL2((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const filteredItems = useMemo(
    () => filterMenuItems(searchText),
    [filterMenuItems, searchText, menuItems],
  );

  // Flatten visible items for keyboard navigation
  const flatVisibleItems = useMemo(() => {
    const flatten = (items: MenuItem[], level = 1): MenuItem[] => {
      const out: MenuItem[] = [];
      for (const item of items) {
        if (item.label === "__DIVIDER__" || item.label.startsWith("__TITLE__")) continue;
        out.push(item);
        const isExpanded =
          level === 1 ? item.expanded : expandedL2.has(item.label);
        if (isExpanded && item.subItems?.length) {
          out.push(...flatten(item.subItems, level + 1));
        }
      }
      return out;
    };
    return flatten(filteredItems);
  }, [filteredItems, expandedL2]);

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
        // Use local state — CoreUI's toggleItem can't find nested sub-items
        toggleL2(item.label);
        return;
      }
      if (item.link) {
        setActiveItem(item.link);
        onNavigate?.(item.link);
      }
    },
    [toggleL2, setActiveItem, onNavigate],
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
            color: "var(--brand-primary, #ff9d2b)",
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
              color: "var(--sidebar-text, #ffffff)",
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
        {menuLoading && !menuLoaded && showFull ? (
          <SidebarSkeleton />
        ) : menuLoaded && filteredItems.length === 0 && !searchText && showFull ? (
          <SidebarEmptyState />
        ) : null}
        <ul className="menu-list" style={menuLoading && !menuLoaded ? { display: "none" } : undefined}>
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
                    {item.subItems.map((sub, j) =>
                      sub.label === "__DIVIDER__" ? (
                        <li key={`sub-divider-${j}`} className="menu-divider">
                          <hr
                            style={{
                              border: "none",
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              margin: "4px 16px",
                            }}
                          />
                        </li>
                      ) : sub.label.startsWith("__TITLE__") ? (
                        <li key={`sub-title-${j}`} style={{ padding: "10px 16px 2px" }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 1.2,
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            {sub.label.replace("__TITLE__", "")}
                          </span>
                        </li>
                      ) : (
                      <li
                        key={sub.label + j}
                        className={[
                          "sub-menu-item",
                          sub.active ? "active" : "",
                          expandedL2.has(sub.label) ? "expanded" : "",
                          focusedItem === sub ? "focused" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onMouseEnter={() => sub.link ? setHoveredLink(sub.link) : undefined}
                        onMouseLeave={() => setHoveredLink(null)}
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
                          {/* POS quick-open button — only for supported routes */}
                          {sub.link && ROUTE_TO_DOC_TYPE[sub.link] && hoveredLink === sub.link && (
                            <button
                              title={`New ${DOCUMENT_CONFIG[ROUTE_TO_DOC_TYPE[sub.link]].shortName} tab`}
                              onClick={(e) => {
                                e.stopPropagation();
                                addTab(ROUTE_TO_DOC_TYPE[sub.link!]!);
                              }}
                              style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                padding: "1px 4px",
                                marginLeft: "auto",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              <Icon name="plus" size={11} />
                            </button>
                          )}
                          {sub.hasSub && (
                            <span
                              className={`plus-icon${
                                expandedL2.has(sub.label) ? " rotated" : ""
                              }`}
                            >
                              <Icon name="chevron-right" size={14} />
                            </span>
                          )}
                        </div>

                        {/* Third-level */}
                        {sub.hasSub && expandedL2.has(sub.label) && sub.subItems && (
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
                      )
                    )}
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
