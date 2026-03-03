import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetWorkflowStatsQuery } from './get-workflow-stats.query';

@QueryHandler(GetWorkflowStatsQuery)
export class GetWorkflowStatsHandler implements IQueryHandler<GetWorkflowStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkflowStatsQuery) {
    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;

    const [totalWorkflows, activeInstances, completedInstances, pendingApprovals, slaBreaches] =
      await Promise.all([
        this.prisma.workflow.count({ where: { ...where, isActive: true } }),
        this.prisma.workflowInstance.count({ where: { ...where, isActive: true } }),
        this.prisma.workflowInstance.count({ where: { ...where, isActive: false } }),
        this.prisma.workflowApproval.count({ where: { status: 'PENDING' } }),
        this.prisma.workflowSlaEscalation.count({ where: { isResolved: false } }),
      ]);

    const instancesByState = await this.prisma.workflowInstance.groupBy({
      by: ['currentStateId'],
      where: { isActive: true, ...where },
      _count: true,
    });

    return {
      totalWorkflows,
      activeInstances,
      completedInstances,
      pendingApprovals,
      slaBreaches,
      instancesByState,
    };
  }
}
