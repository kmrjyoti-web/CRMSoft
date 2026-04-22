import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
    private readonly logger = new Logger(GetNotificationsHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationsQuery) {
    try {
      return this.notificationCore.getNotifications(query.userId, {
        page: query.page,
        limit: query.limit,
        category: query.category,
        status: query.status,
        priority: query.priority,
      });
    } catch (error) {
      this.logger.error(`GetNotificationsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
