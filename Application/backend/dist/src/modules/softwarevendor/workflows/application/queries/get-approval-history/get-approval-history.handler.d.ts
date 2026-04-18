import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetApprovalHistoryQuery } from './get-approval-history.query';
export declare class GetApprovalHistoryHandler implements IQueryHandler<GetApprovalHistoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetApprovalHistoryQuery): Promise<({
        instance: {
            id: string;
            entityType: string;
            workflow: {
                name: string;
            };
            entityId: string;
        };
        transition: {
            id: string;
            name: string;
            code: string;
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
        status: import("@prisma/working-client").$Enums.WorkflowApprovalStatus;
        comment: string | null;
        instanceId: string;
        transitionId: string;
        requestedById: string;
        approvedById: string | null;
        expiresAt: Date | null;
        decidedAt: Date | null;
    })[]>;
}
