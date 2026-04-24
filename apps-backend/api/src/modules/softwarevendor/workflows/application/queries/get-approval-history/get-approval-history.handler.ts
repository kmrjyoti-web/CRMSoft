import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetApprovalHistoryQuery } from './get-approval-history.query';

@QueryHandler(GetApprovalHistoryQuery)
export class GetApprovalHistoryHandler implements IQueryHandler<GetApprovalHistoryQuery> {
    private readonly logger = new Logger(GetApprovalHistoryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetApprovalHistoryQuery) {
    try {
      const where: any = { status: { not: 'PENDING' } };
      if (query.userId) {
        where.OR = [{ requestedById: query.userId }, { approvedById: query.userId }];
      }

      return this.prisma.workflowApproval.findMany({
        where,
        include: {
          instance: {
            select: { id: true, entityType: true, entityId: true, workflow: { select: { name: true } } },
          },
          transition: { select: { id: true, name: true, code: true } },
        },
        orderBy: { decidedAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      this.logger.error(`GetApprovalHistoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
