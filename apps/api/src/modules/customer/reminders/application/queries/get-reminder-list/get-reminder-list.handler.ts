// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetReminderListQuery } from './get-reminder-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetReminderListQuery)
export class GetReminderListHandler implements IQueryHandler<GetReminderListQuery> {
    private readonly logger = new Logger(GetReminderListHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReminderListQuery) {
    try {
      const where: any = { isActive: true };
      if (query.recipientId) where.recipientId = query.recipientId;
      if (query.channel) where.channel = query.channel;
      if (query.isSent !== undefined) where.isSent = query.isSent;

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
      this.logger.error(`GetReminderListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
