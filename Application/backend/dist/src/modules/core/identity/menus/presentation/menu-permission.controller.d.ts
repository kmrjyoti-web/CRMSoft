import { ApiResponse } from '../../../../../common/utils/api-response';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { MenuPermissionService, MenuPermissions } from '../application/services/menu-permission.service';
export declare class MenuPermissionController {
    private readonly menuPermissionService;
    private readonly prisma;
    constructor(menuPermissionService: MenuPermissionService, prisma: PrismaService);
    getRolePermissions(roleId: string, tenantId: string): Promise<ApiResponse<MenuPermissions[]>>;
    getMenuPermission(roleId: string, menuCode: string, tenantId: string): Promise<ApiResponse<MenuPermissions | null>>;
    getMatrix(roleId: string, tenantId: string): Promise<ApiResponse<import("../application/services/menu-permission.service").PermissionMatrixRow[]>>;
    getFullMatrix(tenantId: string): Promise<ApiResponse<{
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
    }>>;
    setMenuPermission(roleId: string, menuId: string, body: {
        menuCode: string;
    } & Partial<MenuPermissions>, tenantId: string, userId: string): Promise<ApiResponse<MenuPermissions>>;
    bulkSet(roleId: string, body: {
        permissions: Array<{
            menuId: string;
            menuCode: string;
            permissions: Partial<MenuPermissions>;
        }>;
    }, tenantId: string, userId: string): Promise<ApiResponse<{
        count: number;
    }>>;
    copy(body: {
        sourceRoleId: string;
        targetRoleId: string;
    }, tenantId: string, userId: string): Promise<ApiResponse<{
        count: number;
    }>>;
    getTemplates(tenantId: string): Promise<ApiResponse<{
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
    }[]>>;
    createTemplate(body: {
        name: string;
        code: string;
        description?: string;
        permissions: Record<string, Partial<MenuPermissions>>;
    }, tenantId: string): Promise<ApiResponse<{
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
    }>>;
    applyTemplate(body: {
        roleId: string;
        templateId: string;
    }, tenantId: string, userId: string): Promise<ApiResponse<{
        count: number;
    }>>;
    checkPermission(menuCode: string, action: string, user: any): Promise<ApiResponse<{
        allowed: boolean;
        menuCode: string;
        action: string;
    }>>;
    getRestrictedFields(menuCode: string, user: any): Promise<ApiResponse<{
        hiddenFields: string[];
        readOnlyFields: string[];
    }>>;
    deleteRolePermissions(roleId: string, tenantId: string): Promise<ApiResponse<{
        count: number;
    }>>;
    deleteMenuPermission(roleId: string, menuId: string, tenantId: string): Promise<ApiResponse<null>>;
    clearCache(tenantId: string): Promise<ApiResponse<null>>;
}
