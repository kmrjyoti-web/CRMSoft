import { VendorTenantsService } from '../services/vendor-tenants.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorTenantsController {
    private readonly vendorTenantsService;
    constructor(vendorTenantsService: VendorTenantsService);
    list(status?: string, page?: string, limit?: string): Promise<ApiResponse<{
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
    }[]>>;
    getById(id: string): Promise<ApiResponse<({
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
    }) | null>>;
    suspend(id: string): Promise<ApiResponse<{
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
    }>>;
    activate(id: string): Promise<ApiResponse<{
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
    }>>;
    extendTrial(id: string, body: {
        days: number;
    }): Promise<ApiResponse<{
        tenantId: string;
        daysExtended: number;
    }>>;
}
