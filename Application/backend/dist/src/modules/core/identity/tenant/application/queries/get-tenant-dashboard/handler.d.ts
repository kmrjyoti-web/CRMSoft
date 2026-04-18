import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetTenantDashboardQuery } from './query';
export declare class GetTenantDashboardHandler implements IQueryHandler<GetTenantDashboardQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTenantDashboardQuery): Promise<{
        tenant: {
            name: string;
            status: import("@prisma/identity-client").$Enums.TenantStatus;
            onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        };
        plan: {
            name: string;
            code: string;
        } | null;
        usage: {
            usersCount: number;
            contactsCount: number;
            leadsCount: number;
            productsCount: number;
        } | null;
        limits: {
            maxUsers: number;
            maxContacts: number;
            maxLeads: number;
            maxProducts: number;
        } | null;
    }>;
}
