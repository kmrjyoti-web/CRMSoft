"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

import { useRouter, usePathname } from "next/navigation";

import {
  useLayout,
  useMargLayout,
  MargThemeCustomizer,
  MargShortcuts,
} from "@/components/ui";
import { DEFAULT_NAV } from "@/config/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { menuService } from "@/services/menu.service";
import { permissionService } from "@/services/permission.service";
import { useAuthStore } from "@/stores/auth.store";
import { useMenuStore } from "@/stores/menu.store";
import { usePermissionStore } from "@/stores/permission.store";

import type { MenuItem } from "@/components/ui";
import type { MenuTreeItem } from "@/types/menu";

import { SidePanelRenderer, SidePanelTaskbar } from "@/components/common/SidePanel";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { CRMHeader } from "./_components/CRMHeader";
import { CRMSidebar } from "./_components/CRMSidebar";

// ── Transform API menu tree → CoreUI MenuItem[] ────────

function transformMenu(
  items: MenuTreeItem[],
  permissionCodes?: string[],
): MenuItem[] {
  return items
    .filter((item) => {
      if (!item.permissionCode) return true;
      if (!permissionCodes) return true;
      return permissionCodes.includes(item.permissionCode);
    })
    .map((item) => {
      const children = item.children?.length
        ? transformMenu(item.children, permissionCodes)
        : undefined;
      return {
        label: item.name,
        icon: item.icon || "",
        link: children?.length ? undefined : (item.route || undefined),
        hasSub: !!(children?.length),
        subItems: children,
      };
    });
}

// ── Convert fallback NavItem[] → MenuItem[] ─────────────

function navToMenuItems(): MenuItem[] {
  return DEFAULT_NAV.map((n) => ({
    label: n.label,
    icon: n.icon,
    link: n.children?.length ? undefined : n.path,
    hasSub: !!(n.children?.length),
    subItems: n.children?.map((c) => ({
      label: c.label,
      icon: c.icon,
      link: c.path,
    })),
  }));
}

// ── Protected Layout ───────────────────────────────────

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const fetchedRef = useRef(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const user = useAuthStore((s) => s.user);
  const tenantCode = useAuthStore((s) => s.tenantCode);
  const setMenuItems = useMargLayout((s) => s.setMenuItems);
  const setActiveItem = useMargLayout((s) => s.setActiveItem);
  const margInit = useMargLayout((s) => s.init);
  const isSidebarClosed = useLayout((s) => s.isSidebarClosed);
  const toggleSidebar = useLayout((s) => s.toggleSidebar);

  const handleLogout = useCallback(() => {
    authService.logout();
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+K → Shortcuts modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "K") {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Initialize layout
  useEffect(() => {
    margInit();
  }, [margInit]);

  // Fetch menu on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    menuService
      .getMyMenu()
      .then((tree) => {
        useMenuStore.getState().setMenu(tree);
        setMenuItems(transformMenu(tree));
      })
      .catch(() => {
        // API menu unavailable — use fallback navigation
        setMenuItems(navToMenuItems());
      });

    permissionService
      .getMyPermissions()
      .then((codes) => {
        usePermissionStore.getState().setCodes(codes);
      })
      .catch(() => {
        // Permissions endpoint not yet available
      });
  }, [setMenuItems]);

  // Sync active menu item on route change
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname, setActiveItem]);

  // Close all side panels on navigation
  const closeAllPanels = useSidePanelStore((s) => s.closeAllPanels);
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      closeAllPanels();
      prevPathRef.current = pathname;
    }
  }, [pathname, closeAllPanels]);

  // Client-side navigation handler
  const handleNavigate = (link: string) => {
    router.push(link);
  };

  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : undefined;
  const userRole = user?.roleDisplayName ?? user?.role;

  return (
    <div className="marg-layout-wrapper">
      {/* Mobile Sidebar Backdrop */}
      {!isSidebarClosed && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-area${isSidebarClosed ? " collapsed" : ""}`}>
        <CRMSidebar
          onNavigate={handleNavigate}
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="main-content-wrapper">
        <div className="header-area">
          <CRMHeader
            storeName="CRM Admin"
            companyCode={tenantCode}
            userName={userName}
            userEmail={user?.email}
            userRole={userRole}
            onLogout={handleLogout}
            onOpenShortcuts={() => setShowShortcuts(true)}
          />
        </div>
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Footer */}
      <div className="footer-area">
        <SidePanelTaskbar />
        <footer className="marg-footer">
          <span>CRM Admin</span>
          <span>&copy; {new Date().getFullYear()} CRM Soft</span>
        </footer>
      </div>

      {/* Theme Customizer (gear icon on right edge) */}
      <MargThemeCustomizer />

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <MargShortcuts onClose={() => setShowShortcuts(false)} />
      )}

      {/* Side Panel Renderer (portals to body) */}
      <SidePanelRenderer />
    </div>
  );
}
