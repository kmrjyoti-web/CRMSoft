import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPendingApprovalsQuery } from './get-pending-approvals.query';
export declare class GetPendingApprovalsHandler implements IQueryHandler<GetPendingApprovalsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetPendingApprovalsQuery): Promise<({
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
            toState: {
                name: string;
                code: string;
            };
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
