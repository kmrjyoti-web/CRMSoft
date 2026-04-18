import { ApiResponse } from '../../../../common/utils/api-response';
import { CustomerPortalService } from '../customer-portal.service';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto, ActivatePortalDto, UpdatePageOverridesDto } from './dto/customer-portal.dto';
export declare class AdminPortalController {
    private readonly service;
    constructor(service: CustomerPortalService);
    getEligible(tenantId: string): Promise<ApiResponse<{
        contacts: {
            id: unknown;
            type: string;
            name: string;
            activated: boolean;
        }[];
        organizations: {
            id: unknown;
            type: string;
            name: unknown;
            activated: boolean;
        }[];
    }>>;
    listUsers(tenantId: string): Promise<ApiResponse<({
        menuCategory: {
            id: string;
            name: string;
            icon: string | null;
        } | null;
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        displayName: string;
        companyName: string | null;
        email: string;
        gstin: string | null;
        phone: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        passwordHash: string;
        linkedEntityType: string;
        linkedEntityId: string;
        avatarUrl: string | null;
        linkedEntityName: string;
        menuCategoryId: string | null;
        pageOverrides: import("@prisma/identity-client/runtime/library").JsonValue;
        isFirstLogin: boolean;
        loginCount: number;
        failedAttempts: number;
        lockedUntil: Date | null;
        refreshTokenExp: Date | null;
        passwordResetToken: string | null;
        passwordResetExp: Date | null;
    })[]>>;
    getUser(tenantId: string, id: string): Promise<ApiResponse<{
        menuCategory: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isDefault: boolean;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            color: string | null;
            icon: string | null;
            sortOrder: number;
            nameHi: string | null;
            enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
        } | null;
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        displayName: string;
        companyName: string | null;
        email: string;
        gstin: string | null;
        phone: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        passwordHash: string;
        linkedEntityType: string;
        linkedEntityId: string;
        avatarUrl: string | null;
        linkedEntityName: string;
        menuCategoryId: string | null;
        pageOverrides: import("@prisma/identity-client/runtime/library").JsonValue;
        isFirstLogin: boolean;
        loginCount: number;
        failedAttempts: number;
        lockedUntil: Date | null;
        refreshTokenExp: Date | null;
        passwordResetToken: string | null;
        passwordResetExp: Date | null;
    }>>;
    activate(tenantId: string, userId: string, dto: ActivatePortalDto): Promise<ApiResponse<{
        temporaryPassword: string;
    }>>;
    updateUser(tenantId: string, id: string, body: {
        isActive?: boolean;
        menuCategoryId?: string | null;
    }): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        displayName: string;
        companyName: string | null;
        email: string;
        gstin: string | null;
        phone: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        passwordHash: string;
        linkedEntityType: string;
        linkedEntityId: string;
        avatarUrl: string | null;
        linkedEntityName: string;
        menuCategoryId: string | null;
        pageOverrides: import("@prisma/identity-client/runtime/library").JsonValue;
        isFirstLogin: boolean;
        loginCount: number;
        failedAttempts: number;
        lockedUntil: Date | null;
        refreshTokenExp: Date | null;
        passwordResetToken: string | null;
        passwordResetExp: Date | null;
    }>>;
    updatePageOverrides(tenantId: string, id: string, dto: UpdatePageOverridesDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        displayName: string;
        companyName: string | null;
        email: string;
        gstin: string | null;
        phone: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
        passwordHash: string;
        linkedEntityType: string;
        linkedEntityId: string;
        avatarUrl: string | null;
        linkedEntityName: string;
        menuCategoryId: string | null;
        pageOverrides: import("@prisma/identity-client/runtime/library").JsonValue;
        isFirstLogin: boolean;
        loginCount: number;
        failedAttempts: number;
        lockedUntil: Date | null;
        refreshTokenExp: Date | null;
        passwordResetToken: string | null;
        passwordResetExp: Date | null;
    }>>;
    resetPassword(tenantId: string, id: string): Promise<ApiResponse<{
        temporaryPassword: string;
    }>>;
    deactivate(tenantId: string, id: string): Promise<ApiResponse<{
        deactivated: boolean;
    }>>;
    listCategories(tenantId: string): Promise<ApiResponse<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isDefault: boolean;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        color: string | null;
        icon: string | null;
        sortOrder: number;
        nameHi: string | null;
        enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
    })[]>>;
    createCategory(tenantId: string, userId: string, dto: CreateMenuCategoryDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isDefault: boolean;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        color: string | null;
        icon: string | null;
        sortOrder: number;
        nameHi: string | null;
        enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
    }>>;
    updateCategory(tenantId: string, id: string, dto: UpdateMenuCategoryDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isDefault: boolean;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        color: string | null;
        icon: string | null;
        sortOrder: number;
        nameHi: string | null;
        enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
    }>>;
    deleteCategory(tenantId: string, id: string): Promise<ApiResponse<{
        deleted: boolean;
    }>>;
    getAnalytics(tenantId: string): Promise<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        loginsToday: number;
        recentLogs: {
            id: string;
            tenantId: string;
            createdAt: Date;
            metadata: import("@prisma/identity-client/runtime/library").JsonValue | null;
            action: string;
            route: string | null;
            userAgent: string | null;
            ipAddress: string | null;
            customerUserId: string;
        }[];
    }>>;
    seedDefaults(tenantId: string, userId: string): Promise<ApiResponse<{
        seeded: boolean;
    }>>;
    getAvailableRoutes(): ApiResponse<{
        key: string;
        label: string;
        icon: string;
        path: string;
    }[]>;
}
