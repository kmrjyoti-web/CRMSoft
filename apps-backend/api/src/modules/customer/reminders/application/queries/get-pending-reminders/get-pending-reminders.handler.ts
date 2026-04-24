// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetPendingRemindersQuery } from './get-pending-reminders.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetPendingRemindersQuery)
export class GetPendingRemindersHandler implements IQueryHandler<GetPendingRemindersQuery> {
    private readonly logger = new Logger(GetPendingRemindersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPendingRemindersQuery) {
    try {
      const where: any = { isActive: true, isSent: false, scheduledAt: { lte: new Date() } };
      if (query.recipientId) where.recipientId = query.recipientId;

      const [data, total] = await Promise.all([
        this.prisma.working.reminder.findMany({
          where,
          orderBy: { scheduledAt: 'asc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        this.prisma.working.reminder.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetPendingRemindersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
