import { IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationStatsQuery } from './get-notification-stats.query';
import { NotificationCoreService } from '../../../services/notification-core.service';
export declare class GetNotificationStatsHandler implements IQueryHandler<GetNotificationStatsQuery> {
    private readonly notificationCore;
    private readonly logger;
    constructor(notificationCore: NotificationCoreService);
    execute(query: GetNotificationStatsQuery): Promise<{
        total: number;
        unread: number;
        read: number;
        dismissed: number;
        byCategory: {
            category: import("@prisma/working-client").$Enums.NotificationCategory;
            count: number;
        }[];
        byPriority: {
            priority: import("@prisma/working-client").$Enums.NotificationPriority;
            count: number;
        }[];
    }>;
}
