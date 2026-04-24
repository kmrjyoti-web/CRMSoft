import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetNotificationByIdQuery } from './get-notification-by-id.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetNotificationByIdQuery)
export class GetNotificationByIdHandler implements IQueryHandler<GetNotificationByIdQuery> {
    private readonly logger = new Logger(GetNotificationByIdHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetNotificationByIdQuery) {
    try {
      return this.notificationCore.getById(query.id, query.userId);
    } catch (error) {
      this.logger.error(`GetNotificationByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
