// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPendingRemindersQuery } from './get-pending-reminders.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetPendingRemindersQuery)
export class GetPendingRemindersHandler implements IQueryHandler<GetPendingRemindersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPendingRemindersQuery) {
    const where: any = { isActive: true, isSent: false, scheduledAt: { lte: new Date() } };
    if (query.recipientId) where.recipientId = query.recipientId;

    const [data, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        include: { recipient: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { scheduledAt: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
