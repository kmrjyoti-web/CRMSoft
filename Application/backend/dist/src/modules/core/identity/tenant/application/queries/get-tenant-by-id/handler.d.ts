import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetTenantByIdQuery } from './query';
export declare class GetTenantByIdHandler implements IQueryHandler<GetTenantByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTenantByIdQuery): Promise<{
        subscriptions: ({
            plan: {
                id: string;
                name: string;
                code: string;
                description: string | null;
                isActive: boolean;
                configJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                currency: string;
                interval: import("@prisma/identity-client").$Enums.PlanInterval;
                price: import("@prisma/identity-client/runtime/library").Decimal;
                maxUsers: number;
                maxContacts: number;
                maxLeads: number;
                maxProducts: number;
                maxStorage: number;
                features: import("@prisma/identity-client").$Enums.FeatureFlag[];
            };
        } & {
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
        })[];
        usage: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            usersCount: number;
            contactsCount: number;
            leadsCount: number;
            productsCount: number;
            storageMb: number;
            lastCalculated: Date | null;
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
    }>;
}
