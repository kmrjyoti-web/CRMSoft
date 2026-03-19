import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationsQuery) {
    return this.notificationCore.getNotifications(query.userId, {
      page: query.page,
      limit: query.limit,
      category: query.category,
      status: query.status,
      priority: query.priority,
    });
  }
}
