/** Sidebar position relative to main content. */
export type SidebarPosition = "left" | "right";

/** Sidebar configuration. */
export interface SidebarConfig {
  enabled: boolean;
  position: SidebarPosition;
  width: string;
  collapsedWidth: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
}

/** Header configuration. */
export interface HeaderConfig {
  enabled: boolean;
  height: string;
  sticky: boolean;
  transparent: boolean;
}

/** Footer configuration. */
export interface FooterConfig {
  enabled: boolean;
  height: string;
  sticky: boolean;
}

/** Breadcrumb configuration. */
export interface BreadcrumbConfig {
  enabled: boolean;
  separator: string;
}

/** Overall layout configuration. */
export interface LayoutConfig {
  name: string;
  sidebar: SidebarConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  breadcrumbs: BreadcrumbConfig;
  maxContentWidth: string;
  padding: string;
}
