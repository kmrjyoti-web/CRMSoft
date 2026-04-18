import { IQueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { NotificationCoreService } from '../../../services/notification-core.service';
export declare class GetUnreadCountHandler implements IQueryHandler<GetUnreadCountQuery> {
    private readonly notificationCore;
    private readonly logger;
    constructor(notificationCore: NotificationCoreService);
    execute(query: GetUnreadCountQuery): Promise<{
        total: number;
        byCategory: Record<string, number>;
    }>;
}
