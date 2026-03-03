import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyMenuQuery } from './get-my-menu.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

interface MenuRow {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  route: string | null;
  menuType: string;
  sortOrder: number;
  permissionModule: string | null;
  permissionAction: string | null;
  badgeColor: string | null;
  badgeText: string | null;
  openInNewTab: boolean;
  parentId: string | null;
}

export interface MenuTreeItem {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  route: string | null;
  menuType: string;
  badgeColor?: string | null;
  badgeText?: string | null;
  openInNewTab: boolean;
  children: MenuTreeItem[];
}

@QueryHandler(GetMyMenuQuery)
export class GetMyMenuHandler implements IQueryHandler<GetMyMenuQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /** Return permission-filtered menu tree for the current user. */
  async execute(query: GetMyMenuQuery): Promise<MenuTreeItem[]> {
    // 1. Load all active menus flat
    const allMenus = await this.prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // 2. SUPER_ADMIN → return full tree, no filtering
    if (query.roleName === 'SUPER_ADMIN') {
      return this.buildTree(allMenus);
    }

    // 3. Load user's role permissions → Set<"module:action">
    const userPerms = await this.loadRolePermissions(query.roleId);

    // 4. Filter and build tree
    return this.buildFilteredTree(allMenus, userPerms);
  }

  /** Load role permissions as Set of "module:action" strings. */
  private async loadRolePermissions(roleId: string): Promise<Set<string>> {
    const rps = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: { select: { module: true, action: true } } },
    });
    return new Set(rps.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
  }

  /** Build full tree (no permission filtering). */
  private buildTree(menus: MenuRow[]): MenuTreeItem[] {
    const map = new Map<string, MenuTreeItem>();
    const roots: MenuTreeItem[] = [];

    for (const m of menus) {
      map.set(m.id, this.toTreeItem(m));
    }
    for (const m of menus) {
      const node = map.get(m.id)!;
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.children.push(node);
      } else if (!m.parentId) {
        roots.push(node);
      }
    }
    return roots;
  }

  /** Build tree with permission filtering + GROUP/DIVIDER pruning. */
  private buildFilteredTree(menus: MenuRow[], perms: Set<string>): MenuTreeItem[] {
    const map = new Map<string, MenuRow & { childRows: MenuRow[] }>();

    // Group by parent
    for (const m of menus) {
      map.set(m.id, { ...m, childRows: [] });
    }
    for (const m of menus) {
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.childRows.push(m);
      }
    }

    // Recursive filter from root
    const roots = menus.filter((m) => !m.parentId);
    return this.filterLevel(roots, map, perms);
  }

  /** Recursively filter one level of menus. */
  private filterLevel(
    items: MenuRow[],
    map: Map<string, MenuRow & { childRows: MenuRow[] }>,
    perms: Set<string>,
  ): MenuTreeItem[] {
    const visible: MenuTreeItem[] = [];

    for (const item of items) {
      const entry = map.get(item.id)!;

      if (item.menuType === 'DIVIDER') {
        // Divider — only keep if there are visible items before it
        if (visible.length > 0 && visible[visible.length - 1].menuType !== 'DIVIDER') {
          visible.push(this.toTreeItem(item));
        }
        continue;
      }

      if (item.menuType === 'GROUP') {
        // Group — filter children first, hide group if no children survive
        const filteredChildren = this.filterLevel(entry.childRows, map, perms);
        if (filteredChildren.length > 0) {
          const node = this.toTreeItem(item);
          node.children = filteredChildren;
          visible.push(node);
        }
        continue;
      }

      // ITEM — check permission
      if (this.isVisible(item, perms)) {
        const node = this.toTreeItem(item);
        // Also filter grandchildren if any
        if (entry.childRows.length > 0) {
          node.children = this.filterLevel(entry.childRows, map, perms);
        }
        visible.push(node);
      }
    }

    // Remove trailing dividers
    while (visible.length > 0 && visible[visible.length - 1].menuType === 'DIVIDER') {
      visible.pop();
    }

    return visible;
  }

  /** A menu is visible if it has no permission requirement, or the user has the permission. */
  private isVisible(menu: MenuRow, perms: Set<string>): boolean {
    if (!menu.permissionModule || !menu.permissionAction) return true;
    return perms.has(`${menu.permissionModule}:${menu.permissionAction}`);
  }

  private toTreeItem(m: MenuRow): MenuTreeItem {
    return {
      id: m.id, name: m.name, code: m.code, icon: m.icon, route: m.route,
      menuType: m.menuType, badgeColor: m.badgeColor, badgeText: m.badgeText,
      openInNewTab: m.openInNewTab, children: [],
    };
  }
}
