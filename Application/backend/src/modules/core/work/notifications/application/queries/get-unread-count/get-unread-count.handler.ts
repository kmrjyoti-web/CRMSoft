import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { NotificationCoreService } from '../../../services/notification-core.service';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler implements IQueryHandler<GetUnreadCountQuery> {
    private readonly logger = new Logger(GetUnreadCountHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(query: GetUnreadCountQuery) {
    try {
      return this.notificationCore.getUnreadCount(query.userId);
    } catch (error) {
      this.logger.error(`GetUnreadCountHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
