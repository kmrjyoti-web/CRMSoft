import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPendingApprovalsQuery } from './get-pending-approvals.query';

@QueryHandler(GetPendingApprovalsQuery)
export class GetPendingApprovalsHandler implements IQueryHandler<GetPendingApprovalsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPendingApprovalsQuery) {
    return this.prisma.workflowApproval.findMany({
      where: { status: 'PENDING' },
      include: {
        instance: {
          select: { id: true, entityType: true, entityId: true, workflow: { select: { name: true } } },
        },
        transition: {
          select: { id: true, name: true, code: true, toState: { select: { name: true, code: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
