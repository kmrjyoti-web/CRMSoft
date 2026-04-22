import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetManagerReminderStatsQuery } from './get-manager-reminder-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetManagerReminderStatsQuery)
export class GetManagerReminderStatsHandler implements IQueryHandler<GetManagerReminderStatsQuery> {
    private readonly logger = new Logger(GetManagerReminderStatsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetManagerReminderStatsQuery) {
    try {
      // Only managers (level 0-3) get aggregate reportee stats
      if (query.roleLevel > 3) {
        return this.getOwnStats(query.userId);
      }

      // Get all reportee IDs
      const reportees = await this.prisma.$queryRaw<{ id: string }[]>`
        WITH RECURSIVE chain AS (
          SELECT id FROM users WHERE reporting_to_id = ${query.userId} AND is_deleted = false
          UNION ALL
          SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
        )
        SELECT id FROM chain
      `;
      const allIds = [query.userId, ...reportees.map(r => r.id)];

      const where = { recipientId: { in: allIds }, isActive: true };

      const [total, pending, sent, missed, snoozed] = await Promise.all([
        this.prisma.working.reminder.count({ where }),
        this.prisma.working.reminder.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.working.reminder.count({ where: { ...where, status: 'SENT' } }),
        this.prisma.working.reminder.count({ where: { ...where, status: 'MISSED' } }),
        this.prisma.working.reminder.count({ where: { ...where, status: 'SNOOZED' } }),
      ]);

      // Manager stats: counts only, NO content/titles (privacy)
      return { total, pending, sent, missed, snoozed, reporteeCount: reportees.length };
    } catch (error) {
      this.logger.error(`GetManagerReminderStatsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  private async getOwnStats(userId: string) {
    const where = { recipientId: userId, isActive: true };
    const [total, pending, sent, missed, snoozed] = await Promise.all([
      this.prisma.working.reminder.count({ where }),
      this.prisma.working.reminder.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.working.reminder.count({ where: { ...where, status: 'SENT' } }),
      this.prisma.working.reminder.count({ where: { ...where, status: 'MISSED' } }),
      this.prisma.working.reminder.count({ where: { ...where, status: 'SNOOZED' } }),
    ]);
    return { total, pending, sent, missed, snoozed, reporteeCount: 0 };
  }
}
