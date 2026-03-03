import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler implements IQueryHandler<GetUnreadCountQuery> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetUnreadCountQuery) {
    return this.notificationCore.getUnreadCount(query.userId);
  }
}
