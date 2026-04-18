"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MenuPermissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuPermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const ACTION_TO_COLUMN = {
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
const EMPTY_PERMISSIONS = {
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
let MenuPermissionService = MenuPermissionService_1 = class MenuPermissionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MenuPermissionService_1.name);
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.CACHE_TTL_MS = 5 * 60 * 1000;
    }
    async onModuleInit() {
        this.logger.log('MenuPermissionService initialized');
    }
    async hasPermission(tenantId, roleId, menuCode, action, roleName) {
        if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN')
            return true;
        const permissions = await this.getPermissions(tenantId, roleId, menuCode);
        if (!permissions)
            return false;
        const columnName = ACTION_TO_COLUMN[action];
        return permissions[columnName] === true;
    }
    async hasAnyPermission(tenantId, roleId, menuCode, actions, roleName) {
        if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN')
            return true;
        for (const action of actions) {
            if (await this.hasPermission(tenantId, roleId, menuCode, action))
                return true;
        }
        return false;
    }
    async hasAllPermissions(tenantId, roleId, menuCode, actions, roleName) {
        if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN')
            return true;
        for (const action of actions) {
            if (!(await this.hasPermission(tenantId, roleId, menuCode, action)))
                return false;
        }
        return true;
    }
    async getPermissions(tenantId, roleId, menuCode) {
        const cacheKey = `${tenantId}:${roleId}`;
        if (!this.isCacheValid(cacheKey)) {
            await this.loadRolePermissions(tenantId, roleId);
        }
        const roleCache = this.cache.get(cacheKey);
        return roleCache?.get(menuCode) || null;
    }
    async getAllPermissionsForRole(tenantId, roleId) {
        const cacheKey = `${tenantId}:${roleId}`;
        if (!this.isCacheValid(cacheKey)) {
            await this.loadRolePermissions(tenantId, roleId);
        }
        return this.cache.get(cacheKey) || new Map();
    }
    async getRestrictedFields(tenantId, roleId, menuCode) {
        const permissions = await this.getPermissions(tenantId, roleId, menuCode);
        return {
            hiddenFields: permissions?.restrictedFields?.hiddenFields || [],
            readOnlyFields: permissions?.restrictedFields?.readOnlyFields || [],
        };
    }
    async getMatrix(tenantId, roleId) {
        const menus = await this.prisma.identity.menu.findMany({
            where: { tenantId, isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, code: true, name: true, menuType: true, parentId: true },
        });
        const existing = await this.prisma.identity.roleMenuPermission.findMany({
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
    async getFullMatrix(tenantId) {
        const roles = await this.prisma.identity.role.findMany({
            where: { tenantId },
            select: { id: true, name: true, displayName: true },
            orderBy: { level: 'asc' },
        });
        const menus = await this.prisma.identity.menu.findMany({
            where: { tenantId, isActive: true },
            select: { id: true, code: true, name: true, parentId: true },
            orderBy: { sortOrder: 'asc' },
        });
        const allPerms = await this.prisma.identity.roleMenuPermission.findMany({
            where: { tenantId },
        });
        const permIndex = new Map();
        for (const p of allPerms) {
            if (!permIndex.has(p.roleId))
                permIndex.set(p.roleId, new Map());
            permIndex.get(p.roleId).set(p.menuId, p);
        }
        const matrix = {};
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
    async setPermissions(tenantId, roleId, menuId, menuCode, permissions, userId) {
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
        await this.prisma.identity.roleMenuPermission.upsert({
            where: { tenantId_roleId_menuId: { tenantId, roleId, menuId } },
            create: { tenantId, roleId, menuId, ...data, createdById: userId },
            update: { ...data, updatedById: userId },
        });
        this.invalidateCache(tenantId, roleId);
        return { menuId, menuCode, ...data };
    }
    async bulkSetPermissions(tenantId, roleId, items, userId) {
        for (const item of items) {
            await this.setPermissions(tenantId, roleId, item.menuId, item.menuCode, item.permissions, userId);
        }
        return items.length;
    }
    async copyPermissions(tenantId, sourceRoleId, targetRoleId, userId) {
        const sourcePerms = await this.prisma.identity.roleMenuPermission.findMany({
            where: { tenantId, roleId: sourceRoleId },
            include: { menu: { select: { code: true } } },
        });
        for (const sp of sourcePerms) {
            await this.prisma.identity.roleMenuPermission.upsert({
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
    async getTemplates(tenantId) {
        return this.prisma.identity.permissionTemplate.findMany({
            where: tenantId
                ? { OR: [{ tenantId }, { tenantId: null }] }
                : undefined,
            orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });
    }
    async applyTemplate(tenantId, roleId, templateId, userId) {
        const template = await this.prisma.identity.permissionTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new Error('Permission template not found');
        const templatePerms = template.permissions;
        const menus = await this.prisma.identity.menu.findMany({
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
    async applyTemplateByCode(tenantId, roleId, templateCode, userId) {
        const template = await this.prisma.identity.permissionTemplate.findUnique({
            where: { code: templateCode },
        });
        if (!template)
            throw new Error(`Template not found: ${templateCode}`);
        return this.applyTemplate(tenantId, roleId, template.id, userId);
    }
    async deleteRolePermissions(tenantId, roleId) {
        const result = await this.prisma.identity.roleMenuPermission.deleteMany({
            where: { tenantId, roleId },
        });
        this.invalidateCache(tenantId, roleId);
        return result.count;
    }
    async deleteMenuPermission(tenantId, roleId, menuId) {
        await this.prisma.identity.roleMenuPermission.deleteMany({
            where: { tenantId, roleId, menuId },
        });
        this.invalidateCache(tenantId, roleId);
    }
    async loadRolePermissions(tenantId, roleId) {
        const cacheKey = `${tenantId}:${roleId}`;
        const permissions = await this.prisma.identity.roleMenuPermission.findMany({
            where: { tenantId, roleId },
        });
        const menuIds = permissions.map((p) => p.menuId);
        const menus = await this.prisma.identity.menu.findMany({
            where: { id: { in: menuIds } },
            select: { id: true, code: true, parentId: true },
        });
        const menuIdToCode = new Map(menus.map((m) => [m.id, m.code]));
        const permissionMap = new Map();
        for (const perm of permissions) {
            const menuCode = menuIdToCode.get(perm.menuId);
            if (!menuCode)
                continue;
            permissionMap.set(menuCode, this.toMenuPermissions(perm.menuId, menuCode, perm));
        }
        this.cache.set(cacheKey, permissionMap);
        this.cacheTimestamps.set(cacheKey, Date.now());
        this.logger.debug(`Loaded ${permissions.length} permissions for role ${roleId}`);
    }
    isCacheValid(cacheKey) {
        const ts = this.cacheTimestamps.get(cacheKey);
        if (!ts)
            return false;
        return Date.now() - ts < this.CACHE_TTL_MS;
    }
    invalidateCache(tenantId, roleId) {
        const cacheKey = `${tenantId}:${roleId}`;
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
    }
    invalidateTenantCache(tenantId) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${tenantId}:`)) {
                this.cache.delete(key);
                this.cacheTimestamps.delete(key);
            }
        }
    }
    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
    toMenuPermissions(menuId, menuCode, record) {
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
            restrictedFields: record.restrictedFields,
            inheritFromParent: record.inheritFromParent,
        };
    }
};
exports.MenuPermissionService = MenuPermissionService;
exports.MenuPermissionService = MenuPermissionService = MenuPermissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuPermissionService);
//# sourceMappingURL=menu-permission.service.js.map