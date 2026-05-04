import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetNotificationStatsQuery } from './get-notification-stats.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationStatsQuery)
export class GetNotificationStatsHandler implements IQueryHandler<GetNotificationStatsQuery> {
    private readonly logger = new Logger(GetNotificationStatsHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationStatsQuery) {
    try {
      return this.notificationCore.getStats(query.userId);
    } catch (error) {
      this.logger.error(`GetNotificationStatsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
