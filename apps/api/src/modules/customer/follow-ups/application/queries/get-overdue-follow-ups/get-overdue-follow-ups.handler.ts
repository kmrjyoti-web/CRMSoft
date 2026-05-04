// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetOverdueFollowUpsQuery } from './get-overdue-follow-ups.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetOverdueFollowUpsQuery)
export class GetOverdueFollowUpsHandler implements IQueryHandler<GetOverdueFollowUpsQuery> {
    private readonly logger = new Logger(GetOverdueFollowUpsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOverdueFollowUpsQuery) {
    try {
      const where: any = { isActive: true, isOverdue: true, completedAt: null };
      if (query.assignedToId) where.assignedToId = query.assignedToId;

      const [data, total] = await Promise.all([
        this.prisma.working.followUp.findMany({
          where,
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { dueDate: 'asc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        this.prisma.working.followUp.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetOverdueFollowUpsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
