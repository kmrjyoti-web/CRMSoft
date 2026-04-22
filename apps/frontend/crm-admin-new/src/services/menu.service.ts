import type { ApiResponse } from "@/types/api-response";
import type { MenuTreeItem } from "@/types/menu";

import api from "./api-client";

// ── Menu Service ───────────────────────────────────────

/** Unwrap potentially double-wrapped API response */
function unwrapMenu(raw: unknown): MenuTreeItem[] {
  if (Array.isArray(raw)) return raw as MenuTreeItem[];
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: MenuTreeItem[] }).data ?? [];
  }
  return [];
}

export const menuService = {
  /** GET /api/v1/menus/my-menu — permission-filtered menu for current user */
  async getMyMenu(): Promise<MenuTreeItem[]> {
    const { data } = await api.get<ApiResponse<MenuTreeItem[]>>(
      "/api/v1/menus/my-menu",
    );
    return unwrapMenu(data.data);
  },

  /** GET /api/v1/menus/tree — full admin menu tree (requires menus:read) */
  async getFullTree(): Promise<MenuTreeItem[]> {
    const { data } = await api.get<ApiResponse<MenuTreeItem[]>>(
      "/api/v1/menus/tree",
    );
    return unwrapMenu(data.data);
  },
};

export default menuService;
