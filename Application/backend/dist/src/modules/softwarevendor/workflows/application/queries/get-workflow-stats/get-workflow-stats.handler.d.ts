import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWorkflowStatsQuery } from './get-workflow-stats.query';
export declare class GetWorkflowStatsHandler implements IQueryHandler<GetWorkflowStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetWorkflowStatsQuery): Promise<{
        totalWorkflows: number;
        activeInstances: number;
        completedInstances: number;
        pendingApprovals: number;
        slaBreaches: number;
        instancesByState: (import("@prisma/working-client").Prisma.PickEnumerable<import("@prisma/working-client").Prisma.WorkflowInstanceGroupByOutputType, "currentStateId"[]> & {
            _count: number;
        })[];
    }>;
}
