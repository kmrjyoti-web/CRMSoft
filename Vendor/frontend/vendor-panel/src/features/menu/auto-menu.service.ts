import discoveredRoutes from '@/config/discovered-routes.json';
import type { RoutesConfig, DiscoveredRoute } from '@/config/routes.types';

export interface AutoMenuItem {
  id: string;
  key: string;
  label: string;
  path: string;
  icon: string;
  moduleKey?: string;
  section?: string;
  isLocked: boolean;
  lockReason?: string;
  children: AutoMenuItem[];
  displayOrder: number;
}

class AutoMenuService {
  private routes: DiscoveredRoute[];

  constructor() {
    this.routes = (discoveredRoutes as RoutesConfig).routes;
  }

  /**
   * Build menu tree from discovered routes.
   * @param enabledModules module keys the vendor has access to
   * @param showLockedItems whether to include locked items in the tree
   */
  buildMenu(enabledModules: string[] = [], showLockedItems = true): AutoMenuItem[] {
    const items = this.routes.map(
      (route): AutoMenuItem & { parentKey?: string } => {
        const isLocked = route.moduleKey
          ? !enabledModules.includes(route.moduleKey)
          : false;

        return {
          id: route.key,
          key: route.key,
          label: route.label,
          path: route.path,
          icon: route.icon,
          moduleKey: route.moduleKey,
          section: route.section,
          isLocked,
          lockReason: isLocked
            ? `Upgrade your subscription to access ${route.label}`
            : undefined,
          children: [],
          displayOrder: route.displayOrder,
          parentKey: route.parentKey,
        };
      },
    );

    const visible = showLockedItems
      ? items
      : items.filter((i) => !i.isLocked);

    return this.buildTree(visible);
  }

  private buildTree(
    items: (AutoMenuItem & { parentKey?: string })[],
    parentKey?: string,
  ): AutoMenuItem[] {
    return items
      .filter((i) => i.parentKey === parentKey)
      .map((i) => ({
        ...i,
        children: this.buildTree(items, i.key),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /** Check if a specific route requires a module. */
  getModuleRequirement(path: string): string | undefined {
    return this.routes.find((r) => r.path === path)?.moduleKey;
  }

  getRouteCount(): number {
    return this.routes.length;
  }
}

export const autoMenuService = new AutoMenuService();
