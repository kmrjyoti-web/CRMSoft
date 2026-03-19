// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReminderListQuery } from './get-reminder-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetReminderListQuery)
export class GetReminderListHandler implements IQueryHandler<GetReminderListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReminderListQuery) {
    const where: any = { isActive: true };
    if (query.recipientId) where.recipientId = query.recipientId;
    if (query.channel) where.channel = query.channel;
    if (query.isSent !== undefined) where.isSent = query.isSent;

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
