"use client";

import { useEffect, useRef, useCallback, useState, type ReactNode } from "react";

import { useRouter, usePathname } from "next/navigation";

import {
  useLayout,
  useMargLayout,
  MargThemeCustomizer,
} from "@/components/ui";
import { ShortcutPanel } from "@/features/shortcuts/components/ShortcutPanel";
import { useShortcutsStore } from "@/features/shortcuts/stores/shortcuts.store";
import { useKeyboardListener } from "@/features/shortcuts/hooks/useKeyboardListener";
import { authService } from "@/features/auth/services/auth.service";
import { menuService } from "@/services/menu.service";
import { permissionService } from "@/services/permission.service";
import api from "@/services/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { useMenuStore } from "@/stores/menu.store";
import { usePermissionStore } from "@/stores/permission.store";

import type { MenuItem } from "@/components/ui";
import type { MenuTreeItem } from "@/types/menu";

import { SidePanelRenderer, SidePanelTaskbar } from "@/components/common/SidePanel";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { useTabStore } from "@/stores/tab.store";
import { TabBar } from "@/components/workspace/TabBar";
import { POSFormLayout } from "@/components/workspace/POSFormLayout";
import { WorkspaceKeyboard } from "@/components/workspace/WorkspaceKeyboard";

import { AiChatWidget } from "@/features/self-hosted-ai/components/AiChatWidget";
import { ErrorDetailModal } from "@/components/common/ErrorDetailModal";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useControlRoomSync } from "@/hooks/useControlRoomSync";
import { CRMHeader } from "./_components/CRMHeader";
import { CRMSidebar } from "./_components/CRMSidebar";
import { OnboardingDialog } from "@/features/user-onboarding/OnboardingDialog";
import { PujaOverlay } from "@/features/puja/components/PujaOverlay";
import { pujaService } from "@/features/puja/services/puja.service";
import { PUJA_SESSION_KEY } from "@/features/puja/types/puja.types";
import type { ReligiousModeConfig } from "@/features/puja/types/puja.types";

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
      // Dividers → special label marker (rendered as <hr> in sidebar)
      if (item.menuType === "DIVIDER") {
        return { label: "__DIVIDER__", icon: "" };
      }
      // Section titles → special marker (rendered as section header in sidebar)
      if (item.menuType === "TITLE") {
        return { label: `__TITLE__${item.name}`, icon: "" };
      }
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

/** Codes that belong only in the Vendor Portal (3006), not in CRM Portal. */
const VENDOR_ONLY_CODES = new Set([
  "SOFTWARE_VENDOR_GROUP",
  "DEVELOPER_GROUP",
  "DIV_5", // divider before Developer
  "DIV_6", // divider before Software Vendor
]);

/** Test admin email from env — sees all menus unfiltered. */
const TEST_ADMIN_EMAIL = process.env.NEXT_PUBLIC_TEST_ADMIN_EMAIL ?? "";

/** For SuperAdmin: split menu into Admin + Platform sections. */
function buildPlatformMenu(tree: MenuTreeItem[]): MenuTreeItem[] {
  const vendorGroup = tree.find((item) => item.code === "SOFTWARE_VENDOR_GROUP");
  const crmMenus = tree.filter(
    (item) => item.code !== "SOFTWARE_VENDOR_GROUP" && item.code !== "DEVELOPER_GROUP"
      && item.code !== "DIV_5" && item.code !== "DIV_6",
  );

  const result: MenuTreeItem[] = [
    { id: "__section_admin", name: "Admin", code: "SECTION_ADMIN", icon: "", route: null, menuType: "TITLE", openInNewTab: false, children: [] },
    ...crmMenus,
    { id: "__section_platform", name: "Platform", code: "SECTION_PLATFORM", icon: "", route: null, menuType: "TITLE", openInNewTab: false, children: [] },
    ...(vendorGroup?.children ?? []),
  ];
  return result;
}

/** For regular CRM users: remove vendor-only sections. */
function filterCrmMenu(tree: MenuTreeItem[]): MenuTreeItem[] {
  return tree.filter((item) => !VENDOR_ONLY_CODES.has(item.code));
}

// ── Protected Layout ───────────────────────────────────

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const fetchedRef = useRef(false);
  const pujaFetchedRef = useRef(false);

  // Puja overlay state
  const [pujaConfig, setPujaConfig] = useState<ReligiousModeConfig | null>(null);

  // Control Room cache sync — auto-logout if rules change
  useControlRoomSync();

  const user = useAuthStore((s) => s.user);
  const tenantCode = useAuthStore((s) => s.tenantCode);
  const tenantName = useAuthStore((s) => s.tenantName);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const setMenuItems = useMargLayout((s) => s.setMenuItems);
  const setActiveItem = useMargLayout((s) => s.setActiveItem);
  const margInit = useMargLayout((s) => s.init);
  const isSidebarClosed = useLayout((s) => s.isSidebarClosed);
  const toggleSidebar = useLayout((s) => s.toggleSidebar);
  const isPOSMode = useTabStore((s) => s.isPOSMode);

  const handleLogout = useCallback(() => {
    authService.logout();
  }, []);

  const openShortcutPanel = useShortcutsStore((s) => s.openPanel);
  useKeyboardListener();

  // Initialize layout — clear CoreUI default dev menu items immediately
  useEffect(() => {
    setMenuItems([]); // Clear first so skeleton shows, not stale static items
    margInit();
    setMenuItems([]); // Clear again in case margInit re-injects defaults
  }, [margInit, setMenuItems]);

  // Fetch menu on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    useMenuStore.getState().setLoading();
    // Fetch both menu and permissions, then apply RBAC filtering
    const menuPromise = menuService.getMyMenu();
    const permPromise = permissionService.getMyPermissions().catch(() => [] as string[]);

    Promise.all([menuPromise, permPromise])
      .then(([tree, codes]) => {
        useMenuStore.getState().setMenu(tree);
        usePermissionStore.getState().setCodes(codes);

        const isTestAdmin = TEST_ADMIN_EMAIL && user?.email === TEST_ADMIN_EMAIL;
        const menuTree = isSuperAdmin
          ? buildPlatformMenu(tree)
          : isTestAdmin
            ? tree  // Test admin sees ALL menus unfiltered
            : filterCrmMenu(tree);
        // SuperAdmin & test admin see all; regular users filtered by RBAC permission codes
        const permCodes = (isSuperAdmin || isTestAdmin) ? undefined : (codes.length > 0 ? codes : undefined);
        setMenuItems(transformMenu(menuTree, permCodes));
      })
      .catch(() => {
        useMenuStore.getState().setError();
        // Keep menu empty — sidebar shows "No menu items" empty state
        setMenuItems([]);
      });

    // Fetch terminology for the current industry
    if (!isSuperAdmin) {
      api.get('/api/v1/business-types/terminology/resolved')
        .then((r: any) => {
          const data = r?.data?.data?.data ?? r?.data?.data ?? {};
          useAuthStore.getState().setTerminology(data);
        })
        .catch(() => {});
    }
  }, [setMenuItems]);

  // Sync active menu item on route change
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname, setActiveItem]);

  // Puja overlay — check status once per session/day
  useEffect(() => {
    if (pujaFetchedRef.current) return;
    pujaFetchedRef.current = true;

    // showOncePerDay: skip if already shown today
    const today = new Date().toISOString().split("T")[0];
    const lastShown = localStorage.getItem(PUJA_SESSION_KEY);
    if (lastShown === today) return;

    pujaService.getStatus().then((status) => {
      if (status.show && status.config) {
        setPujaConfig(status.config);
      }
    }).catch(() => {});
  }, []);

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
    <div className={`marg-layout-wrapper${isPOSMode ? " pos-mode" : ""}`}>
      {/* Global keyboard handler for POS workspace */}
      <WorkspaceKeyboard />

      {/* Mobile Sidebar Backdrop */}
      {!isSidebarClosed && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar — icon-only in POS mode */}
      <div className={`sidebar-area${isSidebarClosed || isPOSMode ? " collapsed" : ""}`}>
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
            storeName={isSuperAdmin ? "CRM Platform" : (tenantName || "CRM Admin")}
            companyCode={tenantCode}
            userName={userName}
            userEmail={user?.email}
            userRole={userRole}
            isSuperAdmin={isSuperAdmin}
            onLogout={handleLogout}
            onOpenShortcuts={openShortcutPanel}
          />
        </div>

        {/* POS Tab Bar — appears above content when tabs are open */}
        <TabBar />

        <main className="content-area">
          <ErrorBoundary>
            {/* POS workspace canvas — shown instead of route content when a tab is active */}
            {isPOSMode ? <POSFormLayout /> : children}
          </ErrorBoundary>
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

      {/* Keyboard Shortcuts Panel */}
      <ShortcutPanel />

      {/* Side Panel Renderer (portals to body) */}
      <SidePanelRenderer />

      {/* Global Error Detail Modal (auto-listens to API errors) */}
      <ErrorDetailModal />

      {/* AI Chat Widget (floats over content) */}
      <AiChatWidget />

      {/* User onboarding wall — auto-shows when user.onboardingComplete is false */}
      <OnboardingDialog />

      {/* Puja / Prayer Overlay — shown once per day when religious mode is enabled */}
      {pujaConfig && (
        <PujaOverlay
          config={pujaConfig}
          onClose={() => {
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(PUJA_SESSION_KEY, today);
            setPujaConfig(null);
          }}
        />
      )}
    </div>
  );
}
