import { IQueryHandler } from '@nestjs/cqrs';
import { GetRetentionPoliciesQuery } from './get-retention-policies.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetRetentionPoliciesHandler implements IQueryHandler<GetRetentionPoliciesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(_query: GetRetentionPoliciesQuery): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/identity-client").$Enums.AuditEntityType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        retentionDays: number;
        archiveEnabled: boolean;
    }[]>;
}
