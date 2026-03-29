// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOverdueFollowUpsQuery } from './get-overdue-follow-ups.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetOverdueFollowUpsQuery)
export class GetOverdueFollowUpsHandler implements IQueryHandler<GetOverdueFollowUpsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOverdueFollowUpsQuery) {
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
  }
}
