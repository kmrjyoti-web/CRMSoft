import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationByIdQuery } from './get-notification-by-id.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationByIdQuery)
export class GetNotificationByIdHandler implements IQueryHandler<GetNotificationByIdQuery> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationByIdQuery) {
    return this.notificationCore.getById(query.id, query.userId);
  }
}
