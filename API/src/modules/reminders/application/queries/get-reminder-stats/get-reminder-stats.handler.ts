import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReminderStatsQuery } from './get-reminder-stats.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetReminderStatsQuery)
export class GetReminderStatsHandler implements IQueryHandler<GetReminderStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReminderStatsQuery) {
    const where: any = { isActive: true };
    if (query.userId) where.recipientId = query.userId;

    const [total, sent, pending, byChannel] = await Promise.all([
      this.prisma.reminder.count({ where }),
      this.prisma.reminder.count({ where: { ...where, isSent: true } }),
      this.prisma.reminder.count({ where: { ...where, isSent: false } }),
      this.prisma.reminder.groupBy({ by: ['channel'], where, _count: true }),
    ]);

    return {
      total, sent, pending,
      byChannel: byChannel.map((g) => ({ channel: g.channel, count: g._count })),
    };
  }
}
