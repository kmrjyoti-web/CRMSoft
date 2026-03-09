export interface DiscoveredRoute {
  key: string;
  label: string;
  path: string;
  icon: string;
  parentKey?: string;
  moduleKey?: string;
  displayOrder: number;
}

export interface RoutesConfig {
  generatedAt: string;
  totalRoutes: number;
  routes: DiscoveredRoute[];
}
