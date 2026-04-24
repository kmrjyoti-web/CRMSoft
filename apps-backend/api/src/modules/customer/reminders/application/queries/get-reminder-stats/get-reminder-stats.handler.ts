import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetReminderStatsQuery } from './get-reminder-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetReminderStatsQuery)
export class GetReminderStatsHandler implements IQueryHandler<GetReminderStatsQuery> {
    private readonly logger = new Logger(GetReminderStatsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReminderStatsQuery) {
    try {
      const where: any = { isActive: true };
      if (query.userId) where.recipientId = query.userId;

      const [total, sent, pending, byChannel] = await Promise.all([
        this.prisma.working.reminder.count({ where }),
        this.prisma.working.reminder.count({ where: { ...where, isSent: true } }),
        this.prisma.working.reminder.count({ where: { ...where, isSent: false } }),
        this.prisma.working.reminder.groupBy({ by: ['channel'], where, _count: true }),
      ]);

      return {
        total, sent, pending,
        byChannel: byChannel.map((g) => ({ channel: g.channel, count: g._count })),
      };
    } catch (error) {
      this.logger.error(`GetReminderStatsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
