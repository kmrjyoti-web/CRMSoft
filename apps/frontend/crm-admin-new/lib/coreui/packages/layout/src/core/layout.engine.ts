import type { LayoutConfig } from "./layout.types";

/** Default layout configuration. */
export const defaultLayoutConfig: LayoutConfig = {
  name: "default",
  sidebar: {
    enabled: true,
    position: "left",
    width: "256px",
    collapsedWidth: "64px",
    collapsible: true,
    defaultCollapsed: false,
  },
  header: {
    enabled: true,
    height: "64px",
    sticky: true,
    transparent: false,
  },
  footer: {
    enabled: false,
    height: "48px",
    sticky: false,
  },
  breadcrumbs: {
    enabled: true,
    separator: "/",
  },
  maxContentWidth: "1280px",
  padding: "24px",
};

/** Merge a partial layout config with the default. */
export function resolveLayout(
  overrides: Partial<LayoutConfig> = {},
): LayoutConfig {
  return {
    ...defaultLayoutConfig,
    ...overrides,
    sidebar: { ...defaultLayoutConfig.sidebar, ...overrides.sidebar },
    header: { ...defaultLayoutConfig.header, ...overrides.header },
    footer: { ...defaultLayoutConfig.footer, ...overrides.footer },
    breadcrumbs: {
      ...defaultLayoutConfig.breadcrumbs,
      ...overrides.breadcrumbs,
    },
  };
}

/** Generate CSS custom properties for the resolved layout. */
export function generateLayoutCSS(config: LayoutConfig): string {
  const lines = [
    `  --layout-sidebar-width: ${config.sidebar.width};`,
    `  --layout-sidebar-collapsed-width: ${config.sidebar.collapsedWidth};`,
    `  --layout-header-height: ${config.header.height};`,
    `  --layout-footer-height: ${config.footer.height};`,
    `  --layout-max-content-width: ${config.maxContentWidth};`,
    `  --layout-padding: ${config.padding};`,
  ];
  return `:root {\n${lines.join("\n")}\n}`;
}
