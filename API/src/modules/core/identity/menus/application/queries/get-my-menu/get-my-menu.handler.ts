// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { GetMyMenuQuery } from './get-my-menu.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { industryFilter } from '../../../../../../../common/utils/industry-filter.util';

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
  requiresCredential: boolean;
  credentialKey: string | null;
  businessTypeApplicability: any;
  autoEnableWithModule: string | null;
  terminologyKey: string | null;
  isAdminOnly: boolean;
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
  isAdminOnly?: boolean;
  children: MenuTreeItem[];
}

@QueryHandler(GetMyMenuQuery)
export class GetMyMenuHandler implements IQueryHandler<GetMyMenuQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Return permission-filtered menu tree for the current user.
   * 5-Check Visibility Chain:
   *   1. isActive check (query-level)
   *   2. Module access check (autoEnableWithModule → tenant has module enabled?)
   *   3. Business type applicability (businessTypeApplicability includes tenant's type or "ALL")
   *   4. Credential validation (requiresCredential → tenant has valid credentials?)
   *   5. Role permission check (permissionModule:permissionAction)
   * Plus: terminology key resolution (terminologyKey → resolved label)
   */
  async execute(query: GetMyMenuQuery): Promise<MenuTreeItem[]> {
    // SUPER_ADMIN / PLATFORM_ADMIN → load menus from default tenant, no permission filtering
    if (query.isSuperAdmin || query.roleName === 'SUPER_ADMIN' || query.roleName === 'PLATFORM_ADMIN') {
      const defaultTenantId = this.config.get<string>('DEFAULT_TENANT_ID');
      let tenantId = defaultTenantId;

      if (!tenantId) {
        const defaultTenant = await this.prisma.identity.tenant.findFirst({ where: { slug: 'default' } });
        tenantId = defaultTenant?.id;
      }

      const menus = tenantId
        ? await this.prisma.identity.menu.findMany({
            where: { isActive: true, tenantId },
            orderBy: { sortOrder: 'asc' },
          })
        : [];
      return this.buildTree(menus);
    }

    // 1. Load all active menus (isActive check + industry filter)
    const allMenus = await this.prisma.identity.menu.findMany({
      where: {
        isActive: true,
        tenantId: query.tenantId,
        ...industryFilter(query.businessTypeCode),
      } as any,
      orderBy: { sortOrder: 'asc' },
    });

    // 2. Load tenant's enabled modules for module access check
    const enabledModules = await this.loadEnabledModules(query.tenantId);

    // 3. Load tenant's validated credentials for credential check
    const validCredentials = await this.loadValidCredentials(query.tenantId);

    // 4. Load terminology map for label resolution
    const terminology = await this.loadTerminology(query.tenantId);

    // 5. Load role permissions
    const userPerms = await this.loadRolePermissions(query.roleId);

    // Build filtered tree with all 5 checks
    return this.buildFilteredTree(allMenus, userPerms, {
      enabledModules,
      validCredentials,
      businessTypeCode: query.businessTypeCode,
      terminology,
    });
  }

  /** Load role permissions as Set of "module:action" strings. */
  private async loadRolePermissions(roleId: string): Promise<Set<string>> {
    const rps = await this.prisma.identity.rolePermission.findMany({
      where: { roleId },
      include: { permission: { select: { module: true, action: true } } },
    });
    return new Set(rps.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
  }

  /** Load enabled module codes for tenant (Check 2). */
  private async loadEnabledModules(tenantId?: string): Promise<Set<string>> {
    if (!tenantId) return new Set();
    const modules = await this.prisma.platform.tenantModule.findMany({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
      include: { module: { select: { code: true } } },
    });
    return new Set(modules.map((m) => m.module.code));
  }

  /** Load validated credential keys for tenant (Check 4). */
  private async loadValidCredentials(tenantId?: string): Promise<Set<string>> {
    if (!tenantId) return new Set();
    const modules = await this.prisma.platform.tenantModule.findMany({
      where: { tenantId, credentialsStatus: 'VALID' },
      include: { module: { select: { code: true } } },
    });
    return new Set(modules.map((m) => m.module.code));
  }

  /** Load resolved terminology map for tenant. */
  private async loadTerminology(tenantId?: string): Promise<Record<string, string>> {
    if (!tenantId) return {};
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    if (!tenant) return {};

    const result: Record<string, string> = tenant.businessType
      ? { ...(tenant.businessType.terminologyMap as Record<string, string>) }
      : {};

    const overrides = await this.prisma.identity.terminologyOverride.findMany({
      where: { tenantId, isActive: true },
    });
    for (const ov of overrides) {
      result[ov.termKey] = ov.customLabel;
    }
    return result;
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

  /** Context for the 5-check visibility chain. */
  private buildFilteredTree(
    menus: MenuRow[],
    perms: Set<string>,
    ctx?: {
      enabledModules?: Set<string>;
      validCredentials?: Set<string>;
      businessTypeCode?: string;
      terminology?: Record<string, string>;
    },
  ): MenuTreeItem[] {
    const map = new Map<string, MenuRow & { childRows: MenuRow[] }>();

    for (const m of menus) {
      map.set(m.id, { ...m, childRows: [] });
    }
    for (const m of menus) {
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.childRows.push(m);
      }
    }

    const roots = menus.filter((m) => !m.parentId);
    return this.filterLevel(roots, map, perms, ctx);
  }

  /** Recursively filter one level of menus. */
  private filterLevel(
    items: MenuRow[],
    map: Map<string, MenuRow & { childRows: MenuRow[] }>,
    perms: Set<string>,
    ctx?: {
      enabledModules?: Set<string>;
      validCredentials?: Set<string>;
      businessTypeCode?: string;
      terminology?: Record<string, string>;
    },
  ): MenuTreeItem[] {
    const visible: MenuTreeItem[] = [];

    for (const item of items) {
      const entry = map.get(item.id)!;

      if (item.menuType === 'DIVIDER') {
        if (visible.length > 0 && visible[visible.length - 1].menuType !== 'DIVIDER') {
          visible.push(this.toTreeItem(item, ctx?.terminology));
        }
        continue;
      }

      if (item.menuType === 'TITLE') {
        visible.push(this.toTreeItem(item, ctx?.terminology));
        continue;
      }

      if (item.menuType === 'GROUP') {
        // Check 0: admin-only menus hidden from non-admin users
        if (item.isAdminOnly) continue;

        // Check 3: business type applicability on groups too
        if (!this.checkBusinessType(item, ctx?.businessTypeCode)) continue;

        const filteredChildren = this.filterLevel(entry.childRows, map, perms, ctx);
        if (filteredChildren.length > 0) {
          const node = this.toTreeItem(item, ctx?.terminology);
          node.children = filteredChildren;
          visible.push(node);
        }
        continue;
      }

      // ITEM — apply 5-check chain (admin-only items hidden from regular users)
      if (item.isAdminOnly) continue;
      if (this.isVisible5Check(item, perms, ctx)) {
        const node = this.toTreeItem(item, ctx?.terminology);
        if (entry.childRows.length > 0) {
          node.children = this.filterLevel(entry.childRows, map, perms, ctx);
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

  /**
   * 5-Check Visibility Chain:
   * 1. isActive (already filtered at query level)
   * 2. Module access: if autoEnableWithModule is set, tenant must have that module enabled
   * 3. Business type: businessTypeApplicability must include tenant's type or "ALL"
   * 4. Credential validation: if requiresCredential, tenant must have valid credentials
   * 5. Role permission: permissionModule:permissionAction check
   */
  private isVisible5Check(
    menu: MenuRow,
    perms: Set<string>,
    ctx?: {
      enabledModules?: Set<string>;
      validCredentials?: Set<string>;
      businessTypeCode?: string;
    },
  ): boolean {
    // Check 2: Module access
    if (menu.autoEnableWithModule && ctx?.enabledModules) {
      if (!ctx.enabledModules.has(menu.autoEnableWithModule)) return false;
    }

    // Check 3: Business type applicability
    if (!this.checkBusinessType(menu, ctx?.businessTypeCode)) return false;

    // Check 4: Credential validation
    if (menu.requiresCredential && menu.credentialKey && ctx?.validCredentials) {
      if (!ctx.validCredentials.has(menu.credentialKey)) return false;
    }

    // Check 5: Role permission
    if (menu.permissionModule && menu.permissionAction) {
      if (!perms.has(`${menu.permissionModule}:${menu.permissionAction}`)) return false;
    }

    return true;
  }

  /** Check 3: Business type applicability. */
  private checkBusinessType(menu: MenuRow, businessTypeCode?: string): boolean {
    if (!menu.businessTypeApplicability) return true;
    const applicability = Array.isArray(menu.businessTypeApplicability)
      ? menu.businessTypeApplicability
      : JSON.parse(String(menu.businessTypeApplicability));
    if (applicability.includes('ALL')) return true;
    if (!businessTypeCode) return true; // no business type assigned → show all
    return applicability.includes(businessTypeCode);
  }

  private toTreeItem(m: MenuRow, terminology?: Record<string, string>): MenuTreeItem {
    let name = m.name;
    // Resolve terminology key if set
    if (m.terminologyKey && terminology && terminology[m.terminologyKey]) {
      name = terminology[m.terminologyKey];
    }
    return {
      id: m.id, name, code: m.code, icon: m.icon, route: m.route,
      menuType: m.menuType, badgeColor: m.badgeColor, badgeText: m.badgeText,
      openInNewTab: m.openInNewTab, children: [],
    };
  }
}
