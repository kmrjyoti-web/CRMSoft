import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { ActivatePortalDto, CreateMenuCategoryDto, UpdateMenuCategoryDto, UpdatePageOverridesDto, CustomerPortalLoginDto, RequestPasswordResetDto, ResetPasswordDto } from './presentation/dto/customer-portal.dto';
export declare const PORTAL_DEFAULT_ROUTES: {
    key: string;
    label: string;
    icon: string;
    path: string;
}[];
export declare class CustomerPortalService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    login(tenantId: string, dto: CustomerPortalLoginDto): Promise<{
        accessToken: string;
        user: {
            [x: string]: unknown;
        };
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
        availableRoutes: {
            key: string;
            label: string;
            icon: string;
            path: string;
        }[];
        isFirstLogin: boolean;
    }>;
    listCategories(tenantId: string): Promise<({
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
    })[]>;
    createCategory(tenantId: string, createdById: string, dto: CreateMenuCategoryDto): Promise<{
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
    }>;
    updateCategory(tenantId: string, id: string, dto: UpdateMenuCategoryDto): Promise<{
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
    }>;
    deleteCategory(tenantId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getEligibleEntities(tenantId: string): Promise<{
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
    }>;
    activatePortal(tenantId: string, createdById: string, dto: ActivatePortalDto): Promise<{
        temporaryPassword: string;
    }>;
    listPortalUsers(tenantId: string): Promise<({
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
    })[]>;
    getPortalUser(tenantId: string, id: string): Promise<{
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
    }>;
    updatePortalUser(tenantId: string, id: string, data: {
        isActive?: boolean;
        menuCategoryId?: string | null;
    }): Promise<{
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
    }>;
    updatePageOverrides(tenantId: string, id: string, dto: UpdatePageOverridesDto): Promise<{
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
    }>;
    deactivatePortalUser(tenantId: string, id: string): Promise<{
        deactivated: boolean;
    }>;
    resetUserPassword(tenantId: string, id: string): Promise<{
        temporaryPassword: string;
    }>;
    requestPasswordReset(tenantId: string, dto: RequestPasswordResetDto): Promise<{
        message: string;
        debug_token?: undefined;
    } | {
        message: string;
        debug_token: string;
    }>;
    resetPassword(tenantId: string, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getAnalytics(tenantId: string): Promise<{
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
    }>;
    seedDefaultCategories(tenantId: string, createdById: string): Promise<{
        seeded: boolean;
    }>;
    getMe(tenantId: string, userId: string): Promise<{
        availableRoutes: {
            key: string;
            label: string;
            icon: string;
            path: string;
        }[];
    }>;
    updateMe(tenantId: string, userId: string, data: {
        displayName?: string;
        phone?: string;
    }): Promise<{
        [x: string]: unknown;
    }>;
    changeMyPassword(tenantId: string, userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private mapCustomerUser;
    private resolveRoutes;
    private generateTempPassword;
    private generateToken;
}
