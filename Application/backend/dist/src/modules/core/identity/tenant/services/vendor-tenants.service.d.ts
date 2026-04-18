import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class VendorTenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: {
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            industryCode: string | null;
            slug: string;
            domain: string | null;
            logo: string | null;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
            settings: import("@prisma/identity-client/runtime/library").JsonValue | null;
            businessTypeId: string | null;
            tradeProfileJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
        }[];
        total: number;
    }>;
    getById(id: string): Promise<({
        subscriptions: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/identity-client").$Enums.SubscriptionStatus;
            planId: string;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            trialEndsAt: Date | null;
            cancelledAt: Date | null;
            gatewayId: string | null;
        }[];
        profile: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            notes: string | null;
            website: string | null;
            companyLegalName: string | null;
            industry: string | null;
            supportEmail: string | null;
            dbStrategy: import("@prisma/identity-client").$Enums.DbStrategy;
            dbConnectionString: string | null;
            primaryContactName: string | null;
            primaryContactEmail: string | null;
            primaryContactPhone: string | null;
            billingAddress: import("@prisma/identity-client/runtime/library").JsonValue | null;
            gstin: string | null;
            pan: string | null;
            accountManagerId: string | null;
            tags: string[];
            maxDiskQuotaMb: number;
            currentDiskUsageMb: number;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/identity-client").$Enums.TenantStatus;
        industryCode: string | null;
        slug: string;
        domain: string | null;
        logo: string | null;
        onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        settings: import("@prisma/identity-client/runtime/library").JsonValue | null;
        businessTypeId: string | null;
        tradeProfileJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }) | null>;
    listForDbAdmin(page: number, limit: number): Promise<{
        tenants: {
            id: string;
            name: string;
            createdAt: Date;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            slug: string;
        }[];
        total: number;
    }>;
    suspend(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/identity-client").$Enums.TenantStatus;
        industryCode: string | null;
        slug: string;
        domain: string | null;
        logo: string | null;
        onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        settings: import("@prisma/identity-client/runtime/library").JsonValue | null;
        businessTypeId: string | null;
        tradeProfileJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }>;
    activate(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/identity-client").$Enums.TenantStatus;
        industryCode: string | null;
        slug: string;
        domain: string | null;
        logo: string | null;
        onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        settings: import("@prisma/identity-client/runtime/library").JsonValue | null;
        businessTypeId: string | null;
        tradeProfileJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }>;
}
