import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationStatsQuery } from './get-notification-stats.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationStatsQuery)
export class GetNotificationStatsHandler implements IQueryHandler<GetNotificationStatsQuery> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationStatsQuery) {
    return this.notificationCore.getStats(query.userId);
  }
}
