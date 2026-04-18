import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListTenantsQuery } from './query';
export declare class ListTenantsHandler implements IQueryHandler<ListTenantsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListTenantsQuery): Promise<{
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
        page: number;
        limit: number;
    }>;
}
