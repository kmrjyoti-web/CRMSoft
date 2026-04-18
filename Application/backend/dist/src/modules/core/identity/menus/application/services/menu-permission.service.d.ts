import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import' | 'bulkUpdate' | 'bulkDelete' | 'approve' | 'assign' | 'transfer' | 'viewAll' | 'editAll' | 'deleteAll';
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
export interface PermissionMatrixRow {
    menuId: string;
    menuCode: string;
    menuName: string;
    menuType: string;
    parentId: string | null;
    permissions: MenuPermissions;
}
export declare class MenuPermissionService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private cache;
    private cacheTimestamps;
    private readonly CACHE_TTL_MS;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    hasPermission(tenantId: string, roleId: string, menuCode: string, action: PermissionAction, roleName?: string): Promise<boolean>;
    hasAnyPermission(tenantId: string, roleId: string, menuCode: string, actions: PermissionAction[], roleName?: string): Promise<boolean>;
    hasAllPermissions(tenantId: string, roleId: string, menuCode: string, actions: PermissionAction[], roleName?: string): Promise<boolean>;
    getPermissions(tenantId: string, roleId: string, menuCode: string): Promise<MenuPermissions | null>;
    getAllPermissionsForRole(tenantId: string, roleId: string): Promise<Map<string, MenuPermissions>>;
    getRestrictedFields(tenantId: string, roleId: string, menuCode: string): Promise<{
        hiddenFields: string[];
        readOnlyFields: string[];
    }>;
    getMatrix(tenantId: string, roleId: string): Promise<PermissionMatrixRow[]>;
    getFullMatrix(tenantId: string): Promise<{
        roles: Array<{
            id: string;
            name: string;
            displayName: string;
        }>;
        menus: Array<{
            id: string;
            code: string;
            name: string;
            parentId: string | null;
        }>;
        matrix: Record<string, Record<string, MenuPermissions | null>>;
    }>;
    setPermissions(tenantId: string, roleId: string, menuId: string, menuCode: string, permissions: Partial<Omit<MenuPermissions, 'menuId' | 'menuCode'>>, userId?: string): Promise<MenuPermissions>;
    bulkSetPermissions(tenantId: string, roleId: string, items: Array<{
        menuId: string;
        menuCode: string;
        permissions: Partial<Omit<MenuPermissions, 'menuId' | 'menuCode'>>;
    }>, userId?: string): Promise<number>;
    copyPermissions(tenantId: string, sourceRoleId: string, targetRoleId: string, userId?: string): Promise<number>;
    getTemplates(tenantId?: string): Promise<{
        id: string;
        tenantId: string | null;
        name: string;
        code: string;
        description: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        isSystem: boolean;
        permissions: import("@prisma/identity-client/runtime/library").JsonValue;
    }[]>;
    applyTemplate(tenantId: string, roleId: string, templateId: string, userId?: string): Promise<number>;
    applyTemplateByCode(tenantId: string, roleId: string, templateCode: string, userId?: string): Promise<number>;
    deleteRolePermissions(tenantId: string, roleId: string): Promise<number>;
    deleteMenuPermission(tenantId: string, roleId: string, menuId: string): Promise<void>;
    private loadRolePermissions;
    private isCacheValid;
    invalidateCache(tenantId: string, roleId: string): void;
    invalidateTenantCache(tenantId: string): void;
    clearCache(): void;
    private toMenuPermissions;
}
