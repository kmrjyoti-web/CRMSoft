import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class ModuleAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getByPlan(planId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        moduleCode: string;
        accessLevel: import("@prisma/identity-client").$Enums.ModuleAccessLevel;
        customConfig: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }[]>;
    upsertAccess(planId: string, modules: Array<{
        moduleCode: string;
        accessLevel: string;
        customConfig?: Record<string, unknown>;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        moduleCode: string;
        accessLevel: import("@prisma/identity-client").$Enums.ModuleAccessLevel;
        customConfig: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }[]>;
    checkAccess(tenantId: string, moduleCode: string): Promise<{
        allowed: boolean;
        accessLevel: string;
    }>;
    getAccessMatrix(): Promise<{
        plans: {
            id: string;
            name: string;
            code: string;
            moduleAccess: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                planId: string;
                moduleCode: string;
                accessLevel: import("@prisma/identity-client").$Enums.ModuleAccessLevel;
                customConfig: import("@prisma/identity-client/runtime/library").JsonValue | null;
            }[];
        }[];
        modules: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            version: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: import("@prisma/platform-client").$Enums.ModuleCategory;
            sortOrder: number;
            source: string;
            industryCode: string | null;
            features: import("@prisma/platform-client/runtime/library").JsonValue;
            moduleStatus: import("@prisma/platform-client").$Enums.ModuleStatus;
            isCore: boolean;
            iconName: string | null;
            dependsOn: string[];
            autoEnables: string[];
            menuKeys: string[];
            applicableTypes: import("@prisma/platform-client/runtime/library").JsonValue;
            vendorId: string | null;
            defaultPricingType: import("@prisma/platform-client").$Enums.ModulePricingType;
            isFreeInBase: boolean;
            basePrice: import("@prisma/platform-client/runtime/library").Decimal;
            priceMonthly: import("@prisma/platform-client/runtime/library").Decimal | null;
            priceYearly: import("@prisma/platform-client/runtime/library").Decimal | null;
            oneTimeSetupFee: import("@prisma/platform-client/runtime/library").Decimal | null;
            trialDays: number;
            trialFeatures: string[];
            usagePricing: import("@prisma/platform-client/runtime/library").JsonValue | null;
            requiresCredentials: boolean;
            credentialSchema: import("@prisma/platform-client/runtime/library").JsonValue | null;
            isFeatured: boolean;
        }[];
    }>;
}
