// ── Menu Tree (API response shape) ─────────────────────

export interface MenuTreeItem {
  id: string;
  name: string;
  code: string;
  icon: string;
  route: string | null;
  menuType: "group" | "item" | "divider";
  badgeColor?: string;
  badgeText?: string;
  openInNewTab?: boolean;
  permissionCode?: string;
  children?: MenuTreeItem[];
}
