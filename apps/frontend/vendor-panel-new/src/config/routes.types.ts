export type MenuSection = 'SOFTWARE_VENDOR' | 'DEV_OPS' | 'DEVELOPER_TOOLS' | 'OTHER';

export interface DiscoveredRoute {
  key: string;
  label: string;
  path: string;
  icon: string;
  parentKey?: string;
  moduleKey?: string;
  section?: MenuSection;
  displayOrder: number;
}

export interface RoutesConfig {
  generatedAt: string;
  totalRoutes: number;
  routes: DiscoveredRoute[];
}
