import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetInstanceHistoryQuery } from './get-instance-history.query';

@QueryHandler(GetInstanceHistoryQuery)
export class GetInstanceHistoryHandler implements IQueryHandler<GetInstanceHistoryQuery> {
    private readonly logger = new Logger(GetInstanceHistoryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetInstanceHistoryQuery) {
    try {
      return this.prisma.workflowHistory.findMany({
        where: { instanceId: query.instanceId },
        include: {
          fromState: { select: { id: true, name: true, code: true, color: true } },
          toState: { select: { id: true, name: true, code: true, color: true } },
          transition: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`GetInstanceHistoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
