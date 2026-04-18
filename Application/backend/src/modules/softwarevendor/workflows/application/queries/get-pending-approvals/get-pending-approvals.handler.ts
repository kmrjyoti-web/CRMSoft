import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPendingApprovalsQuery } from './get-pending-approvals.query';

@QueryHandler(GetPendingApprovalsQuery)
export class GetPendingApprovalsHandler implements IQueryHandler<GetPendingApprovalsQuery> {
    private readonly logger = new Logger(GetPendingApprovalsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPendingApprovalsQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetPendingApprovalsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
