import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/** All possible per-menu permission actions. */
export type PermissionAction =
  | 'view' | 'create' | 'edit' | 'delete'
  | 'export' | 'import' | 'bulkUpdate' | 'bulkDelete'
  | 'approve' | 'assign' | 'transfer'
  | 'viewAll' | 'editAll' | 'deleteAll';

/** Maps PermissionAction → DB column name. */
const ACTION_TO_COLUMN: Record<PermissionAction, string> = {
  view: 'canView',
  create: 'canCreate',
  edit: 'canEdit',
  delete: 'canDelete',
  export: 'canExport',
  import: 'canImport',
  bulkUpdate: 'canBulkUpdate',
  bulkDelete: 'canBulkDelete',
  approve: 'canApprove',
  assign: 'canAssign',
  transfer: 'canTransfer',
  viewAll: 'canViewAll',
  editAll: 'canEditAll',
  deleteAll: 'canDeleteAll',
};

/** Full permission flags for a single menu. */
export interface MenuPermissions {
  menuId: string;
  menuCode: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canBulkUpdate: boolean;
  canBulkDelete: boolean;
  canApprove: boolean;
  canAssign: boolean;
  canTransfer: boolean;
  canViewAll: boolean;
  canEditAll: boolean;
  canDeleteAll: boolean;
  restrictedFields?: {
    hiddenFields?: string[];
    readOnlyFields?: string[];
  };
  inheritFromParent?: boolean;
}

/** Permission matrix row (one menu, all actions). */
export interface PermissionMatrixRow {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuType: string;
  parentId: string | null;
  permissions: MenuPermissions;
}

const EMPTY_PERMISSIONS: Omit<MenuPermissions, 'menuId' | 'menuCode'> = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
  canImport: false,
  canBulkUpdate: false,
  canBulkDelete: false,
  canApprove: false,
  canAssign: false,
  canTransfer: false,
  canViewAll: false,
  canEditAll: false,
  canDeleteAll: false,
};

@Injectable()
export class MenuPermissionService implements OnModuleInit {
  private readonly logger = new Logger(MenuPermissionService.name);

  // In-memory cache: Map<`${tenantId}:${roleId}`, Map<menuCode, MenuPermissions>>
  private cache = new Map<string, Map<string, MenuPermissions>>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('MenuPermissionService initialized');
  }

  // ═══════════════════════════════════════════════════════
  // CHECK PERMISSION
  // ═══════════════════════════════════════════════════════

  /**
   * Check if role has specific permission on menu.
   * SUPER_ADMIN / PLATFORM_ADMIN bypass all checks.
   */
  async hasPermission(
    tenantId: string,
    roleId: string,
    menuCode: string,
    action: PermissionAction,
    roleName?: string,
  ): Promise<boolean> {
    if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN') return true;

    const permissions = await this.getPermissions(tenantId, roleId, menuCode);
    if (!permissions) return false;

    const columnName = ACTION_TO_COLUMN[action];
    return (permissions as any)[columnName] === true;
  }

  /**
   * Check if role has ANY of the given permissions on menu (OR logic).
   */
  async hasAnyPermission(
    tenantId: string,
    roleId: string,
    menuCode: string,
    actions: PermissionAction[],
    roleName?: string,
  ): Promise<boolean> {
    if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN') return true;
    for (const action of actions) {
      if (await this.hasPermission(tenantId, roleId, menuCode, action)) return true;
    }
    return false;
  }

  /**
   * Check if role has ALL of the given permissions on menu (AND logic).
   */
  async hasAllPermissions(
    tenantId: string,
    roleId: string,
    menuCode: string,
    actions: PermissionAction[],
    roleName?: string,
  ): Promise<boolean> {
    if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN') return true;
    for (const action of actions) {
      if (!(await this.hasPermission(tenantId, roleId, menuCode, action))) return false;
    }
    return true;
  }

  // ═══════════════════════════════════════════════════════
  // GET PERMISSIONS
  // ═══════════════════════════════════════════════════════

  /**
   * Get full permissions for a role+menu combination.
   * Uses 5-minute in-memory cache. Supports parent inheritance.
   */
  async getPermissions(
    tenantId: string,
    roleId: string,
    menuCode: string,
  ): Promise<MenuPermissions | null> {
    const cacheKey = `${tenantId}:${roleId}`;

    if (!this.isCacheValid(cacheKey)) {
      await this.loadRolePermissions(tenantId, roleId);
    }

    const roleCache = this.cache.get(cacheKey);
    return roleCache?.get(menuCode) || null;
  }

  /**
   * Get all menu permissions for a role.
   */
  async getAllPermissionsForRole(
    tenantId: string,
    roleId: string,
  ): Promise<Map<string, MenuPermissions>> {
    const cacheKey = `${tenantId}:${roleId}`;
    if (!this.isCacheValid(cacheKey)) {
      await this.loadRolePermissions(tenantId, roleId);
    }
    return this.cache.get(cacheKey) || new Map();
  }

  /**
   * Get restricted fields for a menu.
   */
  async getRestrictedFields(
    tenantId: string,
    roleId: string,
    menuCode: string,
  ): Promise<{ hiddenFields: string[]; readOnlyFields: string[] }> {
    const permissions = await this.getPermissions(tenantId, roleId, menuCode);
    return {
      hiddenFields: permissions?.restrictedFields?.hiddenFields || [],
      readOnlyFields: permissions?.restrictedFields?.readOnlyFields || [],
    };
  }

  // ═══════════════════════════════════════════════════════
  // PERMISSION MATRIX
  // ═══════════════════════════════════════════════════════

  /**
   * Get full permission matrix for a role (all menus with flags).
   */
  async getMatrix(tenantId: string, roleId: string): Promise<PermissionMatrixRow[]> {
    const menus = await this.prisma.menu.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, code: true, name: true, menuType: true, parentId: true },
    });

    const existing = await this.prisma.roleMenuPermission.findMany({
      where: { tenantId, roleId },
    });

    const permMap = new Map(existing.map((p) => [p.menuId, p]));

    return menus.map((menu) => {
      const perm = permMap.get(menu.id);
      return {
        menuId: menu.id,
        menuCode: menu.code,
        menuName: menu.name,
        menuType: menu.menuType,
        parentId: menu.parentId,
        permissions: perm
          ? this.toMenuPermissions(menu.id, menu.code, perm)
          : { menuId: menu.id, menuCode: menu.code, ...EMPTY_PERMISSIONS },
      };
    });
  }

  /**
   * Get full permission matrix for ALL roles (for admin grid view).
   */
  async getFullMatrix(tenantId: string): Promise<{
    roles: Array<{ id: string; name: string; displayName: string }>;
    menus: Array<{ id: string; code: string; name: string; parentId: string | null }>;
    matrix: Record<string, Record<string, MenuPermissions | null>>;
  }> {
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { id: true, name: true, displayName: true },
      orderBy: { level: 'asc' },
    });

    const menus = await this.prisma.menu.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, code: true, name: true, parentId: true },
      orderBy: { sortOrder: 'asc' },
    });

    const allPerms = await this.prisma.roleMenuPermission.findMany({
      where: { tenantId },
    });

    // Index by roleId → menuId
    const permIndex = new Map<string, Map<string, any>>();
    for (const p of allPerms) {
      if (!permIndex.has(p.roleId)) permIndex.set(p.roleId, new Map());
      permIndex.get(p.roleId)!.set(p.menuId, p);
    }

    const matrix: Record<string, Record<string, MenuPermissions | null>> = {};
    for (const role of roles) {
      matrix[role.id] = {};
      const rolePerms = permIndex.get(role.id);
      for (const menu of menus) {
        const perm = rolePerms?.get(menu.id);
        matrix[role.id][menu.code] = perm
          ? this.toMenuPermissions(menu.id, menu.code, perm)
          : null;
      }
    }

    return { roles, menus, matrix };
  }

  // ═══════════════════════════════════════════════════════
  // SET PERMISSIONS
  // ═══════════════════════════════════════════════════════

  /**
   * Set permissions for a role on a specific menu (upsert).
   */
  async setPermissions(
    tenantId: string,
    roleId: string,
    menuId: string,
    menuCode: string,
    permissions: Partial<Omit<MenuPermissions, 'menuId' | 'menuCode'>>,
    userId?: string,
  ): Promise<MenuPermissions> {
    const data = {
      canView: permissions.canView ?? false,
      canCreate: permissions.canCreate ?? false,
      canEdit: permissions.canEdit ?? false,
      canDelete: permissions.canDelete ?? false,
      canExport: permissions.canExport ?? false,
      canImport: permissions.canImport ?? false,
      canBulkUpdate: permissions.canBulkUpdate ?? false,
      canBulkDelete: permissions.canBulkDelete ?? false,
      canApprove: permissions.canApprove ?? false,
      canAssign: permissions.canAssign ?? false,
      canTransfer: permissions.canTransfer ?? false,
      canViewAll: permissions.canViewAll ?? false,
      canEditAll: permissions.canEditAll ?? false,
      canDeleteAll: permissions.canDeleteAll ?? false,
      restrictedFields: permissions.restrictedFields || undefined,
      inheritFromParent: permissions.inheritFromParent ?? true,
    };

    await this.prisma.roleMenuPermission.upsert({
      where: { tenantId_roleId_menuId: { tenantId, roleId, menuId } },
      create: { tenantId, roleId, menuId, ...data, createdById: userId },
      update: { ...data, updatedById: userId },
    });

    this.invalidateCache(tenantId, roleId);

    return { menuId, menuCode, ...data } as MenuPermissions;
  }

  /**
   * Bulk set permissions for a role.
   */
  async bulkSetPermissions(
    tenantId: string,
    roleId: string,
    items: Array<{
      menuId: string;
      menuCode: string;
      permissions: Partial<Omit<MenuPermissions, 'menuId' | 'menuCode'>>;
    }>,
    userId?: string,
  ): Promise<number> {
    for (const item of items) {
      await this.setPermissions(tenantId, roleId, item.menuId, item.menuCode, item.permissions, userId);
    }
    return items.length;
  }

  /**
   * Copy all menu permissions from one role to another.
   */
  async copyPermissions(
    tenantId: string,
    sourceRoleId: string,
    targetRoleId: string,
    userId?: string,
  ): Promise<number> {
    const sourcePerms = await this.prisma.roleMenuPermission.findMany({
      where: { tenantId, roleId: sourceRoleId },
      include: { menu: { select: { code: true } } },
    });

    for (const sp of sourcePerms) {
      await this.prisma.roleMenuPermission.upsert({
        where: {
          tenantId_roleId_menuId: { tenantId, roleId: targetRoleId, menuId: sp.menuId },
        },
        create: {
          tenantId, roleId: targetRoleId, menuId: sp.menuId,
          canView: sp.canView, canCreate: sp.canCreate, canEdit: sp.canEdit, canDelete: sp.canDelete,
          canExport: sp.canExport, canImport: sp.canImport,
          canBulkUpdate: sp.canBulkUpdate, canBulkDelete: sp.canBulkDelete,
          canApprove: sp.canApprove, canAssign: sp.canAssign, canTransfer: sp.canTransfer,
          canViewAll: sp.canViewAll, canEditAll: sp.canEditAll, canDeleteAll: sp.canDeleteAll,
          restrictedFields: sp.restrictedFields ?? undefined, inheritFromParent: sp.inheritFromParent,
          createdById: userId,
        },
        update: {
          canView: sp.canView, canCreate: sp.canCreate, canEdit: sp.canEdit, canDelete: sp.canDelete,
          canExport: sp.canExport, canImport: sp.canImport,
          canBulkUpdate: sp.canBulkUpdate, canBulkDelete: sp.canBulkDelete,
          canApprove: sp.canApprove, canAssign: sp.canAssign, canTransfer: sp.canTransfer,
          canViewAll: sp.canViewAll, canEditAll: sp.canEditAll, canDeleteAll: sp.canDeleteAll,
          restrictedFields: sp.restrictedFields ?? undefined, inheritFromParent: sp.inheritFromParent,
          updatedById: userId,
        },
      });
    }

    this.invalidateCache(tenantId, targetRoleId);
    return sourcePerms.length;
  }

  // ═══════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════

  /**
   * Get all permission templates (system + tenant-specific).
   */
  async getTemplates(tenantId?: string) {
    return this.prisma.permissionTemplate.findMany({
      where: tenantId
        ? { OR: [{ tenantId }, { tenantId: null }] }
        : undefined,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Apply a permission template to a role.
   * The template has a JSON map: { menuCode: { canView, canCreate, ... } }
   */
  async applyTemplate(
    tenantId: string,
    roleId: string,
    templateId: string,
    userId?: string,
  ): Promise<number> {
    const template = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new Error('Permission template not found');

    const templatePerms = template.permissions as Record<string, any>;

    // Map menu codes to IDs
    const menus = await this.prisma.menu.findMany({
      where: { tenantId },
      select: { id: true, code: true },
    });
    const codeToId = new Map(menus.map((m) => [m.code, m.id]));

    let count = 0;
    for (const [menuCode, perms] of Object.entries(templatePerms)) {
      const menuId = codeToId.get(menuCode);
      if (menuId) {
        await this.setPermissions(tenantId, roleId, menuId, menuCode, perms, userId);
        count++;
      }
    }

    this.logger.log(`Applied template "${template.name}" to role ${roleId} (${count} menus)`);
    return count;
  }

  /**
   * Apply a template by code.
   */
  async applyTemplateByCode(
    tenantId: string,
    roleId: string,
    templateCode: string,
    userId?: string,
  ): Promise<number> {
    const template = await this.prisma.permissionTemplate.findUnique({
      where: { code: templateCode },
    });
    if (!template) throw new Error(`Template not found: ${templateCode}`);
    return this.applyTemplate(tenantId, roleId, template.id, userId);
  }

  // ═══════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════

  /**
   * Delete all permissions for a role.
   */
  async deleteRolePermissions(tenantId: string, roleId: string): Promise<number> {
    const result = await this.prisma.roleMenuPermission.deleteMany({
      where: { tenantId, roleId },
    });
    this.invalidateCache(tenantId, roleId);
    return result.count;
  }

  /**
   * Delete permission for a specific menu.
   */
  async deleteMenuPermission(tenantId: string, roleId: string, menuId: string): Promise<void> {
    await this.prisma.roleMenuPermission.deleteMany({
      where: { tenantId, roleId, menuId },
    });
    this.invalidateCache(tenantId, roleId);
  }

  // ═══════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════

  /**
   * Load all permissions for a role into cache, with parent inheritance.
   */
  private async loadRolePermissions(tenantId: string, roleId: string): Promise<void> {
    const cacheKey = `${tenantId}:${roleId}`;

    const permissions = await this.prisma.roleMenuPermission.findMany({
      where: { tenantId, roleId },
    });

    const menuIds = permissions.map((p) => p.menuId);
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds } },
      select: { id: true, code: true, parentId: true },
    });

    const menuIdToCode = new Map(menus.map((m) => [m.id, m.code]));

    const permissionMap = new Map<string, MenuPermissions>();

    for (const perm of permissions) {
      const menuCode = menuIdToCode.get(perm.menuId);
      if (!menuCode) continue;
      permissionMap.set(menuCode, this.toMenuPermissions(perm.menuId, menuCode, perm));
    }

    this.cache.set(cacheKey, permissionMap);
    this.cacheTimestamps.set(cacheKey, Date.now());
    this.logger.debug(`Loaded ${permissions.length} permissions for role ${roleId}`);
  }

  private isCacheValid(cacheKey: string): boolean {
    const ts = this.cacheTimestamps.get(cacheKey);
    if (!ts) return false;
    return Date.now() - ts < this.CACHE_TTL_MS;
  }

  invalidateCache(tenantId: string, roleId: string): void {
    const cacheKey = `${tenantId}:${roleId}`;
    this.cache.delete(cacheKey);
    this.cacheTimestamps.delete(cacheKey);
  }

  invalidateTenantCache(tenantId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${tenantId}:`)) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

  private toMenuPermissions(menuId: string, menuCode: string, record: any): MenuPermissions {
    return {
      menuId,
      menuCode,
      canView: record.canView,
      canCreate: record.canCreate,
      canEdit: record.canEdit,
      canDelete: record.canDelete,
      canExport: record.canExport,
      canImport: record.canImport,
      canBulkUpdate: record.canBulkUpdate,
      canBulkDelete: record.canBulkDelete,
      canApprove: record.canApprove,
      canAssign: record.canAssign,
      canTransfer: record.canTransfer,
      canViewAll: record.canViewAll,
      canEditAll: record.canEditAll,
      canDeleteAll: record.canDeleteAll,
      restrictedFields: record.restrictedFields as any,
      inheritFromParent: record.inheritFromParent,
    };
  }
}
